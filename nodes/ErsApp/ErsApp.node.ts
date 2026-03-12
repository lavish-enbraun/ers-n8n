import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
} from 'n8n-workflow';
import { BASE_URL } from './constants';
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

// Layer 2: Cache raw API response per resource type (no re-fetch, no re-serialization)
interface ResourceUDFOption {
	id: number | string;
	name: string;
	color?: string;
	description?: string;
	udf_desc_id?: number;
}

interface ResourceUDFField {
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
}

const projectTypeCache: Record<string, ProjectUDFField[]> = {};

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
			// Fetch resource types from /rest/resourcetype
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
							url: `${BASE_URL}/rest/resourcetype`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as { data?: Array<{ id: number; name: string; description?: string; is_active?: boolean; is_human?: boolean }> };

					if (!response.data || !Array.isArray(response.data)) {
						return [];
					}

					const activeTypes = response.data.filter((type) => type.is_active !== false);

					// Always fetch individual resource type details to get is_human from /rest/resources/resourcetype/${id}
					const typesWithDetails = await Promise.all(
						activeTypes.map(async (type) => {
							let isHuman = false;
							
							// Always fetch individual resource type details to get is_human
							try {
								const detailResponse = await this.helpers.httpRequestWithAuthentication.call(
									this,
									credentialType,
									{
										method: 'GET',
										url: `${BASE_URL}/rest/resources/resourcetype/${type.id}`,
										headers: {
											'Accept': 'application/json',
										},
									},
								) as { is_human?: boolean };
								
								isHuman = detailResponse.is_human === true;
							} catch (error) {
								// If fetching individual details fails, default to false
								console.warn(`Could not fetch is_human for resource type ${type.id}:`, error);
								isHuman = false;
							}

							// Store resource type data including is_human as JSON string in value
							const resourceTypeData = {
								id: type.id,
								is_human: isHuman,
							};
							return {
								name: type.name || `Resource Type ${type.id}`,
								value: JSON.stringify(resourceTypeData),
								description: type.description || undefined,
							};
						}),
					);

					return typesWithDetails;
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

					// Fetch once and cache
					if (!resourceTypeCache[resourceTypeIdStr]) {
						interface ResourceTypeSection {
							udfs?: ResourceUDFField[];
						}
						interface ResourceTypeResponse {
							sections?: ResourceTypeSection[];
						}
						let resourceTypeResponse: ResourceTypeResponse;
						try {
							resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								credentialType,
								{
									method: 'GET',
									url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeIdStr}`,
									headers: { 'Accept': 'application/json' },
								},
							) as ResourceTypeResponse;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type fields:', error);
							return [];
						}
						const udfFields: ResourceUDFField[] = [];
						if (resourceTypeResponse.sections && Array.isArray(resourceTypeResponse.sections)) {
							for (const section of resourceTypeResponse.sections) {
								if (section.udfs && Array.isArray(section.udfs)) {
									for (const udf of section.udfs) {
										if (udf.code) udfFields.push(udf);
									}
								}
							}
						}
						resourceTypeCache[resourceTypeIdStr] = udfFields;
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
							value: JSON.stringify({ code: field.code, field_type: field.field_type === 'TAGS' ? 'TEXT' : (field.field_type ?? '') }),
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

					if (!resourceTypeCache[resourceTypeIdStr]) {
						interface ResourceTypeSection { udfs?: ResourceUDFField[]; }
						interface ResourceTypeResponse { sections?: ResourceTypeSection[]; }
						let resourceTypeResponse: ResourceTypeResponse;
						try {
							resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as ResourceTypeResponse;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type fields:', error);
							return [];
						}
						const udfFields: ResourceUDFField[] = [];
						if (resourceTypeResponse.sections?.length) {
							for (const section of resourceTypeResponse.sections) {
								if (section.udfs?.length) {
									for (const udf of section.udfs) {
										if (udf.code) udfFields.push(udf);
									}
								}
							}
						}
						resourceTypeCache[resourceTypeIdStr] = udfFields;
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
							value: JSON.stringify({ code: field.code, field_type: field.field_type === 'TAGS' ? 'TEXT' : (field.field_type ?? '') }),
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

					if (!resourceTypeCache[resourceTypeIdStr]) {
						interface ResourceTypeSection { udfs?: ResourceUDFField[]; }
						interface ResourceTypeResponse { sections?: ResourceTypeSection[]; }
						let resourceTypeResponse: ResourceTypeResponse;
						try {
							resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as ResourceTypeResponse;
						} catch (error: unknown) {
							if (isAccessTokenError(error)) return [];
							console.error('Error fetching resource type fields:', error);
							return [];
						}
						const udfFields: ResourceUDFField[] = [];
						if (resourceTypeResponse.sections?.length) {
							for (const section of resourceTypeResponse.sections) {
								if (section.udfs?.length) {
									for (const udf of section.udfs) {
										if (udf.code) udfFields.push(udf);
									}
								}
							}
						}
						resourceTypeCache[resourceTypeIdStr] = udfFields;
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
							value: JSON.stringify({ code: field.code, field_type: field.field_type === 'TAGS' ? 'TEXT' : (field.field_type ?? '') }),
						}));
				} catch (error) {
					console.error('Error fetching other UDF fields:', error);
					return [];
				}
			},

			// Fetch project types from /rest/projecttype
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
							url: `${BASE_URL}/rest/projecttype`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as { data?: Array<{ id: number; name: string; description?: string; is_active?: boolean }> };

					if (!response.data || !Array.isArray(response.data)) {
						return [];
					}

					return response.data
						.filter((type) => type.is_active !== false) // Only show active project types
						.map((type) => ({
							name: type.name || `Project Type ${type.id}`,
							value: type.id,
							description: type.description || undefined,
						}));
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

					// Fetch once and cache per project type — use project type response (has per-type is_required)
					if (!projectTypeCache[projectTypeIdStr]) {
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this,
								credentialType,
								{
									method: 'GET',
									url: `${BASE_URL}/rest/projects/projecttype/${projectTypeIdStr}`,
									headers: { 'Accept': 'application/json' },
								},
							) as { sections?: Array<{ udfs?: ProjectUDFField[] }> };
							const udfFields: ProjectUDFField[] = [];
							if (projectTypeResponse.sections && Array.isArray(projectTypeResponse.sections)) {
								for (const section of projectTypeResponse.sections) {
									if (section.udfs && Array.isArray(section.udfs)) {
										for (const udf of section.udfs) {
											if (udf.code) udfFields.push(udf as ProjectUDFField);
										}
									}
								}
							}
							projectTypeCache[projectTypeIdStr] = udfFields.filter((field) => {
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
							value: JSON.stringify({ code: field.code, field_type: field.field_type === 'TAGS' ? 'TEXT' : (field.field_type ?? '') }),
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

					if (!projectTypeCache[projectTypeIdStr]) {
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}/rest/projects/projecttype/${projectTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as { sections?: Array<{ udfs?: ProjectUDFField[] }> };
							const udfFields: ProjectUDFField[] = [];
							if (projectTypeResponse.sections?.length) {
								for (const section of projectTypeResponse.sections) {
									if (section.udfs?.length) {
										for (const udf of section.udfs) {
											if (udf.code) udfFields.push(udf as ProjectUDFField);
										}
									}
								}
							}
							projectTypeCache[projectTypeIdStr] = udfFields.filter((field) => {
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
							value: JSON.stringify({ code: field.code, field_type: field.field_type === 'TAGS' ? 'TEXT' : (field.field_type ?? '') }),
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

					if (!projectTypeCache[projectTypeIdStr]) {
						const excludedSystemFields = ['id', 'project_type_id', 'title'];
						try {
							const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
								this, credentialType,
								{ method: 'GET', url: `${BASE_URL}/rest/projects/projecttype/${projectTypeIdStr}`, headers: { 'Accept': 'application/json' } },
							) as { sections?: Array<{ udfs?: ProjectUDFField[] }> };
							const udfFields: ProjectUDFField[] = [];
							if (projectTypeResponse.sections?.length) {
								for (const section of projectTypeResponse.sections) {
									if (section.udfs?.length) {
										for (const udf of section.udfs) {
											if (udf.code) udfFields.push(udf as ProjectUDFField);
										}
									}
								}
							}
							projectTypeCache[projectTypeIdStr] = udfFields.filter((field) => {
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
							value: JSON.stringify({ code: field.code, field_type: field.field_type === 'TAGS' ? 'TEXT' : (field.field_type ?? '') }),
						}));
				} catch (error) {
					console.error('Error fetching other project UDF fields:', error);
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

					const fields = resourceTypeCache[resourceTypeIdStr];
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

					const fields = projectTypeCache[projectTypeIdStr];
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
