import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
} from 'n8n-workflow';
import { createHash } from 'node:crypto';
import { ERS_APP_V1_BASE_URL } from './shared/api.constants';
import { resourceDescription } from './resources/resource';
import { projectDescription } from './resources/project';
import { bookingDescription } from './resources/booking';
import { requirementDescription } from './resources/requirement';
import { timesheetDescription } from './resources/timesheet';

interface AccessTokenErrorShape {
	message?: string;
	messages?: Array<string | { message?: string }>;
}

function isAccessTokenError(error: unknown): error is AccessTokenErrorShape {
	const err = error as AccessTokenErrorShape;

	if (typeof err.message === 'string' && err.message.includes('access token')) {
		return true;
	}

	if (Array.isArray(err.messages)) {
		return err.messages.some((msg) => {
			if (typeof msg === 'string') {
				return msg.includes('access token');
			}

			if (msg && typeof msg === 'object' && 'message' in msg && typeof msg.message === 'string') {
				return msg.message.includes('access token');
			}

			return false;
		});
	}

	return false;
}

//resource response shape
interface ResourceTypeField {
	id?: number;
	code: string;
	display_name?: string;
	field_type?: string;
	information_text?: string;
	is_system_defined?: boolean;
	is_required?: boolean;
	options?: Array<{ id: number; name: string; description?: string | null }>;
	placeholder_text?: string;
	maxlength?: number;
	regex?: string;
	mindate?: string;
	maxdate?: string;
	minlength?: number;	
}

interface ResourceType {
	id?: number;
	name?: string;
	description?: string;
	is_human?: boolean;
	color?: string;
	fields?: ResourceTypeField[];
}

interface ProjectTypeField {
	id?: number;
	code: string;
	display_name?: string;
	field_type?: string;
	information_text?: string;
	is_system_defined?: boolean;
	is_required?: boolean;
	options?: Array<{ id: number; name: string; description?: string | null }>;
	placeholder_text?: string;
	maxlength?: number;
	regex?: string;
	mindate?: string;
	maxdate?: string;
	minlength?: number;
}

interface ProjectType {
	id?: number;
	name?: string;
	description?: string;
	color?: string;
	fields?: ProjectTypeField[];
}

interface ProfileFieldOption {
	id: number | string;
	name: string;
	description?: string;
}

interface ProfileField {
	id?: number;
	code: string;
	display_name?: string;
	field_type?: string;
	is_system_defined?: boolean;
	is_required?: boolean;
	options?: ProfileFieldOption[];
	mindate?: string;
	maxdate?: string;
	minlength?: number;
	maxlength?: number;
	regex?: string;
	placeholder_text?: string;
	minnum?: number;
	maxnum?: number;
}

function getOptionDisplayName(
	fieldCode: string,
	opt: { name: string; description?: string | null },
): string {
	if (
		fieldCode === 'timezone' &&
		typeof opt.description === 'string' &&
		opt.description.trim() !== ''
	) {
		return opt.description;
	}
	return opt.name;
}

function mapProfileFieldsFromApi(fields: ProfileField[] | undefined): ProfileField[] {
	if (!Array.isArray(fields)) return [];
	const result: ProfileField[] = [];
	for (const f of fields) {
		if (f?.code) {
			const options: ProfileFieldOption[] | undefined = f.options?.map((opt) => ({
				id: opt.id,
				name: getOptionDisplayName(f.code, opt),
				description: opt.description ?? undefined,
			}));
			result.push({
				...f,
				options,
			});
		}
	}
	return result;
}

function mapPublicApiFieldsToUDF(fields: ResourceTypeField[] | undefined): ResourceUDFField[] {
	if (!Array.isArray(fields)) return [];
	const result: ResourceUDFField[] = [];
	for (const f of fields) {
		if (f?.code) {
			const options: ResourceUDFOption[] | undefined = f.options?.map((opt) => ({
				id: opt.id,
				name: getOptionDisplayName(f.code, opt),
				description: opt.description ?? undefined,
			}));
			result.push({
				id: f.id,
				code: f.code,
				display_name: f.display_name,
				field_type: f.field_type,
				information_text: f.information_text,
				is_system_defined: f.is_system_defined,
				is_required: f.is_required,
				options,
				placeholder_text: f.placeholder_text,
				maxlength: f.maxlength,
				regex: f.regex,
				mindate: f.mindate,
				maxdate: f.maxdate,
				minlength: f.minlength,
			});
		}
	}
	return result;
}

