import { 
	NodeConnectionTypes, 
	type INodeType, 
	type INodeTypeDescription,
	type ILoadOptionsFunctions,
	type INodePropertyOptions 
} from 'n8n-workflow';
import { BASE_URL} from './constants';
import { resourceDescription } from './resources/resource';
import { projectDescription } from './resources/project';
import { bookingDescription } from './resources/booking';
import { requirementDescription } from './resources/requirement';
import { exceptionDescription } from './resources/exception';

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
		credentials: [{ name: 'ersAppOAuth2Api', required: true }],
		requestDefaults: {
			baseURL: `${BASE_URL}/login/oauth/authorize`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
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
						name: 'Exception',
						value: 'exception',
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
				],
				default: 'resource',
			},
			...resourceDescription,
			...projectDescription,
			...bookingDescription,
			...requirementDescription,
			...exceptionDescription,
		],
	};

	methods = {
		loadOptions: {
			// Fetch resource types from /rest/resourcetype
			async getResourceTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'ersAppOAuth2Api',
						{
							method: 'GET',
							url: `${BASE_URL}/rest/resourcetype`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as { data?: Array<{ id: number; name: string; description?: string; is_active?: boolean }> };

					if (!response.data || !Array.isArray(response.data)) {
						return [];
					}

					return response.data
						.filter((type) => type.is_active !== false) // Only show active resource types
						.map((type) => ({
							name: type.name || `Resource Type ${type.id}`,
							value: type.id,
							description: type.description || undefined,
						}));
				} catch (error) {
					console.error('Error fetching resource types:', error);
					return [];
				}
			},

			// Fetch user-defined fields for resources from /rest/resources/udf
			async getResourceUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the selected resource_type_id from node parameters
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { resource_type_id?: number | string };
					let resourceTypeId = parameters.resource_type_id;

					// Debug: Log the parameter value to help diagnose issues
					console.log('getResourceUDFFields called with resource_type_id:', resourceTypeId, 'Type:', typeof resourceTypeId);

					// Convert to string/number if needed and handle empty values
					if (resourceTypeId === '' || resourceTypeId === null || resourceTypeId === undefined) {
						console.warn('resource_type_id is empty, null, or undefined');
						return [];
					}

					// Ensure resourceTypeId is a string for URL construction
					resourceTypeId = String(resourceTypeId);

					// Fetch available fields for this resource type
					const availableFieldCodes: string[] = [];
					try {
						const resourceTypeResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'ersAppOAuth2Api',
							{
								method: 'GET',
								url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as { sections?: Array<{ udfs?: Array<{ code?: string }> }> };
						
						// Extract field codes from sections[].udfs[].code
						if (resourceTypeResponse.sections && Array.isArray(resourceTypeResponse.sections)) {
							resourceTypeResponse.sections.forEach((section) => {
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
							console.warn(`No field codes found for resource type ${resourceTypeId}. Response structure:`, JSON.stringify(resourceTypeResponse, null, 2));
						}
					} catch (error) {
						console.error('Error fetching resource type fields:', error);
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
						'ersAppOAuth2Api',
						{
							method: 'GET',
							url: `${BASE_URL}/rest/resources/udf`,
							headers: {
								'Accept': 'application/json',
							},
						},
					) as UDFResponse;

					if (!udfResponse.data || !Array.isArray(udfResponse.data)) {
						return [];
					}

					// Filter UDF fields based on what's available for this resource type
					const excludedSystemFields = ['id', 'resource_type_id', 'first_name', 'start_date'];
					
					// If no field codes were found, log a warning but don't filter everything out
					// This might indicate the API structure is different or there are no UDFs for this type
					if (availableFieldCodes.length === 0) {
						console.warn(`No available field codes found for resource type ${resourceTypeId}. This might indicate no UDFs are configured for this resource type.`);
						// Return empty array since we can't determine which fields are valid
						return [];
					}
					
					const fields = udfResponse.data
						.filter((field: UDFField) => {
							// Exclude system fields that are already in the static form
							if (field.is_system_defined && excludedSystemFields.includes(field.code)) {
								return false;
							}
							
							// Only include fields that are available for this resource type
							return availableFieldCodes.includes(field.code);
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

							// Store field metadata as JSON string in the value
							const fieldData = {
								code: field.code,
								field_type: field.field_type,
								options: field.options || [],
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

			// Fetch project types from /rest/projecttype
			async getProjectTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'ersAppOAuth2Api',
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
				} catch (error) {
					console.error('Error fetching project types:', error);
					return [];
				}
			},

			// Fetch user-defined fields for projects from /rest/projects/udfs
			async getProjectUDFFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the selected project_type_id from node parameters
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { project_type_id?: number | string };
					let projectTypeId = parameters.project_type_id;

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
							'ersAppOAuth2Api',
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
					} catch (error) {
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
						'ersAppOAuth2Api',
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
						.map((field: UDFField) => {
							// Build description with helpful info
							let description = field.help_text || field.information_text || '';
							if (field.field_type) {
								description = description ? `${description} (Type: ${field.field_type})` : `Type: ${field.field_type}`;
							}
							if (field.is_required) {
								description = description ? `${description} - Required` : 'Required field';
							}

							// Store field metadata as JSON string in the value
							const fieldData = {
								code: field.code,
								field_type: field.field_type,
								options: field.options || [],
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

			// Get options for dropdown/select fields
			async getResourceUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the current node parameters to find the selected field
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { udfFields?: { field?: Array<{ fieldName?: string }> } };
					
					// Try to get the fieldName from the current context
					// This is tricky because we need to know which item in the array we're editing
					// For now, we'll get the first field's fieldName
					const udfFields = parameters.udfFields;
					if (!udfFields || !udfFields.field || !Array.isArray(udfFields.field) || udfFields.field.length === 0) {
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Get the first field's fieldName (in practice, n8n will call this for the current item)
					const fieldName = udfFields.field[0]?.fieldName as string;
					
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
					} catch {
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Return options if available
					if (fieldData.options && Array.isArray(fieldData.options) && fieldData.options.length > 0) {
						const options = fieldData.options.map((option) => ({
							name: option.name,
							value: option.id,
							description: option.color ? `Color: ${option.color}` : undefined,
						}));
						// Add empty option at the beginning to allow empty string default
						return [{ name: '', value: '' }, ...options];
					}

					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				} catch {
					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				}
			},

			// Get options for dropdown/select fields for projects
			async getProjectUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					// Get the current node parameters to find the selected field
					const currentNode = this.getNode();
					const parameters = currentNode.parameters as { udfFields?: { field?: Array<{ fieldName?: string }> } };
					
					// Try to get the fieldName from the current context
					// This is tricky because we need to know which item in the array we're editing
					// For now, we'll get the first field's fieldName
					const udfFields = parameters.udfFields;
					if (!udfFields || !udfFields.field || !Array.isArray(udfFields.field) || udfFields.field.length === 0) {
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Get the first field's fieldName (in practice, n8n will call this for the current item)
					const fieldName = udfFields.field[0]?.fieldName as string;
					
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
					} catch {
						// Return empty option to allow empty string default
						return [{ name: '', value: '' }];
					}

					// Return options if available
					if (fieldData.options && Array.isArray(fieldData.options) && fieldData.options.length > 0) {
						const options = fieldData.options.map((option) => ({
							name: option.name,
							value: option.id,
							description: option.color ? `Color: ${option.color}` : undefined,
						}));
						// Add empty option at the beginning to allow empty string default
						return [{ name: '', value: '' }, ...options];
					}

					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				} catch {
					// Return empty option to allow empty string default
					return [{ name: '', value: '' }];
				}
			},
		},
	};
}
