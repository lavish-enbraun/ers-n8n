import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
} from 'n8n-workflow';
import { API_BASE_PATH, BASE_URL } from './constants';
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

// Public API resource type response shape (list item or single GET)
interface PublicApiResourceTypeField {
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

interface PublicApiResourceTypeDetail {
	id?: number;
	name?: string;
	description?: string;
	is_human?: boolean;
	color?: string;
	fields?: PublicApiResourceTypeField[];
}

// Public API project type response shape (list item or single GET)
interface PublicApiProjectTypeField {
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

interface PublicApiProjectTypeDetail {
	id?: number;
	name?: string;
	description?: string;
	color?: string;
	fields?: PublicApiProjectTypeField[];
}

// Profile field metadata (shared shape for GET .../booking/fields, .../requirement/fields, etc.)
interface ProfileFieldDefinition {
	id?: number;
	code: string;
	display_name?: string;
	field_type?: string;
	is_system_defined?: boolean;
	is_required?: boolean;
	options?: Array<{ id: number; name: string; description?: string | null }>;
	mindate?: string;
	maxdate?: string;
	minlength?: number;
	maxlength?: number;
	regex?: string;
	placeholder_text?: string;
	minnum?: number;
	maxnum?: number;
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

function mapProfileFieldDefinitions(fields: ProfileFieldDefinition[] | undefined): ProfileField[] {
	if (!Array.isArray(fields)) return [];
	const result: ProfileField[] = [];
	for (const f of fields) {
		if (f?.code) {
			const options: ProfileFieldOption[] | undefined = f.options?.map((opt) => ({
				id: opt.id,
				name: opt.name,
				description: opt.description ?? undefined,
			}));
			result.push({
				id: f.id,
				code: f.code,
				display_name: f.display_name,
				field_type: f.field_type,
				is_system_defined: f.is_system_defined,
				is_required: f.is_required,
				options,
				mindate: f.mindate,
				maxdate: f.maxdate,
				minlength: f.minlength,
				maxlength: f.maxlength,
				regex: f.regex,
				placeholder_text: f.placeholder_text,
				minnum: f.minnum,
				maxnum: f.maxnum,
			});
		}
	}
	return result;
}

function mapPublicApiFieldsToUDF(fields: PublicApiResourceTypeField[] | undefined): ResourceUDFField[] {
	if (!Array.isArray(fields)) return [];
	const result: ResourceUDFField[] = [];
	for (const f of fields) {
		if (f?.code) {
			const options: ResourceUDFOption[] | undefined = f.options?.map((opt) => ({
				id: opt.id,
				name: f.code === 'timezone' && typeof opt.description === 'string' && opt.description.trim() !== ''
					? opt.description
					: opt.name,
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

const resourceTypeCache: Record<string, ResourceUDFField[]> = {};

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

const projectTypeCache: Record<string, ProjectUDFField[]> = {};

// Booking fields cache (fetched from /booking/fields)
let bookingFieldsCache: ProfileField[] | undefined;

// Requirement fields cache (GET /requirement/fields; same ProfileFieldDefinition response shape)
let requirementFieldsCache: ProfileField[] | undefined;

// Timesheet fields cache (fetched from /timesheet/fields)
let timesheetFieldsCache: ProfileField[] | undefined;

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
		excludedCodes: ['project_id', 'start_time', 'end_time', 'effort', 'unit'],
	},
};

function getProfileFieldsCache(entity: ProfileEntityKey): ProfileField[] | undefined {
	if (entity === 'booking') return bookingFieldsCache;
	if (entity === 'timesheet') return timesheetFieldsCache;
	return requirementFieldsCache;
}

function setProfileFieldsCache(entity: ProfileEntityKey, fields: ProfileField[] | undefined): void {
	if (entity === 'booking') {
		bookingFieldsCache = fields;
		return;
	}
	if (entity === 'timesheet') {
		timesheetFieldsCache = fields;
		return;
	}
	requirementFieldsCache = fields;
}

function resolveLatestProfileFieldName(rows: Array<{ fieldName?: string }> | undefined): string | undefined {
	if (!Array.isArray(rows) || rows.length === 0) return undefined;
	for (let i = rows.length - 1; i >= 0; i--) {
		const item = rows[i];
		if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
			return item.fieldName;
		}
	}
	return undefined;
}

function resolveLatestProfileFieldNameFromCollections(
	collections: Array<Array<{ fieldName?: string }> | undefined>,
): string | undefined {
	for (const rows of collections) {
		const fieldName = resolveLatestProfileFieldName(rows);
		if (fieldName) return fieldName;
	}
	return undefined;
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

	return filtered.slice(0, 300).map((opt) => ({
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
		const credentialType = auth === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';
		const meta = PROFILE_ENTITY_META[entity];

		if (invalidateCache) {
			setProfileFieldsCache(entity, undefined);
		}

		let cache = getProfileFieldsCache(entity);
		if (!cache?.length) {
			const response = await ctx.helpers.httpRequestWithAuthentication.call(ctx, credentialType, {
				method: 'GET',
				url: `${BASE_URL}${API_BASE_PATH}${meta.endpoint}`,
				headers: { Accept: 'application/json' },
			}) as { data?: ProfileFieldDefinition[] } | ProfileFieldDefinition[];

			const list = Array.isArray(response) ? response : (response.data ?? []);
			cache = mapProfileFieldDefinitions(list);
			setProfileFieldsCache(entity, cache);
		}

		return cache;
	} catch (error: unknown) {
		if (isAccessTokenError(error)) return [];
		console.error(`Error fetching ${entity} fields:`, error);
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
	const fields = await ensureProfileFieldsCache(ctx, entity, true);
	return buildProfileFieldListOptions(fields, entity, mode);
}

async function getProfileFieldValueOptionsByFieldName(
	ctx: ILoadOptionsFunctions,
	entity: ProfileEntityKey,
	fieldName: string,
): Promise<INodePropertyOptions[]> {
	const fieldCode = parseProfileFieldCode(fieldName);
	if (!fieldCode) return [];

	let fields = getProfileFieldsCache(entity);
	if (!fields?.length) {
		fields = await ensureProfileFieldsCache(ctx, entity, false);
	}

	const search = (
		ctx.getCurrentNodeParameter('fieldValue') ??
		ctx.getCurrentNodeParameter('fieldValueSelect') ??
		ctx.getCurrentNodeParameter('fieldValueMultiSelect')
	) as string | undefined;

	return buildProfileFieldValueOptions(fields, fieldCode, search);
}

function mapPublicApiProjectFieldsToUDF(fields: PublicApiProjectTypeField[] | undefined): ProjectUDFField[] {
	if (!Array.isArray(fields)) return [];
	const result: ProjectUDFField[] = [];
	for (const f of fields) {
		if (f?.code) {
			const options: ProjectUDFOption[] | undefined = f.options?.map((opt) => ({
				id: opt.id,
				name: f.code === 'timezone' && typeof opt.description === 'string' && opt.description.trim() !== ''
					? opt.description
					: opt.name,
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
		displayName: 'eResource Scheduler',
		name: 'ersApp',
		icon: { light: 'file:ersApp.svg', dark: 'file:ersApp.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Ers App API',
		defaults: {
			name: 'Ers App',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'ersAppOAuth2',
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
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'OAuth2 (recommended)',
						value: 'oAuth2',
					},
					{
						name: 'Access Token',
						value: 'accessToken',
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
			// Fetch resource types from public API (list returns full objects with id, name, is_human, fields)
			async getResourceTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const auth = (this.getNode().parameters as { authentication?: string }).authentication;
					const credentialType =
						auth === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2';
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialType,
						{
							method: 'GET',
							url: `${BASE_URL}${API_BASE_PATH}/resourcetypes`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as PublicApiResourceTypeDetail[] | { data?: PublicApiResourceTypeDetail[]; items?: PublicApiResourceTypeDetail[] };

					let list: PublicApiResourceTypeDetail[] = [];
					if (Array.isArray(response)) {
						list = response;
					} else if (Array.isArray((response as { data?: PublicApiResourceTypeDetail[] }).data)) {
						list = (response as { data: PublicApiResourceTypeDetail[] }).data;
					} else if (Array.isArray((response as { items?: PublicApiResourceTypeDetail[] }).items)) {
						list = (response as { items: PublicApiResourceTypeDetail[] }).items;
					}
					if (list.length === 0) return [];

					return list.map((type) => {
						const id = type.id;
						const isHuman = type.is_human === true;
						return {
							name: type.name || `Resource Type ${id}`,
							value: JSON.stringify({ id, is_human: isHuman }),
							description: type.description || undefined,
						};
					});
				} catch (error: unknown) {
					if (isAccessTokenError(error)) {
						return [];
					}
					console.error('Error fetching resource types:', error);
					return [];
				}
			},

			// Layer 1: Load field definitions (lightweight only). Layer 2: cache raw API response once.
			async getResourceUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { resource_type_id?: number | string; authentication?: string };
					let resourceTypeId = parameters.resource_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2';

					if (resourceTypeId === '' || resourceTypeId === null || resourceTypeId === undefined) {
						return [];
					}

					if (typeof resourceTypeId === 'string') {
						try {
							const parsed = JSON.parse(resourceTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) {
								resourceTypeId = parsed.id;
							}
						} catch {
							// not JSON
						}
					}

					const resourceTypeIdStr = String(resourceTypeId);

					// Invalidate cache so "Refresh List" and dropdown open always get fresh data from API
					delete resourceTypeCache[resourceTypeIdStr];

					// Fetch once and cache (public API: top-level fields array)
					if (!resourceTypeCache[resourceTypeIdStr]) {
						let resourceTypeResponse: PublicApiResourceTypeDetail;
						try {
							resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								credentialType,
								{
									method: 'GET',
									url: `${BASE_URL}${API_BASE_PATH}/resourcetypes/${resourceTypeIdStr}`,
									headers: { 'Accept': 'application/json' },
								},
							) as PublicApiResourceTypeDetail;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type fields:', error);
							return [];
						}
						resourceTypeCache[resourceTypeIdStr] = mapPublicApiFieldsToUDF(resourceTypeResponse.fields);
					}

					const udfFields = resourceTypeCache[resourceTypeIdStr];
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
					console.error('Error fetching UDF fields:', error);
					return [];
				}
			},

			// Layer 1 + 2: Lightweight field list; use cache (populated by getResourceUDFFields or here).
			async getResourceUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { resource_type_id?: number | string; authentication?: string };
					let resourceTypeId = parameters.resource_type_id;
					const credentialType =
						parameters.authentication === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';

					if (resourceTypeId === '' || resourceTypeId === null || resourceTypeId === undefined) return [];

					if (typeof resourceTypeId === 'string') {
						try {
							const parsed = JSON.parse(resourceTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) resourceTypeId = parsed.id;
						} catch {
							// not JSON
						}
					}
					const resourceTypeIdStr = String(resourceTypeId);

					// Invalidate cache so "Refresh List" and dropdown open always get fresh data from API
					delete resourceTypeCache[resourceTypeIdStr];

					if (!resourceTypeCache[resourceTypeIdStr]) {
						let resourceTypeResponse: PublicApiResourceTypeDetail;
						try {
							resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType, { method: 'GET', url: `${BASE_URL}${API_BASE_PATH}/resourcetypes/${resourceTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as PublicApiResourceTypeDetail;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type fields:', error);
							return [];
						}
						resourceTypeCache[resourceTypeIdStr] = mapPublicApiFieldsToUDF(resourceTypeResponse.fields);
					}

					const udfFields = resourceTypeCache[resourceTypeIdStr];
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
					console.error('Error fetching mandatory UDF fields:', error);
					return [];
				}
			},

			// Layer 1 + 2: Lightweight field list; use cache (populated by getResourceUDFFields or here).
			async getResourceUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { resource_type_id?: number | string; authentication?: string };
					let resourceTypeId = parameters.resource_type_id;
					const credentialType =
						parameters.authentication === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';

					if (resourceTypeId === '' || resourceTypeId === null || resourceTypeId === undefined) return [];

					if (typeof resourceTypeId === 'string') {
						try {
							const parsed = JSON.parse(resourceTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) resourceTypeId = parsed.id;
						} catch {
							// not JSON
						}
					}
					const resourceTypeIdStr = String(resourceTypeId);

					// Invalidate cache so "Refresh List" and dropdown open always get fresh data from API
					delete resourceTypeCache[resourceTypeIdStr];

					if (!resourceTypeCache[resourceTypeIdStr]) {
						let resourceTypeResponse: PublicApiResourceTypeDetail;
						try {
							resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}${API_BASE_PATH}/resourcetypes/${resourceTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as PublicApiResourceTypeDetail;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type fields:', error);
							return [];
						}
						resourceTypeCache[resourceTypeIdStr] = mapPublicApiFieldsToUDF(resourceTypeResponse.fields);
					}

					const udfFields = resourceTypeCache[resourceTypeIdStr];
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
					console.error('Error fetching other UDF fields:', error);
					return [];
				}
			},

			// Fetch project types from public API (list returns full objects with id, name, description, color, fields)
			async getProjectTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const auth = (this.getNode().parameters as { authentication?: string }).authentication;
					const credentialType =
						auth === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2';
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialType,
						{
							method: 'GET',
							url: `${BASE_URL}${API_BASE_PATH}/projecttypes`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as PublicApiProjectTypeDetail[] | { data?: PublicApiProjectTypeDetail[]; items?: PublicApiProjectTypeDetail[] };

					let list: PublicApiProjectTypeDetail[] = [];
					if (Array.isArray(response)) {
						list = response;
					} else if (Array.isArray((response as { data?: PublicApiProjectTypeDetail[] }).data)) {
						list = (response as { data: PublicApiProjectTypeDetail[] }).data;
					} else if (Array.isArray((response as { items?: PublicApiProjectTypeDetail[] }).items)) {
						list = (response as { items: PublicApiProjectTypeDetail[] }).items;
					}
					if (list.length === 0) return [];

					return list
						.filter((type) => type.id != null)
						.map((type) => {
							const id = type.id as number;
							return {
								name: type.name || `Project Type ${id}`,
								value: id,
								description: type.description || undefined,
							};
						});
				} catch (error: unknown) {
					if (isAccessTokenError(error)) {
						return [];
					}
					console.error('Error fetching project types:', error);
					return [];
				}
			},

			// Layer 1: Load field definitions (lightweight only). Layer 2: cache raw API response once per project type.
			async getProjectUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { project_type_id?: number | string; authentication?: string };
					let projectTypeId = parameters.project_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2';

					if (projectTypeId === '' || projectTypeId === null || projectTypeId === undefined) {
						return [];
					}

					if (typeof projectTypeId === 'string') {
						try {
							const parsed = JSON.parse(projectTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) {
								projectTypeId = parsed.id;
							}
						} catch {
							// not JSON
						}
					}

					const projectTypeIdStr = String(projectTypeId);

					// Invalidate cache so "Refresh List" and dropdown open always get fresh data from API
					delete projectTypeCache[projectTypeIdStr];

					// Fetch once and cache (public API: top-level fields array)
					if (!projectTypeCache[projectTypeIdStr]) {
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								credentialType,
								{
									method: 'GET',
									url: `${BASE_URL}${API_BASE_PATH}/projecttypes/${projectTypeIdStr}`,
									headers: { 'Accept': 'application/json' },
								},
							) as PublicApiProjectTypeDetail;
							const mapped = mapPublicApiProjectFieldsToUDF(projectTypeResponse.fields);
							projectTypeCache[projectTypeIdStr] = mapped.filter((field) => {
								if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
								return true;
							});
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching project type fields:', error);
							return [];
						}
					}

					const udfFields = projectTypeCache[projectTypeIdStr];
					if (udfFields.length === 0) return [];

					const excludedSystemFields = ['id', 'project_type_id', 'title'];
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
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching UDF fields:', error);
					return [];
				}
			},

			// Layer 1 + 2: Lightweight field list; use cache (populated by getProjectUDFFields or here).
			async getProjectUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { project_type_id?: number | string; authentication?: string };
					let projectTypeId = parameters.project_type_id;
					const credentialType =
						parameters.authentication === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';

					if (projectTypeId === '' || projectTypeId === null || projectTypeId === undefined) return [];

					if (typeof projectTypeId === 'string') {
						try {
							const parsed = JSON.parse(projectTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) projectTypeId = parsed.id;
						} catch {
							// not JSON
						}
					}
					const projectTypeIdStr = String(projectTypeId);

					// Invalidate cache so "Refresh List" and dropdown open always get fresh data from API
					delete projectTypeCache[projectTypeIdStr];

					if (!projectTypeCache[projectTypeIdStr]) {
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}${API_BASE_PATH}/projecttypes/${projectTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as PublicApiProjectTypeDetail;
							const mapped = mapPublicApiProjectFieldsToUDF(projectTypeResponse.fields);
							projectTypeCache[projectTypeIdStr] = mapped.filter((field) => {
								if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
								return true;
							});
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching project type fields:', error);
							return [];
						}
					}

					const udfFields = projectTypeCache[projectTypeIdStr];
					if (udfFields.length === 0) return [];

					const excludedSystemFields = ['id', 'project_type_id', 'title'];
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
					console.error('Error fetching mandatory project UDF fields:', error);
					return [];
				}
			},

			// Layer 1 + 2: Lightweight field list; use cache (populated by getProjectUDFFields or here).
			async getProjectUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as { project_type_id?: number | string; authentication?: string };
					let projectTypeId = parameters.project_type_id;
					const credentialType =
						parameters.authentication === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';

					if (projectTypeId === '' || projectTypeId === null || projectTypeId === undefined) return [];

					if (typeof projectTypeId === 'string') {
						try {
							const parsed = JSON.parse(projectTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) projectTypeId = parsed.id;
						} catch {
							// not JSON
						}
					}
					const projectTypeIdStr = String(projectTypeId);

					// Invalidate cache so "Refresh List" and dropdown open always get fresh data from API
					delete projectTypeCache[projectTypeIdStr];

					if (!projectTypeCache[projectTypeIdStr]) {
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}${API_BASE_PATH}/projecttypes/${projectTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as PublicApiProjectTypeDetail;
							const mapped = mapPublicApiProjectFieldsToUDF(projectTypeResponse.fields);
							projectTypeCache[projectTypeIdStr] = mapped.filter((field) => {
								if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
								return true;
							});
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching project type fields:', error);
							return [];
						}
					}

					const udfFields = projectTypeCache[projectTypeIdStr];
					if (udfFields.length === 0) return [];

					const excludedSystemFields = ['id', 'project_type_id', 'title'];
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
					console.error('Error fetching other project UDF fields:', error);
					return [];
				}
			},

			async getBookingFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'booking', 'mandatory');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching mandatory booking fields:', error);
					return [];
				}
			},

			async getBookingFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'booking', 'other');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching other booking fields:', error);
					return [];
				}
			},

			async getBookingFieldsAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'booking', 'all');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching booking fields:', error);
					return [];
				}
			},

			// Layer 3: Dynamic option loader — read from cache, filter by search, limit 30.
			async getResourceUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						resource_type_id?: number | string;
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						udfFields?: { field?: Array<{ fieldName?: string }> };
					};

					let fieldName: string | undefined;
					const mandatoryFields = parameters.mandatoryFields;
					const otherFields = parameters.otherFields;
					const udfFields = parameters.udfFields;

					for (const arr of [
						mandatoryFields?.field,
						otherFields?.field,
						udfFields?.field,
					]) {
						if (Array.isArray(arr) && arr.length > 0) {
							for (let i = arr.length - 1; i >= 0; i--) {
								const item = arr[i];
								if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
									fieldName = item.fieldName;
									break;
								}
							}
							if (fieldName) break;
							const first = arr[0];
							if (first?.fieldName) {
								fieldName = first.fieldName as string;
								break;
							}
						}
					}

					if (!fieldName || fieldName === '') return [];

					let parsed: { code?: string; field_type?: string };
					try {
						parsed = JSON.parse(fieldName);
					} catch {
						return [];
					}

					let resourceTypeId: number | string | undefined = parameters.resource_type_id;
					if (resourceTypeId === undefined || resourceTypeId === null || resourceTypeId === '') {
						return [];
					}
					if (typeof resourceTypeId === 'string') {
						try {
							const p = JSON.parse(resourceTypeId);
							if (p && typeof p === 'object' && 'id' in p) resourceTypeId = p.id;
						} catch {
							// not JSON
						}
					}
					const resourceTypeIdStr = String(resourceTypeId);

					let fields = resourceTypeCache[resourceTypeIdStr];
					if (!fields?.length) {
						const auth = (this.getNode().parameters as { authentication?: string }).authentication;
						const credentialType = auth === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';
						try {
							const resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								credentialType,
								{
									method: 'GET',
									url: `${BASE_URL}${API_BASE_PATH}/resourcetypes/${resourceTypeIdStr}`,
									headers: { Accept: 'application/json' },
								},
							) as PublicApiResourceTypeDetail;
							fields = mapPublicApiFieldsToUDF(resourceTypeResponse.fields);
							resourceTypeCache[resourceTypeIdStr] = fields;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type field options:', error);
							return [];
						}
					}
					if (!fields?.length) return [];

					const field = fields.find((f) => f.code === parsed.code);
					if (!field || !field.options?.length) return [];

					const search = (
						this.getCurrentNodeParameter('fieldValue') ??
						this.getCurrentNodeParameter('fieldValueSelect') ??
						this.getCurrentNodeParameter('fieldValueMultiSelect')
					) as string | undefined;
					const searchLower = typeof search === 'string' && search.trim() ? search.trim().toLowerCase() : '';

					const filtered = searchLower
						? field.options.filter((opt) => (opt.name || '').toLowerCase().includes(searchLower))
						: field.options;
						
					const limit = 300;
					const limited = filtered.slice(0, limit).map((opt) => ({
						name: opt.name || String(opt.id),
						value: opt.id,
					}));

					return limited;
				} catch (error) {
					console.error('Error in getResourceUDFFieldOptions:', error);
					return [];
				}
			},

			// Layer 3: Dynamic option loader for booking fields — read from cache, filter by search, limit.
			async getBookingFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						additionalBookingFields?: { field?: Array<{ fieldName?: string }> };
					};

					const fieldName = resolveLatestProfileFieldNameFromCollections([
						parameters.mandatoryFields?.field,
						parameters.otherFields?.field,
						parameters.additionalBookingFields?.field,
					]);

					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'booking', fieldName);
				} catch (error: unknown) {
					console.error('Error in getBookingFieldOptions:', error);
					return [];
				}
			},

			async getBookingFieldOptionsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
					};
					const rows = parameters.mandatoryFields?.field;
					const fieldName = resolveLatestProfileFieldName(rows);
					if (!fieldName) return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'booking', fieldName);
				} catch (error: unknown) {
					console.error('Error in getBookingFieldOptionsMandatory:', error);
					return [];
				}
			},

			async getBookingFieldOptionsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						otherFields?: { field?: Array<{ fieldName?: string }> };
					};
					const rows = parameters.otherFields?.field;
					const fieldName = resolveLatestProfileFieldName(rows);
					if (!fieldName) return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'booking', fieldName);
				} catch (error: unknown) {
					console.error('Error in getBookingFieldOptionsOther:', error);
					return [];
				}
			},

			async getBookingFieldOptionsAdditional(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						additionalBookingFields?: { field?: Array<{ fieldName?: string }> };
					};
					const rows = parameters.additionalBookingFields?.field;
					const fieldName = resolveLatestProfileFieldName(rows);
					if (!fieldName) return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'booking', fieldName);
				} catch (error: unknown) {
					console.error('Error in getBookingFieldOptionsAdditional:', error);
					return [];
				}
			},

			// Layer 3: Dynamic fields list for timesheet (from GET /timesheet/fields)
			async getTimesheetFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'timesheet', 'mandatory');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching mandatory timesheet fields:', error);
					return [];
				}
			},

			async getTimesheetFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'timesheet', 'other');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching other timesheet fields:', error);
					return [];
				}
			},

			// Layer 3: Dynamic option loader for timesheet fields — read from cache, filter by search, limit.
			async getTimesheetFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						updateMandatoryFields?: { field?: Array<{ fieldName?: string }> };
						updateOtherFields?: { field?: Array<{ fieldName?: string }> };
					};

					const fieldName = resolveLatestProfileFieldNameFromCollections([
						parameters.mandatoryFields?.field,
						parameters.otherFields?.field,
						parameters.updateMandatoryFields?.field,
						parameters.updateOtherFields?.field,
					]);

					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'timesheet', fieldName);
				} catch (error: unknown) {
					console.error('Error in getTimesheetFieldOptions:', error);
					return [];
				}
			},

			async getTimesheetFieldOptionsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.mandatoryFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'timesheet', fieldName);
				} catch (error: unknown) {
					console.error('Error in getTimesheetFieldOptionsMandatory:', error);
					return [];
				}
			},

			async getTimesheetFieldOptionsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						otherFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.otherFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'timesheet', fieldName);
				} catch (error: unknown) {
					console.error('Error in getTimesheetFieldOptionsOther:', error);
					return [];
				}
			},

			async getTimesheetFieldOptionsUpdateMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						updateMandatoryFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.updateMandatoryFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'timesheet', fieldName);
				} catch (error: unknown) {
					console.error('Error in getTimesheetFieldOptionsUpdateMandatory:', error);
					return [];
				}
			},

			async getTimesheetFieldOptionsUpdateOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						updateOtherFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.updateOtherFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'timesheet', fieldName);
				} catch (error: unknown) {
					console.error('Error in getTimesheetFieldOptionsUpdateOther:', error);
					return [];
				}
			},

			async getRequirementFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'requirement', 'mandatory');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching mandatory requirement fields:', error);
					return [];
				}
			},

			async getRequirementFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'requirement', 'other');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching other requirement fields:', error);
					return [];
				}
			},

			async getRequirementFieldsAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					return await getProfileFieldListOptions(this, 'requirement', 'all');
				} catch (error: unknown) {
					if (isAccessTokenError(error)) return [];
					console.error('Error fetching requirement fields:', error);
					return [];
				}
			},

			async getRequirementFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						updateMandatoryFields?: { field?: Array<{ fieldName?: string }> };
						updateOtherFields?: { field?: Array<{ fieldName?: string }> };
						additionalFields?: { field?: Array<{ fieldName?: string }> };
					};

					const fieldName = resolveLatestProfileFieldNameFromCollections([
						parameters.mandatoryFields?.field,
						parameters.otherFields?.field,
						parameters.updateMandatoryFields?.field,
						parameters.updateOtherFields?.field,
						parameters.additionalFields?.field,
					]);

					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					console.error('Error in getRequirementFieldOptions:', error);
					return [];
				}
			},

			async getRequirementFieldOptionsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.mandatoryFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					console.error('Error in getRequirementFieldOptionsMandatory:', error);
					return [];
				}
			},

			async getRequirementFieldOptionsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						otherFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.otherFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					console.error('Error in getRequirementFieldOptionsOther:', error);
					return [];
				}
			},

			async getRequirementFieldOptionsUpdateMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						updateMandatoryFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.updateMandatoryFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					console.error('Error in getRequirementFieldOptionsUpdateMandatory:', error);
					return [];
				}
			},

			async getRequirementFieldOptionsUpdateOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						updateOtherFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.updateOtherFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					console.error('Error in getRequirementFieldOptionsUpdateOther:', error);
					return [];
				}
			},

			async getRequirementFieldOptionsAdditional(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						additionalFields?: { field?: Array<{ fieldName?: string }> };
					};
					const fieldName = resolveLatestProfileFieldName(parameters.additionalFields?.field);
					if (!fieldName || fieldName === '') return [];
					return await getProfileFieldValueOptionsByFieldName(this, 'requirement', fieldName);
				} catch (error: unknown) {
					console.error('Error in getRequirementFieldOptionsAdditional:', error);
					return [];
				}
			},

			// Layer 3: Dynamic option loader for projects — read from cache, filter by search, limit 30.
			async getProjectUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const parameters = this.getNode().parameters as {
						project_type_id?: number | string;
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						udfFields?: { field?: Array<{ fieldName?: string }> };
					};

					let fieldName: string | undefined;
					for (const arr of [
						parameters.mandatoryFields?.field,
						parameters.otherFields?.field,
						parameters.udfFields?.field,
					]) {
						if (Array.isArray(arr) && arr.length > 0) {
							for (let i = arr.length - 1; i >= 0; i--) {
								const item = arr[i];
								if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
									fieldName = item.fieldName;
									break;
								}
							}
							if (fieldName) break;
							const first = arr[0];
							if (first?.fieldName) {
								fieldName = first.fieldName as string;
								break;
							}
						}
					}

					if (!fieldName || fieldName === '') return [];

					let parsed: { code?: string; field_type?: string };
					try {
						parsed = JSON.parse(fieldName);
					} catch {
						return [];
					}

					let projectTypeId: number | string | undefined = parameters.project_type_id;
					if (projectTypeId === undefined || projectTypeId === null || projectTypeId === '') {
						return [];
					}
					if (typeof projectTypeId === 'string') {
						try {
							const p = JSON.parse(projectTypeId);
							if (p && typeof p === 'object' && 'id' in p) projectTypeId = p.id;
						} catch {
							// not JSON
						}
					}
					const projectTypeIdStr = String(projectTypeId);

					let fields = projectTypeCache[projectTypeIdStr];
					if (!fields?.length) {
						const auth = (this.getNode().parameters as { authentication?: string }).authentication;
						const credentialType = auth === 'accessToken' ? 'ersAppAccessTokenApi' : 'ersAppOAuth2';
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								credentialType,
								{
									method: 'GET',
									url: `${BASE_URL}${API_BASE_PATH}/projecttypes/${projectTypeIdStr}`,
									headers: { Accept: 'application/json' },
								},
							) as PublicApiProjectTypeDetail;
							const mapped = mapPublicApiProjectFieldsToUDF(projectTypeResponse.fields);
							fields = mapped.filter((field) => {
								if (field.is_system_defined && excludedSystemFields.includes(field.code)) return false;
								return true;
							});
							projectTypeCache[projectTypeIdStr] = fields;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching project type field options:', error);
							return [];
						}
					}
					if (!fields?.length) return [{ name: '', value: '' }];

					const field = fields.find((f) => f.code === parsed.code);
					if (!field || !field.options?.length) return [{ name: '', value: '' }];

					const search = (
						this.getCurrentNodeParameter('fieldValue') ??
						this.getCurrentNodeParameter('fieldValueSelect') ??
						this.getCurrentNodeParameter('fieldValueMultiSelect')
					) as string | undefined;
					const searchLower = typeof search === 'string' && search.trim() ? search.trim().toLowerCase() : '';

					const filtered = searchLower
						? field.options.filter((opt) => (opt.name || '').toLowerCase().includes(searchLower))
						: field.options;
					const limited = filtered.slice(0, 30).map((opt) => ({
						name: opt.name || String(opt.id),
						value: opt.id,
					}));

					return limited;
				} catch (error) {
					console.error('Error in getProjectUDFFieldOptions:', error);
					return [];
				}
			},
		},
	};
}