/** Normalize API field_type stored in option JSON (TAGS→TEXT, trim + uppercase) so routing matches ERS variants. */
function normalizeUdfFieldTypeForOption(fieldType: string | undefined): string {
	if (!fieldType) return '';
	if (fieldType === 'TAGS') return 'TEXT';
	return String(fieldType).trim().toUpperCase();
}

// Layer 2: Cache raw API response per resource type (no re-fetch, no re-serialization)
interface ResourceUDFOption {
	id: number | string;
	name: string;
	color?: string;
	description?: string;
	udf_desc_id?: number;
}

interface ResourceUDFField {
	id?: number;
	code: string;
	display_name?: string;
	field_type?: string;
	is_system_defined?: boolean;
	is_required?: boolean;
	help_text?: string;
	information_text?: string;
	options?: ResourceUDFOption[];
	mindate?: string;
	maxdate?: string;
	minlength?: number;
	maxlength?: number;
	regex?: string;
	placeholder_text?: string;
}

// Layer 2: Cache for project UDFs — global UDF list (fetched once) and per–project-type filtered list
interface ProjectUDFOption {
	id: number | string;
	name: string;
	color?: string;
	description?: string;
	udf_desc_id?: number;
}

interface ProjectUDFField {
	id?: number;
	code: string;
	display_name?: string;
	field_type?: string;
	is_system_defined?: boolean;
	is_required?: boolean;
	availability?: number;
	help_text?: string;
	information_text?: string;
	options?: ProjectUDFOption[];
	mindate?: string;
	maxdate?: string;
	minlength?: number;
	maxlength?: number;
	regex?: string;
	placeholder_text?: string;
}

const PROJECT_EXCLUDED_SYSTEM_FIELDS = ['id', 'project_type_id', 'title'];

type ProfileEntityKey = 'booking' | 'timesheet' | 'requirement';
type ProfileFieldListMode = 'mandatory' | 'other' | 'all';

const PROFILE_ENTITY_META: Record<ProfileEntityKey,{ endpoint: string; excludedCodes: string[] }> = {
	booking: {
		endpoint: '/booking/fields',
		excludedCodes: ['resource_id', 'project_id', 'start_time', 'end_time'],
	},
	timesheet: {
		endpoint: '/timesheet/fields',
		excludedCodes: ['resource_id', 'project_id', 'date', 'hours', 'time_start', 'time_end', 'entry_status', 'comment'],
	},
	requirement: {
		endpoint: '/requirement/fields',
		excludedCodes: ['project_id', 'start_time', 'end_time', 'effort', 'unit', 'comment'],
	},
};

type LoadOptionsCacheValue =
	| ResourceType[]
	| ResourceUDFField[]
	| ProjectType[]
	| ProjectUDFField[]
	| ProfileField[];

interface LoadOptionsCacheEntry {
	value: LoadOptionsCacheValue;
	expiresAt: number;
	lastAccess: number;
}

const LOAD_OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000;
const LOAD_OPTIONS_CACHE_MAX_ENTRIES = 300;
const loadOptionsCache = new Map<string, LoadOptionsCacheEntry>();
const loadOptionsInFlight = new Map<string, Promise<LoadOptionsCacheValue>>();

