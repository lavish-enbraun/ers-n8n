import { 
	NodeConnectionTypes, 
	type INodeType, 
	type INodeTypeDescription,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type IExecuteFunctions,
	type INodeExecutionData
} from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from './constants';
import { resourceDescription } from './resources/resource';
import { projectDescription } from './resources/project';
import { bookingDescription } from './resources/booking';
import { requirementDescription } from './resources/requirement';
import { ratesDescription } from './resources/rates';
import { timesheetDescription } from './resources/timesheet';
import { fetchAllItems } from './utils';

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
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Rates',
						value: 'rates',
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
			...ratesDescription,
			...timesheetDescription,
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
									'ersAppOAuth2Api',
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
				} catch (error: any) {
					// Silently handle missing access token errors (expected when credentials aren't authenticated yet)
					if (error?.message?.includes('access token') || error?.messages?.some((msg: string) => msg.includes('access token'))) {
						return [];
					}
					// Log other unexpected errors
					console.error('Error fetching resource types:', error);
					return [];
				}
			},

			// Fetch user-defined fields for resources from /rest/resources/resourcetype/${id}
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

					// Parse JSON string format if it's a JSON string (new format with is_human)
					if (typeof resourceTypeId === 'string') {
						try {
							const parsed = JSON.parse(resourceTypeId);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) {
								resourceTypeId = parsed.id;
							}
						} catch (e) {
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
							'ersAppOAuth2Api',
							{
								method: 'GET',
								url: `${BASE_URL}/rest/resources/resourcetype/${resourceTypeId}`,
								headers: {
									'Accept': 'application/json',
								},
							},
						) as ResourceTypeResponse;
					} catch (error: any) {
						// Silently handle missing access token errors (expected when credentials aren't authenticated yet)
						if (error?.message?.includes('access token') || error?.messages?.some((msg: string) => msg.includes('access token'))) {
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
				} catch (error: any) {
					// Silently handle missing access token errors (expected when credentials aren't authenticated yet)
					if (error?.message?.includes('access token') || error?.messages?.some((msg: string) => msg.includes('access token'))) {
						return [];
					}
					// Log other unexpected errors
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
					} catch (error: any) {
						// Silently handle missing access token errors (expected when credentials aren't authenticated yet)
						if (error?.message?.includes('access token') || error?.messages?.some((msg: string) => msg.includes('access token'))) {
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
				} catch (error: any) {
					// Silently handle missing access token errors (expected when credentials aren't authenticated yet)
					if (error?.message?.includes('access token') || error?.messages?.some((msg: string) => msg.includes('access token'))) {
						return [];
					}
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

		/**
		 * Loads dropdown options for UDF field values based on the selected field's metadata.
		 * Parses field metadata from JSON to extract available options (e.g., for select/multi-select fields).
		 */
		async getProjectUDFFieldOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			try {
				const currentNode = this.getNode();
				const parameters = currentNode.parameters as { udfFields?: { field?: Array<{ fieldName?: string }> } };
				
				const udfFields = parameters.udfFields;
				if (!udfFields || !udfFields.field || !Array.isArray(udfFields.field) || udfFields.field.length === 0) {
					return [{ name: '', value: '' }];
				}

				// n8n calls this for each field item individually
				const fieldName = udfFields.field[0]?.fieldName as string;
				
				if (!fieldName || fieldName === '') {
					return [{ name: '', value: '' }];
				}

				// Field metadata is stored as JSON string
				interface FieldData {
					code: string;
					field_type: string;
					options: Array<{ id: number | string; name: string; color?: string }>;
				}
				let fieldData: FieldData;
				try {
					fieldData = JSON.parse(fieldName);
				} catch {
					return [{ name: '', value: '' }];
				}

				// Map field options to n8n dropdown format
				if (fieldData.options && Array.isArray(fieldData.options) && fieldData.options.length > 0) {
					const options = fieldData.options.map((option) => ({
						name: option.name,
						value: option.id,
						description: option.color ? `Color: ${option.color}` : undefined,
					}));
					return [{ name: '', value: '' }, ...options];
				}

				return [{ name: '', value: '' }];
			} catch {
				return [{ name: '', value: '' }];
			}
		},
		},
	};

	// Execute method for getAll operations and create operations (for logging)
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Handle getAll operations
		if (operation === 'getAll' && (resource === 'resource' || resource === 'project')) {
			const returnAll = this.getNodeParameter('returnAll', 0, false) as boolean;
			const limit = this.getNodeParameter('limit', 0, 50) as number | undefined;
			
			const totalItemsNeeded = returnAll ? null : (limit || undefined);
			
			const apiUrl = `${BASE_URL}${API_BASE_PATH}/${resource === 'resource' ? 'resources' : 'projects'}`;
			
			const items = await fetchAllItems(
				this.helpers,
				this,
				'ersAppOAuth2Api',
				apiUrl,
				totalItemsNeeded,
				'data'
			);

			// Return items in n8n format
			return [this.helpers.returnJsonArray(items)];
		}

		// Handle create operation for resources (intercept to add logging)
		if (operation === 'create' && resource === 'resource') {
			console.log('\n[Resource Create] ========== STARTING REQUEST ==========');
			
			// Get all parameters
			const resourceTypeId = this.getNodeParameter('resource_type_id', 0) as string | number;
			const firstName = this.getNodeParameter('first_name', 0) as string;
			const startDate = this.getNodeParameter('start_date', 0) as string;
			const udfFields = this.getNodeParameter('udfFields', 0, {}) as { field?: Array<{ fieldName?: string; fieldValueText?: string; fieldValueBoolean?: boolean; fieldValueDate?: string; fieldValueSelect?: string; fieldValueMultiSelect?: string | string[]; fieldValueNumber?: number }> };

			console.log('[Resource Create] Raw Parameters:', JSON.stringify({
				resource_type_id: resourceTypeId,
				first_name: firstName,
				start_date: startDate,
				udfFields: udfFields
			}, null, 2));

			// Parse resource type to get ID and is_human
			let parsedResourceTypeId: number | string = resourceTypeId;
			let isHuman = false;
			if (resourceTypeId) {
				try {
					if (typeof resourceTypeId === 'string' && resourceTypeId.trim().startsWith('{')) {
						const parsed = JSON.parse(resourceTypeId);
						if (parsed && typeof parsed === 'object') {
							if ('id' in parsed) {
								parsedResourceTypeId = parsed.id;
							}
							if ('is_human' in parsed) {
								isHuman = parsed.is_human === true;
							}
						}
					}
				} catch (e) {
					console.log('[Resource Create] Error parsing resource_type_id:', e);
				}
				if (!isHuman && (typeof parsedResourceTypeId === 'number' || (typeof parsedResourceTypeId === 'string' && !isNaN(parseInt(parsedResourceTypeId))))) {
					parsedResourceTypeId = typeof parsedResourceTypeId === 'number' ? parsedResourceTypeId : parseInt(parsedResourceTypeId);
				}
			}

			console.log('[Resource Create] Parsed resourceTypeId:', parsedResourceTypeId, 'isHuman:', isHuman);

			const nameProperty = isHuman ? 'first_name' : 'name';
			const extractId = (value: any): any => {
				if (value === undefined || value === null || value === '') return null;
				if (typeof value === 'number') return value;
				if (typeof value === 'string') {
					try {
						if (value.trim().startsWith('{')) {
							const parsed = JSON.parse(value);
							if (parsed && typeof parsed === 'object' && 'id' in parsed) {
								return parsed.id;
							}
						}
						const num = parseInt(value);
						if (!isNaN(num)) return num;
					} catch (e) {
						// Ignore
					}
					return value;
				}
				if (typeof value === 'object' && 'id' in value) {
					return value.id;
				}
				return value;
			};

			const extractMultiSelectIds = (value: any): any[] => {
				if (value === undefined || value === null) return [];
				if (Array.isArray(value)) {
					if (value.length === 0) return [];
					return value.map(extractId).filter((id: any) => id !== null && id !== undefined);
				}
				const singleId = extractId(value);
				return singleId !== null && singleId !== undefined ? [singleId] : [];
			};

			// Build request body
			const body: any = {
				[nameProperty]: firstName,
				start_date: startDate.split('T')[0],
				resource_type_id: parsedResourceTypeId,
			};

			// Add UDF fields
			if (udfFields?.field && Array.isArray(udfFields.field)) {
				console.log('[Resource Create] Processing UDF fields, count:', udfFields.field.length);
				udfFields.field.forEach((item, index) => {
					if (item.fieldName) {
						try {
							const fieldData = JSON.parse(item.fieldName);
							const fieldCode = fieldData.code;
							console.log(`[Resource Create] UDF Field ${index + 1}:`, fieldCode, 'Type:', fieldData.field_type);
							
							if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== '') {
								body[fieldCode] = item.fieldValueText;
								console.log(`[Resource Create]   -> Text value:`, item.fieldValueText);
							} else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) {
								body[fieldCode] = item.fieldValueBoolean;
								console.log(`[Resource Create]   -> Boolean value:`, item.fieldValueBoolean);
							} else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== '') {
								body[fieldCode] = new Date(item.fieldValueDate).toISOString().split('T')[0];
								console.log(`[Resource Create]   -> Date value:`, body[fieldCode]);
							} else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== '') {
								const id = extractId(item.fieldValueSelect);
								if (id !== null && id !== undefined) {
									body[fieldCode] = id;
									console.log(`[Resource Create]   -> Select value (ID):`, id);
								}
							} else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) {
								const ids = extractMultiSelectIds(item.fieldValueMultiSelect);
								if (ids.length > 0) {
									body[fieldCode] = ids;
									console.log(`[Resource Create]   -> Multi-Select values (IDs):`, ids);
								}
							} else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null) {
								body[fieldCode] = typeof item.fieldValueNumber === 'number' ? item.fieldValueNumber : parseFloat(item.fieldValueNumber);
								console.log(`[Resource Create]   -> Number value:`, body[fieldCode]);
							} else {
								console.log(`[Resource Create]   -> No value provided for field`);
							}
						} catch (e) {
							console.log('[Resource Create] Error processing UDF field:', item.fieldName, e);
						}
					}
				});
			}

			// Log request details in complete format
			const requestUrl = `${BASE_URL}${API_BASE_PATH}/resources`;
			const requestHeaders = {
				'Content-Type': 'application/json',
			};
			
			console.log('\n[Resource Create] ========== REQUEST FORMAT ==========');
			console.log('[Resource Create] HTTP Method: POST');
			console.log('[Resource Create] Request URL:', requestUrl);
			console.log('[Resource Create] Request Headers:');
			console.log(JSON.stringify(requestHeaders, null, 2));
			console.log('[Resource Create] Request Body (JSON):');
			console.log(JSON.stringify(body, null, 2));
			console.log('\n[Resource Create] Complete Request Object:');
			console.log(JSON.stringify({
				method: 'POST',
				url: requestUrl,
				headers: requestHeaders,
				body: body
			}, null, 2));
			console.log('[Resource Create] ========================================\n');

			// Make the API call
			const requestConfig = {
				method: 'POST' as const,
				url: requestUrl,
				headers: requestHeaders,
				body,
			};
			
			console.log('[Resource Create] Sending API Request with config:');
			console.log(JSON.stringify(requestConfig, null, 2));
			console.log('[Resource Create] Request body type:', typeof body);
			console.log('[Resource Create] Request body keys:', Object.keys(body || {}));
			
			try {
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'ersAppOAuth2Api',
					requestConfig,
				);

				// Log response details
				console.log('\n[Resource Create] ========== RESPONSE RECEIVED ==========');
				console.log('[Resource Create] Response Status: Success');
				console.log('[Resource Create] Response Type:', typeof response);
				console.log('[Resource Create] Full Response:', JSON.stringify(response, null, 2));
				if (response && typeof response === 'object') {
					console.log('[Resource Create] Response Keys:', Object.keys(response));
				}
				console.log('[Resource Create] ========================================\n');

				// Return response in n8n format
				// Extract data property if it exists, otherwise return full response
				const responseData = (response as any)?.data || response;
				return [[{ json: responseData }]];
			} catch (error: any) {
				// Log error details
				console.log('\n[Resource Create] ========== ERROR ==========');
				console.log('[Resource Create] Error occurred during API call');
				console.log('[Resource Create] Error Message:', error.message || 'Unknown error');
				console.log('[Resource Create] Error Name:', error.name);
				console.log('[Resource Create] Error Stack:', error.stack);
				if (error.response) {
					console.log('[Resource Create] Error Response Status:', error.response.status);
					console.log('[Resource Create] Error Response Status Text:', error.response.statusText);
					console.log('[Resource Create] Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
					console.log('[Resource Create] Error Response Data:', JSON.stringify(error.response.data, null, 2));
				}
				if (error.request) {
					console.log('[Resource Create] Request was made but no response received');
					console.log('[Resource Create] Request details:', JSON.stringify(error.request, null, 2));
				}
				console.log('[Resource Create] ========================================\n');
				
				// Re-throw the error so n8n can handle it
				throw error;
			}
		}

		// For other operations, let n8n handle routing automatically
		return [[]];
	}
}
