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
				name: 'ersAppOAuth2V2OAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2', 'oAuth2V2'],
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
						name: 'OAuth2 (Configurable)',
						value: 'oAuth2V2',
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
							: 'ersAppOAuth2V2OAuth2Api';
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

			// Fetch user-defined fields for resources from /rest/resources/resourcetype/${id}
			async getResourceUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the selected resource_type_id from node parameters
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { resource_type_id?: number | string; authentication?: string };
					let resourceTypeId = parameters.resource_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2V2OAuth2Api';

					// Debug: Log the parameter value to help diagnose issues
					console.log('getResourceUDFFields called with resource_type_id:', resourceTypeId, 'Type:', typeof resourceTypeId);

					// Convert to string/number if needed and handle empty values
					if (resourceTypeId === '' || resourceTypeId === null || resourceTypeId === undefined) {
						console.warn('resource_type_id is empty, null, or undefined');
						return [];
					}

					// Parse JSON string format if it's a JSON string (new format with is_human)
					if (typeof resourceTypeId === 'string') {
						try {
							const parsed = JSON.parse(resourceTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) {
								resourceTypeId = parsed.id;
							}
						} catch {
							// Not a JSON string, use as-is
						}
					}

					// Ensure resourceTypeId is a string for URL construction
					resourceTypeId = String(resourceTypeId);

					interface UDFOption {
						id: number | string;
						name: string;
						color?: string;
						description?: string;
						udf_desc_id?: number;
					}

					interface UDFField {
						code: string;
						display_name?: string;
						field_type?: string;
						is_system_defined?: boolean;
						is_required?: boolean;
						help_text?: string;
						information_text?: string;
						options?: UDFOption[];
						mindate?: string;
						maxdate?: string;
						minlength?: number;
						maxlength?: number;
						regex?: string;
					}

					interface ResourceTypeSection {
						udfs?: UDFField[];
					}

					interface ResourceTypeResponse {
						sections?: ResourceTypeSection[];
					}

					// Fetch UDF fields directly from resource type endpoint
					let resourceTypeResponse: ResourceTypeResponse;
					try {
						resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							credentialType,
							{
								method: 'GET',
								url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as ResourceTypeResponse;
					} catch (error: unknown) {
						if (isAccessTokenError(error)) {
							return [];
						}
						console.error('Error fetching resource type fields:', error);
						return [];
					}

					// Extract all UDF fields from sections
					const udfFields: UDFField[] = [];
					if (resourceTypeResponse.sections && Array.isArray(resourceTypeResponse.sections)) {
						resourceTypeResponse.sections.forEach((section) => {
							if (section.udfs && Array.isArray(section.udfs)) {
								section.udfs.forEach((udf) => {
									if (udf.code) {
										udfFields.push(udf);
									}
								});
							}
						});
					}

					// If no fields were found, log a warning
					if (udfFields.length === 0) {
						console.warn(`No UDF fields found for resource type ${resourceTypeId}. Response structure:`, JSON.stringify(resourceTypeResponse, null, 2));
						return [];
					}

					// Filter and map UDF fields
					const excludedSystemFields = ['id', 'resource_type_id', 'first_name', 'start_date'];
					
					const fields = udfFields
						.filter((field: UDFField) => {
							// Exclude system fields that are already in the static form
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							return true; // All fields from this endpoint are already filtered for this resource type
						})
						.sort((a: UDFField, b: UDFField) => {
							// Sort by is_required: true fields first, then false/undefined fields
							const aRequired = a.is_required === true ? 1 : 0;
							const bRequired = b.is_required === true ? 1 : 0;
							return bRequired - aRequired; // Descending: 1 (required) comes before 0 (not required)
						})
						.map((field: UDFField) => {
							// Build description with helpful info
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}
							if (field.is_required) {
								description = description ? `${description} - Required` : 'Required field';
							}

							// Normalize options to only include id, name, and color
							const normalizedOptions = (field.options || []).map((option) => ({
								id: option.id,
								name: option.name,
								color: option.color,
							}));

							// Store field metadata as JSON string in the value
							const fieldData = {
								code: field.code,
								field_type: field.field_type || '',
								options: normalizedOptions,
								mindate: field.mindate,
								maxdate: field.maxdate,
								minlength: field.minlength,
								maxlength: field.maxlength,
								regex: field.regex,
							};

							return {
								name: field.display_name || field.code,
								value: JSON.stringify(fieldData),
								description: description || undefined,
							};
						});

					return fields;
				} catch (error) {
					console.error('Error fetching UDF fields:', error);
					return [];
				}
			},

			// Fetch mandatory user-defined fields (is_required: true) for resources
			async getResourceUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { resource_type_id?: number | string; authentication?: string };
					let resourceTypeId = parameters.resource_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2V2OAuth2Api';

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
							// Not a JSON string, use as-is
						}
					}

					resourceTypeId = String(resourceTypeId);

					interface UDFOption {
						id: number | string;
						name: string;
						color?: string;
						description?: string;
						udf_desc_id?: number;
					}

					interface UDFField {
						code: string;
						display_name?: string;
						field_type?: string;
						is_system_defined?: boolean;
						is_required?: boolean;
						help_text?: string;
						information_text?: string;
						options?: UDFOption[];
						mindate?: string;
						maxdate?: string;
						minlength?: number;
						maxlength?: number;
						regex?: string;
					}

					interface ResourceTypeSection {
						udfs?: UDFField[];
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
								url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as ResourceTypeResponse;
					} catch (error: unknown) {
						if (isAccessTokenError(error)) {
							return [];
						}
						console.error('Error fetching resource type fields:', error);
						return [];
					}

					const udfFields: UDFField[] = [];
					if (resourceTypeResponse.sections && Array.isArray(resourceTypeResponse.sections)) {
						resourceTypeResponse.sections.forEach((section) => {
							if (section.udfs && Array.isArray(section.udfs)) {
								section.udfs.forEach((udf) => {
									if (udf.code) {
										udfFields.push(udf);
									}
								});
							}
						});
					}

					if (udfFields.length === 0) {
						return [];
					}

					const excludedSystemFields = ['id', 'resource_type_id', 'first_name', 'start_date', 'name'];
					
					const fields = udfFields
						.filter((field: UDFField) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							// Only include fields where is_required is true
							return field.is_required === true;
						})
						.map((field: UDFField) => {
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}
							if (field.is_required) {
								description = description ? `${description} - Required` : 'Required field';
							}

							const normalizedOptions = (field.options || []).map((option) => ({
								id: option.id,
								name: option.name,
								color: option.color,
							}));

							const fieldData = {
								code: field.code,
								field_type: field.field_type || '',
								options: normalizedOptions,
								mindate: field.mindate,
								maxdate: field.maxdate,
								minlength: field.minlength,
								maxlength: field.maxlength,
								regex: field.regex,
							};

							return {
								name: field.display_name || field.code,
								value: JSON.stringify(fieldData),
								description: description || undefined,
							};
						});

					return fields;
				} catch (error) {
					console.error('Error fetching mandatory UDF fields:', error);
					return [];
				}
			},

			// Fetch other user-defined fields (is_required: false or undefined) for resources
			async getResourceUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { resource_type_id?: number | string; authentication?: string };
					let resourceTypeId = parameters.resource_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2V2OAuth2Api';

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
							// Not a JSON string, use as-is
						}
					}

					resourceTypeId = String(resourceTypeId);

					interface UDFOption {
						id: number | string;
						name: string;
						color?: string;
						description?: string;
						udf_desc_id?: number;
					}

					interface UDFField {
						code: string;
						display_name?: string;
						field_type?: string;
						is_system_defined?: boolean;
						is_required?: boolean;
						help_text?: string;
						information_text?: string;
						options?: UDFOption[];
						mindate?: string;
						maxdate?: string;
						minlength?: number;
						maxlength?: number;
						regex?: string;
					}

					interface ResourceTypeSection {
						udfs?: UDFField[];
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
								url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as ResourceTypeResponse;
					} catch (error: unknown) {
						if (isAccessTokenError(error)) {
							return [];
						}
						console.error('Error fetching resource type fields:', error);
						return [];
					}

					const udfFields: UDFField[] = [];
					if (resourceTypeResponse.sections && Array.isArray(resourceTypeResponse.sections)) {
						resourceTypeResponse.sections.forEach((section) => {
							if (section.udfs && Array.isArray(section.udfs)) {
								section.udfs.forEach((udf) => {
									if (udf.code) {
										udfFields.push(udf);
									}
								});
							}
						});
					}

					if (udfFields.length === 0) {
						return [];
					}

					const excludedSystemFields = ['id', 'resource_type_id', 'first_name', 'start_date'];
					
					const fields = udfFields
						.filter((field: UDFField) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							// Only include fields where is_required is false or undefined
							return field.is_required !== true;
						})
						.map((field: UDFField) => {
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}

							const normalizedOptions = (field.options || []).map((option) => ({
								id: option.id,
								name: option.name,
								color: option.color,
							}));

							const fieldData = {
								code: field.code,
								field_type: field.field_type || '',
								options: normalizedOptions,
								mindate: field.mindate,
								maxdate: field.maxdate,
								minlength: field.minlength,
								maxlength: field.maxlength,
								regex: field.regex,
							};

							return {
								name: field.display_name || field.code,
								value: JSON.stringify(fieldData),
								description: description || undefined,
							};
						});

					return fields;
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
							: 'ersAppOAuth2V2OAuth2Api';
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

			// Fetch user-defined fields for projects from /rest/projects/udfs
			async getProjectUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the selected project_type_id from node parameters
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { project_type_id?: number | string; authentication?: string };
					let projectTypeId = parameters.project_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2V2OAuth2Api';

					// Debug: Log the parameter value to help diagnose issues
					console.log('getProjectUDFFields called with project_type_id:', projectTypeId, 'Type:', typeof projectTypeId);

					// Convert to string/number if needed and handle empty values
					if (projectTypeId === '' || projectTypeId === null || projectTypeId === undefined) {
						console.warn('project_type_id is empty, null, or undefined');
						return [];
					}

					// Ensure projectTypeId is a string for URL construction
					projectTypeId = String(projectTypeId);

					// Fetch available fields for this project type
					const availableFieldCodes: string[] = [];
					try {
						const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							credentialType,
							{
								method: 'GET',
								url: `${BASE_URL}/rest/projects/projecttype/${projectTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as { sections?: Array<{ udfs?: Array<{ code?: string }> }> };
						
						// Extract field codes from sections[].udfs[].code
						if (projectTypeResponse.sections && Array.isArray(projectTypeResponse.sections)) {
							projectTypeResponse.sections.forEach((section) => {
								if (section.udfs && Array.isArray(section.udfs)) {
									section.udfs.forEach((udf) => {
										if (udf.code) {
											availableFieldCodes.push(udf.code);
										}
									});
								}
							});
						}

						// Debug: Log if no field codes were found
						if (availableFieldCodes.length === 0) {
							console.warn(`No field codes found for project type ${projectTypeId}. Response structure:`, JSON.stringify(projectTypeResponse, null, 2));
						}
					} catch (error: unknown) {
						if (isAccessTokenError(error)) {
							return [];
						}
						console.error('Error fetching project type fields:', error);
						// If this fails, return empty array to avoid showing wrong fields
						return [];
					}

					interface UDFField {
						code: string;
						display_name: string;
						field_type: string;
						is_system_defined: boolean;
						is_required: boolean;
						availability: number;
						help_text?: string;
						information_text?: string;
						options?: Array<{ id: number | string; name: string; color?: string }>;
						mindate?: string;
						maxdate?: string;
						minlength?: number;
						maxlength?: number;
						regex?: string;
					}
					interface UDFResponse {
						data: UDFField[];
					}

					// Fetch all UDF fields
					const udfResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialType,
						{
							method: 'GET',
							url: `${BASE_URL}/rest/projects/udf`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as UDFResponse;

					if (!udfResponse.data || !Array.isArray(udfResponse.data)) {
						return [];
					}

					// Filter UDF fields based on what's available for this project type
					const excludedSystemFields = ['id', 'project_type_id', 'title'];
					
					// If no field codes were found, log a warning but don't filter everything out
					// This might indicate the API structure is different or there are no UDFs for this type
					if (availableFieldCodes.length === 0) {
						console.warn(`No available field codes found for project type ${projectTypeId}. This might indicate no UDFs are configured for this project type.`);
						// Return empty array since we can't determine which fields are valid
						return [];
					}
					
					const fields = udfResponse.data
						.filter((field: UDFField) => {
							// Exclude system fields that are already in the static form
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							
							// Only include fields that are available for this project type
							return availableFieldCodes.includes(field.code);
						})
						.sort((a: UDFField, b: UDFField) => {
							// Sort by is_required: true fields first, then false/undefined fields
							const aRequired = a.is_required === true ? 1 : 0;
							const bRequired = b.is_required === true ? 1 : 0;
							return bRequired - aRequired; // Descending: 1 (required) comes before 0 (not required)
						})
						.map((field: UDFField) => {
							// Build description with helpful info
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}
							if (field.is_required) {
								description = description ? `${description} - Required` : 'Required field';
							}

							// Normalize options to only include id, name, and color
							const normalizedOptions = (field.options || []).map((option) => ({
								id: option.id,
								name: option.name,
								color: option.color,
							}));

							// Store field metadata as JSON string in the value
							const fieldData = {
								code: field.code,
								field_type: field.field_type,
								options: normalizedOptions,
								mindate: field.mindate,
								maxdate: field.maxdate,
								minlength: field.minlength,
								maxlength: field.maxlength,
								regex: field.regex,
							};

							return {
								name: field.display_name || field.code,
								value: JSON.stringify(fieldData),
								description: description || undefined,
							};
						});

					return fields;
				} catch (error: unknown) {
					if (isAccessTokenError(error)) {
						return [];
					}
					console.error('Error fetching UDF fields:', error);
					return [];
				}
			},

			// Fetch mandatory user-defined fields (is_required: true) for projects
			async getProjectUDFFieldsMandatory(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { project_type_id?: number | string; authentication?: string };
					let projectTypeId = parameters.project_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2V2OAuth2Api';

					if (projectTypeId === '' || projectTypeId === null || projectTypeId === undefined) {
						return [];
					}

					projectTypeId = String(projectTypeId);

					// Fetch available fields for this project type
					const availableFieldCodes: string[] = [];
					try {
						const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							credentialType,
							{
								method: 'GET',
								url: `${BASE_URL}/rest/projects/projecttype/${projectTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as { sections?: Array<{ udfs?: Array<{ code?: string }> }> };
						
						if (projectTypeResponse.sections && Array.isArray(projectTypeResponse.sections)) {
							projectTypeResponse.sections.forEach((section) => {
								if (section.udfs && Array.isArray(section.udfs)) {
									section.udfs.forEach((udf) => {
										if (udf.code) {
											availableFieldCodes.push(udf.code);
										}
									});
								}
							});
						}
					} catch (error: unknown) {
						if (isAccessTokenError(error)) {
							return [];
						}
						console.error('Error fetching project type fields:', error);
						return [];
					}

					if (availableFieldCodes.length === 0) {
						return [];
					}

					interface UDFField {
						code: string;
						display_name: string;
						field_type: string;
						is_system_defined: boolean;
						is_required: boolean;
						availability: number;
						help_text?: string;
						information_text?: string;
						options?: Array<{ id: number | string; name: string; color?: string }>;
						mindate?: string;
						maxdate?: string;
						minlength?: number;
						maxlength?: number;
						regex?: string;
					}
					interface UDFResponse {
						data: UDFField[];
					}

					const udfResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialType,
						{
							method: 'GET',
							url: `${BASE_URL}/rest/projects/udf`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as UDFResponse;

					if (!udfResponse.data || !Array.isArray(udfResponse.data)) {
						return [];
					}

					const excludedSystemFields = ['id', 'project_type_id', 'title'];
					
					const fields = udfResponse.data
						.filter((field: UDFField) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							if (!availableFieldCodes.includes(field.code)) {
								return false;
							}
							// Only include fields where is_required is true
							return field.is_required === true;
						})
						.map((field: UDFField) => {
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}
							if (field.is_required) {
								description = description ? `${description} - Required` : 'Required field';
							}

							// Normalize options to only include id, name, and color
							const normalizedOptions = (field.options || []).map((option) => ({
								id: option.id,
								name: option.name,
								color: option.color,
							}));

							const fieldData = {
								code: field.code,
								field_type: field.field_type,
								options: normalizedOptions,
								mindate: field.mindate,
								maxdate: field.maxdate,
								minlength: field.minlength,
								maxlength: field.maxlength,
								regex: field.regex,
							};

							return {
								name: field.display_name || field.code,
								value: JSON.stringify(fieldData),
								description: description || undefined,
							};
						});

					return fields;
				} catch (error) {
					console.error('Error fetching mandatory project UDF fields:', error);
					return [];
				}
			},

			// Fetch other user-defined fields (is_required: false or undefined) for projects
			async getProjectUDFFieldsOther(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { project_type_id?: number | string; authentication?: string };
					let projectTypeId = parameters.project_type_id;
					const credentialType =
						parameters.authentication === 'accessToken'
							? 'ersAppAccessTokenApi'
							: 'ersAppOAuth2V2OAuth2Api';

					if (projectTypeId === '' || projectTypeId === null || projectTypeId === undefined) {
						return [];
					}

					projectTypeId = String(projectTypeId);

					// Fetch available fields for this project type
					const availableFieldCodes: string[] = [];
					try {
						const projectTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							credentialType,
							{
								method: 'GET',
								url: `${BASE_URL}/rest/projects/projecttype/${projectTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as { sections?: Array<{ udfs?: Array<{ code?: string }> }> };
						
						if (projectTypeResponse.sections && Array.isArray(projectTypeResponse.sections)) {
							projectTypeResponse.sections.forEach((section) => {
								if (section.udfs && Array.isArray(section.udfs)) {
									section.udfs.forEach((udf) => {
										if (udf.code) {
											availableFieldCodes.push(udf.code);
										}
									});
								}
							});
						}
					} catch (error: unknown) {
						if (isAccessTokenError(error)) {
							return [];
						}
						console.error('Error fetching project type fields:', error);
						return [];
					}

					if (availableFieldCodes.length === 0) {
						return [];
					}

					interface UDFField {
						code: string;
						display_name: string;
						field_type: string;
						is_system_defined: boolean;
						is_required: boolean;
						availability: number;
						help_text?: string;
						information_text?: string;
						options?: Array<{ id: number | string; name: string; color?: string }>;
						mindate?: string;
						maxdate?: string;
						minlength?: number;
						maxlength?: number;
						regex?: string;
					}
					interface UDFResponse {
						data: UDFField[];
					}

					const udfResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						credentialType,
						{
							method: 'GET',
							url: `${BASE_URL}/rest/projects/udf`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as UDFResponse;

					if (!udfResponse.data || !Array.isArray(udfResponse.data)) {
						return [];
					}

					const excludedSystemFields = ['id', 'project_type_id', 'title'];
					
					const fields = udfResponse.data
						.filter((field: UDFField) => {
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							if (!availableFieldCodes.includes(field.code)) {
								return false;
							}
							// Only include fields where is_required is false or undefined
							return field.is_required !== true;
						})
						.map((field: UDFField) => {
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}

							// Normalize options to only include id, name, and color
							const normalizedOptions = (field.options || []).map((option) => ({
								id: option.id,
								name: option.name,
								color: option.color,
							}));

							const fieldData = {
								code: field.code,
								field_type: field.field_type,
								options: normalizedOptions,
								mindate: field.mindate,
								maxdate: field.maxdate,
								minlength: field.minlength,
								maxlength: field.maxlength,
								regex: field.regex,
							};

							return {
								name: field.display_name || field.code,
								value: JSON.stringify(fieldData),
								description: description || undefined,
							};
						});

					return fields;
				} catch (error) {
					console.error('Error fetching other project UDF fields:', error);
					return [];
				}
			},

			// Get options for dropdown/select fields
			async getResourceUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the current node parameters to find the selected field
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { 
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						udfFields?: { field?: Array<{ fieldName?: string }> };
					};
					
					// Check mandatoryFields, otherFields, and udfFields
					const mandatoryFields = parameters.mandatoryFields;
					const otherFields = parameters.otherFields;
					const udfFields = parameters.udfFields;
					
					// Try to find fieldName from mandatoryFields first, then otherFields, then udfFields
					let fieldName: string | undefined;
					
					// Check mandatoryFields
					if (mandatoryFields?.field && Array.isArray(mandatoryFields.field) && mandatoryFields.field.length > 0) {
						// First, try to get from the last item (most likely the one being edited)
						for (let i = mandatoryFields.field.length - 1; i >= 0; i--) {
							const item = mandatoryFields.field[i];
							if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
								fieldName = item.fieldName;
								break;
							}
						}
						
						// If still no fieldName found, try the first item
						if (!fieldName && mandatoryFields.field[0]?.fieldName) {
							fieldName = mandatoryFields.field[0].fieldName as string;
						}
					}
					
					// If not found in mandatoryFields, check otherFields
					if (!fieldName && otherFields?.field && Array.isArray(otherFields.field) && otherFields.field.length > 0) {
						// First, try to get from the last item (most likely the one being edited)
						for (let i = otherFields.field.length - 1; i >= 0; i--) {
							const item = otherFields.field[i];
							if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
								fieldName = item.fieldName;
								break;
							}
						}
						
						// If still no fieldName found, try the first item
						if (!fieldName && otherFields.field[0]?.fieldName) {
							fieldName = otherFields.field[0].fieldName as string;
						}
					}
					
					// If not found in mandatoryFields or otherFields, check udfFields (for update operations)
					if (!fieldName && udfFields?.field && Array.isArray(udfFields.field) && udfFields.field.length > 0) {
						// First, try to get from the last item (most likely the one being edited)
						for (let i = udfFields.field.length - 1; i >= 0; i--) {
							const item = udfFields.field[i];
							if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
								fieldName = item.fieldName;
								break;
							}
						}
						
						// If still no fieldName found, try the first item
						if (!fieldName && udfFields.field[0]?.fieldName) {
							fieldName = udfFields.field[0].fieldName as string;
						}
					}
					
					// If no fieldName found in any item, return empty
					if (!fieldName || fieldName === '') {
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Parse the field metadata
					interface FieldData {
						code: string;
						field_type: string;
						options: Array<{ id: number | string; name: string; color?: string }>;
					}
					let fieldData: FieldData;
					try {
						fieldData = JSON.parse(fieldName);
					} catch (parseError) {
						console.error('Error parsing fieldName JSON:', parseError, 'fieldName:', fieldName);
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Return options if available
					if (fieldData.options && Array.isArray(fieldData.options) && fieldData.options.length > 0) {
						const options = fieldData.options.map((option) => {
							// Ensure we have both name and id
							const optionName = option.name || String(option.id);
							const optionId = option.id;
							return {
								name: optionName,
								value: optionId,
								description: option.color ? `Color: ${option.color}` : undefined,
							};
						});
						// Add empty option at the beginning to allow empty string default
						return [{ name: '', value: '' }, ...options];
					}

					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				} catch (error) {
					console.error('Error in getResourceUDFFieldOptions:', error);
					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				}
			},

			// Get options for dropdown/select fields for projects
			async getProjectUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the current node parameters to find the selected field
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { 
						mandatoryFields?: { field?: Array<{ fieldName?: string }> };
						otherFields?: { field?: Array<{ fieldName?: string }> };
						udfFields?: { field?: Array<{ fieldName?: string }> };
					};
					
					// Check mandatoryFields, otherFields, and udfFields
					const mandatoryFields = parameters.mandatoryFields;
					const otherFields = parameters.otherFields;
					const udfFields = parameters.udfFields;
					
					// Try to find fieldName from mandatoryFields first, then otherFields, then udfFields
					let fieldName: string | undefined;
					
					// Check mandatoryFields
					if (mandatoryFields?.field && Array.isArray(mandatoryFields.field) && mandatoryFields.field.length > 0) {
						// First, try to get from the last item (most likely the one being edited)
						for (let i = mandatoryFields.field.length - 1; i >= 0; i--) {
							const item = mandatoryFields.field[i];
							if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
								fieldName = item.fieldName;
								break;
							}
						}
						
						// If still no fieldName found, try the first item
						if (!fieldName && mandatoryFields.field[0]?.fieldName) {
							fieldName = mandatoryFields.field[0].fieldName as string;
						}
					}
					
					// If not found in mandatoryFields, check otherFields
					if (!fieldName && otherFields?.field && Array.isArray(otherFields.field) && otherFields.field.length > 0) {
						// First, try to get from the last item (most likely the one being edited)
						for (let i = otherFields.field.length - 1; i >= 0; i--) {
							const item = otherFields.field[i];
							if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
								fieldName = item.fieldName;
								break;
							}
						}
						
						// If still no fieldName found, try the first item
						if (!fieldName && otherFields.field[0]?.fieldName) {
							fieldName = otherFields.field[0].fieldName as string;
						}
					}
					
					// If not found in mandatoryFields or otherFields, check udfFields (for update operations)
					if (!fieldName && udfFields?.field && Array.isArray(udfFields.field) && udfFields.field.length > 0) {
						// First, try to get from the last item (most likely the one being edited)
						for (let i = udfFields.field.length - 1; i >= 0; i--) {
							const item = udfFields.field[i];
							if (item?.fieldName && typeof item.fieldName === 'string' && item.fieldName.trim() !== '') {
								fieldName = item.fieldName;
								break;
							}
						}
						
						// If still no fieldName found, try the first item
						if (!fieldName && udfFields.field[0]?.fieldName) {
							fieldName = udfFields.field[0].fieldName as string;
						}
					}
					
					// If no fieldName found in any item, return empty
					if (!fieldName || fieldName === '') {
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Parse the field metadata
					interface FieldData {
						code: string;
						field_type: string;
						options: Array<{ id: number | string; name: string; color?: string }>;
					}
					let fieldData: FieldData;
					try {
						fieldData = JSON.parse(fieldName);
					} catch (parseError) {
						console.error('Error parsing fieldName JSON:', parseError, 'fieldName:', fieldName);
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Return options if available
					if (fieldData.options && Array.isArray(fieldData.options) && fieldData.options.length > 0) {
						const options = fieldData.options.map((option) => {
							// Ensure we have both name and id
							const optionName = option.name || String(option.id);
							const optionId = option.id;
							return {
								name: optionName,
								value: optionId,
								description: option.color ? `Color: ${option.color}` : undefined,
							};
						});
						// Add empty option at the beginning to allow empty string default
						return [{ name: '', value: '' }, ...options];
					}

					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				} catch (error) {
					console.error('Error in getProjectUDFFieldOptions:', error);
					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				}
			},
		},
	};
}