function stableSerializeForHash(value: unknown): string {
	if (value === null || value === undefined) return String(value);
	if (typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((item) => stableSerializeForHash(item)).join(',')}]`;

	const obj = value as Record<string, unknown>;
	const keys = Object.keys(obj).sort();
	return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerializeForHash(obj[key])}`).join(',')}}`;
}

function buildCredentialFingerprint(credentials: unknown): string {
	const serialized = stableSerializeForHash(credentials);
	return createHash('sha256').update(serialized).digest('hex').slice(0, 16);
}

async function getCredentialScopeCacheKey(ctx: ILoadOptionsFunctions): Promise<string> {
	const authentication = (ctx.getNode().parameters as { authentication?: string }).authentication;
	const credentialType = getAuthCredentialType(authentication);
	try {
		const credentials = await ctx.getCredentials(credentialType);
		return `${credentialType}:${buildCredentialFingerprint(credentials)}`;
	} catch {
		return `${credentialType}:missing`;
	}
}

function buildLoadOptionsCacheKey(scope: string, credentialScopeCacheKey: string): string {
	return `${scope}|${credentialScopeCacheKey}`;
}

function getCachedLoadOptionsValue<T extends LoadOptionsCacheValue>(cacheKey: string): T | undefined {
	const cached = loadOptionsCache.get(cacheKey);
	if (!cached) return undefined;

	if (cached.expiresAt <= Date.now()) {
		loadOptionsCache.delete(cacheKey);
		return undefined;
	}

	cached.lastAccess = Date.now();
	return cached.value as T;
}

function setCachedLoadOptionsValue<T extends LoadOptionsCacheValue>(cacheKey: string, value: T): void {
	if (value.length === 0) return;

	const now = Date.now();
	loadOptionsCache.set(cacheKey, {
		value,
		expiresAt: now + LOAD_OPTIONS_CACHE_TTL_MS,
		lastAccess: now,
	});

	if (loadOptionsCache.size <= LOAD_OPTIONS_CACHE_MAX_ENTRIES) return;

	let leastRecentlyUsedKey: string | undefined;
	let oldestAccess = Number.POSITIVE_INFINITY;
	for (const [key, entry] of loadOptionsCache.entries()) {
		if (entry.lastAccess < oldestAccess) {
			oldestAccess = entry.lastAccess;
			leastRecentlyUsedKey = key;
		}
	}
	if (leastRecentlyUsedKey) {
		loadOptionsCache.delete(leastRecentlyUsedKey);
	}
}

async function getCachedOrLoadOptionsValue<T extends LoadOptionsCacheValue>(
	cacheKey: string,
	refresh: boolean,
	loadFn: () => Promise<T>,
): Promise<T> {
	if (refresh) {
		loadOptionsCache.delete(cacheKey);
		loadOptionsInFlight.delete(cacheKey);
	}

	const cached = getCachedLoadOptionsValue<T>(cacheKey);
	if (cached) return cached;

	const inFlight = loadOptionsInFlight.get(cacheKey) as Promise<T> | undefined;
	if (inFlight) return inFlight;

	const loaderPromise: Promise<T> = (async () => {
		const loaded = await loadFn();
		setCachedLoadOptionsValue(cacheKey, loaded);
		return loaded;
	})().finally(() => {
		loadOptionsInFlight.delete(cacheKey);
	});

	loadOptionsInFlight.set(cacheKey, loaderPromise as Promise<LoadOptionsCacheValue>);
	return loaderPromise;
}

function parseProfileFieldCode(fieldName: string): string | undefined {
	let parsed: { code?: string };
	try {
		parsed = JSON.parse(fieldName);
	} catch {
		return undefined;
	}
	return parsed.code;
}

function buildProfileFieldValueOptions(
	fields: ProfileField[] | undefined,
	fieldCode: string,
	search: string | undefined,
): INodePropertyOptions[] {
	if (!fields?.length) return [];
	const field = fields.find((f) => f.code === fieldCode);
	if (!field?.options?.length) return [];

	const searchLower = typeof search === 'string' && search.trim() ? search.trim().toLowerCase() : '';
	const filtered = searchLower
		? field.options.filter((opt) => (opt.name || '').toLowerCase().includes(searchLower))
		: field.options;

	return filtered.slice(0, 500).map((opt) => ({
		name: opt.name || String(opt.id),
		value: opt.id,
	}));
}

async function ensureProfileFieldsCache(
	ctx: ILoadOptionsFunctions,
	entity: ProfileEntityKey,
	invalidateCache: boolean,
): Promise<ProfileField[] | undefined> {
	try {
		const auth = (ctx.getNode().parameters as { authentication?: string }).authentication;
		const credentialType = getAuthCredentialType(auth);
		const meta = PROFILE_ENTITY_META[entity];
		const credentialScopeCacheKey = await getCredentialScopeCacheKey(ctx);
		const cacheKey = buildLoadOptionsCacheKey(`profileFields:${entity}`, credentialScopeCacheKey);

		return await getCachedOrLoadOptionsValue(cacheKey, invalidateCache, async () => {
			const response = await ctx.helpers.httpRequestWithAuthentication.call(ctx, credentialType, {
				method: 'GET',
				url: `${ERS_APP_V1_BASE_URL}${meta.endpoint}`,
				headers: { Accept: 'application/json' },
			}) as { data?: ProfileField[] } | ProfileField[];

			const list = Array.isArray(response) ? response : (response.data ?? []);
			return mapProfileFieldsFromApi(list);
		});
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		ctx.logger.error(`Error fetching ${entity} fields:`, { error });
		return [];
	}
}

function buildProfileFieldListOptions(
	fields: ProfileField[] | undefined,
	entity: ProfileEntityKey,
	mode: ProfileFieldListMode,
): INodePropertyOptions[] {
	const excludedCodes = new Set(PROFILE_ENTITY_META[entity].excludedCodes);
	return (fields ?? [])
		.filter((f) => {
			if (excludedCodes.has(f.code)) return false;
			if (mode === 'mandatory') return f.is_required === true;
			if (mode === 'other') return f.is_required !== true;
			return true;
		})
		.sort((a, b) => {
			if (mode !== 'all') return 0;
			const aRequired = a.is_required === true ? 1 : 0;
			const bRequired = b.is_required === true ? 1 : 0;
			return bRequired - aRequired;
		})
		.map((f) => ({
			name: f.display_name || f.code,
			value: JSON.stringify({
				code: f.code,
				field_type: normalizeUdfFieldTypeForOption(f.field_type),
				has_options: Array.isArray(f.options) && f.options.length > 0,
			}),
		}));
}

async function getProfileFieldListOptions(
	ctx: ILoadOptionsFunctions,
	entity: ProfileEntityKey,
	mode: ProfileFieldListMode,
): Promise<INodePropertyOptions[]> {
	const fields = await ensureProfileFieldsCache(ctx, entity, false);
	return buildProfileFieldListOptions(fields, entity, mode);
}

async function getProfileFieldValueOptionsByFieldName(
	ctx: ILoadOptionsFunctions,
	entity: ProfileEntityKey,
	fieldName: string,
): Promise<INodePropertyOptions[]> {
	const fieldCode = parseProfileFieldCode(fieldName);
	if (!fieldCode) return [];

	const fields = await ensureProfileFieldsCache(ctx, entity, false);

	const search = (
		ctx.getCurrentNodeParameter('fieldValue') ??
		ctx.getCurrentNodeParameter('fieldValueSelect') ??
		ctx.getCurrentNodeParameter('fieldValueMultiSelect')
	) as string | undefined;

	return buildProfileFieldValueOptions(fields, fieldCode, search);
}

async function withProfileFieldListLoader(
	ctx: ILoadOptionsFunctions,
	entity: ProfileEntityKey,
	mode: ProfileFieldListMode,
	errorContext: string,
): Promise<INodePropertyOptions[]> {
	try {
		return await getProfileFieldListOptions(ctx, entity, mode);
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		ctx.logger.error(`Error fetching ${errorContext}:`, { error });
		return [];
	}
}

function getAuthCredentialType(authentication: string | undefined): string {
	return authentication === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2Api';
}

function parseTypeIdParameter(typeId: number | string | undefined | null): string | undefined {
	if (typeId === undefined || typeId === null || typeId === '') {
		return undefined;
	}
	let id: number | string = typeId;
	if (typeof id === 'string') {
		try {
			const parsed = JSON.parse(id);
			if (parsed && typeof parsed === 'object' && 'id' in parsed) {
				id = (parsed as { id: number | string }).id;
			}
		} catch {
			// not JSON
		}
	}
	return String(id);
}

function parseResourceTypeId(resourceTypeId: number | string | undefined | null): string | undefined {
	return parseTypeIdParameter(resourceTypeId);
}

function parseResourceTypesListResponse(
	response: ResourceType[] | { data?: ResourceType[]; items?: ResourceType[] },
): ResourceType[] {
	if (Array.isArray(response)) return response;
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.items)) return response.items;
	return [];
}

function mapResourceTypesToOptions(list: ResourceType[]): INodePropertyOptions[] {
	return list.map((type) => {
		const id = type.id;
		const isHuman = type.is_human === true;
		return {
			name: type.name || `Resource Type ${id}`,
			value: JSON.stringify({ id, is_human: isHuman }),
			description: type.description || undefined,
		};
	});
}

async function fetchResourceTypesList(
	ctx: ILoadOptionsFunctions,
	refresh = false,
): Promise<ResourceType[]> {
	const parameters = ctx.getNode().parameters as { authentication?: string };
	const credentialType = getAuthCredentialType(parameters.authentication);
	try {
		const credentialScopeCacheKey = await getCredentialScopeCacheKey(ctx);
		const cacheKey = buildLoadOptionsCacheKey('resourceTypesList', credentialScopeCacheKey);
		return await getCachedOrLoadOptionsValue(cacheKey, refresh, async () => {
			const response = await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				credentialType,
				{
					method: 'GET',
					url: `${ERS_APP_V1_BASE_URL}/resourcetypes`,
					headers: { Accept: 'application/json' },
				},
			) as ResourceType[] | { data?: ResourceType[]; items?: ResourceType[] };
			return parseResourceTypesListResponse(response);
		});
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		ctx.logger.error('Error fetching resource types:', { error });
		return [];
	}
}

async function fetchResourceTypeFields(
	ctx: ILoadOptionsFunctions,
	resourceTypeIdStr: string,
	refresh = false,
): Promise<ResourceUDFField[]> {
	const parameters = ctx.getNode().parameters as { authentication?: string };
	const credentialType = getAuthCredentialType(parameters.authentication);
	try {
		const credentialScopeCacheKey = await getCredentialScopeCacheKey(ctx);
		const cacheKey = buildLoadOptionsCacheKey(`resourceTypeFields:${resourceTypeIdStr}`, credentialScopeCacheKey);
		return await getCachedOrLoadOptionsValue(cacheKey, refresh, async () => {
			const resourceTypeResponse = await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				credentialType,
				{
					method: 'GET',
					url: `${ERS_APP_V1_BASE_URL}/resourcetypes/${resourceTypeIdStr}`,
					headers: { Accept: 'application/json' },
				},
			) as ResourceType;
			return mapPublicApiFieldsToUDF(resourceTypeResponse.fields);
		});
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		ctx.logger.error('Error fetching resource type fields:', { error });
		return [];
	}
}

function resolveCurrentCollectionFieldName(ctx: ILoadOptionsFunctions): string | undefined {
	const direct = ctx.getCurrentNodeParameter('fieldName') as string | undefined;
	if (typeof direct === 'string' && direct.trim() !== '') return direct;

	const sibling = ctx.getCurrentNodeParameter('&fieldName') as string | undefined;
	if (typeof sibling === 'string' && sibling.trim() !== '') return sibling;

	return undefined;
}

async function getResourceFieldValueOptionsByFieldName(
	ctx: ILoadOptionsFunctions,
	fieldName: string,
): Promise<INodePropertyOptions[]> {
	const fieldCode = parseProfileFieldCode(fieldName);
	if (!fieldCode) return [];

	const parameters = ctx.getNode().parameters as { resource_type_id?: number | string };
	const resourceTypeIdStr = parseResourceTypeId(parameters.resource_type_id);
	if (!resourceTypeIdStr) return [];

	const fields = await fetchResourceTypeFields(ctx, resourceTypeIdStr);
	if (!fields.length) return [];

	const field = fields.find((f) => f.code === fieldCode);
	if (!field?.options?.length) return [];

	const search = (
		ctx.getCurrentNodeParameter('fieldValue') ??
		ctx.getCurrentNodeParameter('fieldValueSelect') ??
		ctx.getCurrentNodeParameter('fieldValueMultiSelect')
	) as string | undefined;
	const searchLower = typeof search === 'string' && search.trim() ? search.trim().toLowerCase() : '';
	const filtered = searchLower
		? field.options.filter((opt) => (opt.name || '').toLowerCase().includes(searchLower))
		: field.options;

	return filtered.slice(0, 500).map((opt) => ({
		name: opt.name || String(opt.id),
		value: opt.id,
	}));
}

function parseProjectTypesListResponse(
	response: ProjectType[] | { data?: ProjectType[]; items?: ProjectType[] },
): ProjectType[] {
	if (Array.isArray(response)) return response;
	if (Array.isArray(response.data)) return response.data;
	if (Array.isArray(response.items)) return response.items;
	return [];
}

function mapProjectTypesToOptions(list: ProjectType[]): INodePropertyOptions[] {
	return list
		.filter((type) => type.id != null)
		.map((type) => {
			const id = type.id as number;
			return {
				name: type.name || `Project Type ${id}`,
				value: JSON.stringify({ id }),
				description: type.description || undefined,
			};
		});
}

async function fetchProjectTypesList(ctx: ILoadOptionsFunctions, refresh = false): Promise<ProjectType[]> {
	const parameters = ctx.getNode().parameters as { authentication?: string };
	const credentialType = getAuthCredentialType(parameters.authentication);
	try {
		const credentialScopeCacheKey = await getCredentialScopeCacheKey(ctx);
		const cacheKey = buildLoadOptionsCacheKey('projectTypesList', credentialScopeCacheKey);
		return await getCachedOrLoadOptionsValue(cacheKey, refresh, async () => {
			const response = await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				credentialType,
				{
					method: 'GET',
					url: `${ERS_APP_V1_BASE_URL}/projecttypes`,
					headers: { Accept: 'application/json' },
				},
			) as ProjectType[] | { data?: ProjectType[]; items?: ProjectType[] };

			return parseProjectTypesListResponse(response);
		});
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		ctx.logger.error('Error fetching project types:', { error });
		return [];
	}
}

function filterEditableProjectFields(fields: ProjectUDFField[]): ProjectUDFField[] {
	return fields.filter((field) => {
		if (field.is_system_defined && PROJECT_EXCLUDED_SYSTEM_FIELDS.includes(field.code)) return false;
		return true;
	});
}

async function fetchProjectTypeFields(
	ctx: ILoadOptionsFunctions,
	projectTypeIdStr: string,
	refresh = false,
): Promise<ProjectUDFField[]> {
	const parameters = ctx.getNode().parameters as { authentication?: string };
	const credentialType = getAuthCredentialType(parameters.authentication);
	try {
		const credentialScopeCacheKey = await getCredentialScopeCacheKey(ctx);
		const cacheKey = buildLoadOptionsCacheKey(`projectTypeFields:${projectTypeIdStr}`, credentialScopeCacheKey);
		return await getCachedOrLoadOptionsValue(cacheKey, refresh, async () => {
			const projectTypeResponse = await ctx.helpers.httpRequestWithAuthentication.call(
				ctx,
				credentialType,
				{
					method: 'GET',
					url: `${ERS_APP_V1_BASE_URL}/projecttypes/${projectTypeIdStr}`,
					headers: { Accept: 'application/json' },
				},
			) as ProjectType;
			return mapPublicApiProjectFieldsToUDF(projectTypeResponse.fields);
		});
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		ctx.logger.error('Error fetching project type fields:', { error });
		return [];
	}
}

async function getProjectFieldValueOptionsByFieldName(
	ctx: ILoadOptionsFunctions,
	fieldName: string,
): Promise<INodePropertyOptions[]> {
	const fieldCode = parseProfileFieldCode(fieldName);
	if (!fieldCode) return [];

	const parameters = ctx.getNode().parameters as { project_type_id?: number | string };
	const projectTypeIdStr = parseTypeIdParameter(parameters.project_type_id);
	if (!projectTypeIdStr) return [];

	const fields = filterEditableProjectFields(await fetchProjectTypeFields(ctx, projectTypeIdStr));
	if (!fields.length) return [];

	const field = fields.find((f) => f.code === fieldCode);
	if (!field?.options?.length) return [];

	const search = (
		ctx.getCurrentNodeParameter('fieldValue') ??
		ctx.getCurrentNodeParameter('fieldValueSelect') ??
		ctx.getCurrentNodeParameter('fieldValueMultiSelect')
	) as string | undefined;
	const searchLower = typeof search === 'string' && search.trim() ? search.trim().toLowerCase() : '';
	const filtered = searchLower
		? field.options.filter((opt) => (opt.name || '').toLowerCase().includes(searchLower))
		: field.options;

	return filtered.slice(0, 500).map((opt) => ({
		name: opt.name || String(opt.id),
		value: opt.id,
	}));
}

function mapPublicApiProjectFieldsToUDF(fields: ProjectTypeField[] | undefined): ProjectUDFField[] {
	if (!Array.isArray(fields)) return [];
	const result: ProjectUDFField[] = [];
	for (const f of fields) {
		if (f?.code) {
			const options: ProjectUDFOption[] | undefined = f.options?.map((opt) => ({
				id: opt.id,
				name: getOptionDisplayName(f.code, opt),
				description: opt.description ?? undefined,
			}));
			result.push({
				id: f.id,
				code: f.code,
				display_name: f.display_name,
				field_type: f.field_type,
				information_text: f.information_text,
				is_system_defined: f.is_system_defined,
				is_required: f.is_required,
				options,
				placeholder_text: f.placeholder_text,
				maxlength: f.maxlength,
				regex: f.regex,
				mindate: f.mindate,
				maxdate: f.maxdate,
				minlength: f.minlength,
			});
		}
	}
	return result;
}

export class ErsApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'eRS Actions',
		name: 'ersApp',
		icon: { light: 'file:ersApp.svg', dark: 'file:ersApp.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Ers App API',
		defaults: {
			name: 'eRS Actions',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'ersAppOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
			{
				name: 'ersAppAccessTokenApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['accessToken'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'OAuth2 (recommended)',
						value: 'oAuth2',
					},
				],
				default: 'oAuth2',
			},
			{
				displayName: 'Entity Type',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Booking',
						value: 'booking',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Requirement',
						value: 'requirement',
					},
					{
						name: 'Resource',
						value: 'resource',
					},
					{
						name: 'Timesheet',
						value: 'timesheet',
					},
				],
				default: 'resource',
			},
			...resourceDescription,
			...projectDescription,
			...bookingDescription,
			...requirementDescription,
			...timesheetDescription,
		],
	};

	methods = {
		loadOptions: {
			async getResourceTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const list = await fetchResourceTypesList(this);
					if (list.length === 0) return [];
					return mapResourceTypesToOptions(list);
				} catch (error) {
					this.logger.error('Error fetching resource types:', { error });
					return [];
				}
			},

			async getResourceUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { resource_type_id?: number | string };
					const resourceTypeIdStr = parseResourceTypeId(parameters.resource_type_id);
					if (!resourceTypeIdStr) return [];

					const udfFields = await fetchResourceTypeFields(this, resourceTypeIdStr);
					if (udfFields.length === 0) return [];

					// Exclude system fields that are not editable as UDFs. start_date is included so it can be set via UDF in resource update.
					const excludedSystemFields = ['id', 'resource_type_id', 'first_name'];
					return udfFields
						.filter((field) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
							return true;
						})
						.sort((a, b) => {
							const aRequired = a.is_required === true ? 1 : 0;
							const bRequired = b.is_required === true ? 1 : 0;
							return bRequired - aRequired;
						})
						.map((field) => ({
							name: field.display_name || field.code,
							value: JSON.stringify({ code: field.code, field_type: normalizeUdfFieldTypeForOption(field.field_type) }),
						}));
				} catch (error) {
					this.logger.error('Error fetching UDF fields:', { error });
					return [];
				}
			},

			async getResourceUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { resource_type_id?: number | string };
					const resourceTypeIdStr = parseResourceTypeId(parameters.resource_type_id);
					if (!resourceTypeIdStr) return [];

					const udfFields = await fetchResourceTypeFields(this, resourceTypeIdStr);
					if (udfFields.length === 0) return [];

					const excludedSystemFields = ['id', 'resource_type_id', 'first_name', 'start_date', 'name'];
					return udfFields
						.filter((field) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
							return field.is_required === true;
						})
						.map((field) => ({
							name: field.display_name || field.code,
							value: JSON.stringify({ code: field.code, field_type: normalizeUdfFieldTypeForOption(field.field_type) }),
						}));
				} catch (error) {
					this.logger.error('Error fetching mandatory UDF fields:', { error });
					return [];
				}
			},

			async getResourceUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { resource_type_id?: number | string };
					const resourceTypeIdStr = parseResourceTypeId(parameters.resource_type_id);
					if (!resourceTypeIdStr) return [];

					const udfFields = await fetchResourceTypeFields(this, resourceTypeIdStr);
					if (udfFields.length === 0) return [];

					const excludedSystemFields = ['id', 'resource_type_id', 'first_name', 'start_date'];
					return udfFields
						.filter((field) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
							return field.is_required !== true;
						})
						.map((field) => ({
							name: field.display_name || field.code,
							value: JSON.stringify({ code: field.code, field_type: normalizeUdfFieldTypeForOption(field.field_type) }),
						}));
				} catch (error) {
					this.logger.error('Error fetching other UDF fields:', { error });
					return [];
				}
			},

			async getProjectTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const list = await fetchProjectTypesList(this);
					if (list.length === 0) return [];
					return mapProjectTypesToOptions(list);
				} catch (error) {
					this.logger.error('Error fetching project types:', { error });
					return [];
				}
			},

			async getProjectUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { project_type_id?: number | string };
					const projectTypeIdStr = parseTypeIdParameter(parameters.project_type_id);
					if (!projectTypeIdStr) return [];

					const udfFields = filterEditableProjectFields(await fetchProjectTypeFields(this, projectTypeIdStr));
					if (udfFields.length === 0) return [];

					return udfFields
						.sort((a, b) => {
							const aRequired = a.is_required === true ? 1 : 0;
							const bRequired = b.is_required === true ? 1 : 0;
							return bRequired - aRequired;
						})
						.map((field) => ({
							name: field.display_name || field.code,
							value: JSON.stringify({ code: field.code, field_type: normalizeUdfFieldTypeForOption(field.field_type) }),
						}));
				} catch (error) {
					this.logger.error('Error fetching UDF fields:', { error });
					return [];
				}
			},

			async getProjectUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { project_type_id?: number | string };
					const projectTypeIdStr = parseTypeIdParameter(parameters.project_type_id);
					if (!projectTypeIdStr) return [];

					const udfFields = filterEditableProjectFields(await fetchProjectTypeFields(this, projectTypeIdStr));
					if (udfFields.length === 0) return [];

					return udfFields
						.filter((field) => field.is_required === true)
						.map((field) => ({
							name: field.display_name || field.code,
							value: JSON.stringify({ code: field.code, field_type: normalizeUdfFieldTypeForOption(field.field_type) }),
						}));
				} catch (error) {
					this.logger.error('Error fetching mandatory project UDF fields:', { error });
					return [];
				}
			},

			async getProjectUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { project_type_id?: number | string };
					const projectTypeIdStr = parseTypeIdParameter(parameters.project_type_id);
					if (!projectTypeIdStr) return [];

					const udfFields = filterEditableProjectFields(await fetchProjectTypeFields(this, projectTypeIdStr));
					if (udfFields.length === 0) return [];

					return udfFields
						.filter((field) => field.is_required !== true)
						.map((field) => ({
							name: field.display_name || field.code,
							value: JSON.stringify({ code: field.code, field_type: normalizeUdfFieldTypeForOption(field.field_type) }),
						}));
				} catch (error) {
					this.logger.error('Error fetching other project UDF fields:', { error });
					return [];
				}
			},

			async getBookingUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'booking', 'mandatory', 'mandatory booking UDF fields');
			},

			async getBookingUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'booking', 'other', 'other booking UDF fields');
			},

			async getBookingUDFFieldsAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'booking', 'all', 'booking UDF fields');
			},

			async getResourceUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const fieldName = resolveCurrentCollectionFieldName(this);
					if (!fieldName) return [];
					return await getResourceFieldValueOptionsByFieldName(this, fieldName);
				} catch (error) {
					this.logger.error('Error in getResourceUDFFieldOptions:', { error });
					return [];
				}
			},

			async getBookingUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const fieldName = resolveCurrentCollectionFieldName(this);
					if (!fieldName) return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'booking', fieldName);
				} catch (error: unknown) {
					this.logger.error('Error in getBookingUDFFieldOptions:', { error });
					return [];
				}
			},

			async getTimesheetUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'timesheet', 'mandatory', 'mandatory timesheet UDF fields');
			},

			async getTimesheetUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'timesheet', 'other', 'other timesheet UDF fields');
			},

			async getTimesheetUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const fieldName = resolveCurrentCollectionFieldName(this);
					if (!fieldName) return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'timesheet', fieldName);
				} catch (error: unknown) {
					this.logger.error('Error in getTimesheetUDFFieldOptions:', { error });
					return [];
				}
			},

			async getRequirementUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'requirement', 'mandatory', 'mandatory requirement UDF fields');
			},

			async getRequirementUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'requirement', 'other', 'other requirement UDF fields');
			},

			async getRequirementUDFFieldsAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return withProfileFieldListLoader(this, 'requirement', 'all', 'requirement UDF fields');
			},

			async getRequirementUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const fieldName = resolveCurrentCollectionFieldName(this);
					if (!fieldName) return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					this.logger.error('Error in getRequirementUDFFieldOptions:', { error });
					return [];
				}
			},

			async getProjectUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const fieldName = resolveCurrentCollectionFieldName(this);
					if (!fieldName) return [];
					return await getProjectFieldValueOptionsByFieldName(this, fieldName);
				} catch (error) {
					this.logger.error('Error in getProjectUDFFieldOptions:', { error });
					return [];
				}
			},
		},
	};
}
