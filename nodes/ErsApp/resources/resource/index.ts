import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { resourceGetResourcesDescription } from './getAll';
import { resourceCreateDescription } from './create';
import { resourceUpdateDescription } from './update';
import { resourceDeleteDescription } from './delete';

const showOnlyForResources = {
	resource: ['resource'],
};

export const resourceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForResources,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a resource',
				description: 'Create a new resource',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/resources`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ (() => { let resourceTypeId = $parameter.resource_type_id; let isHuman = false; if (resourceTypeId) { try { if (typeof resourceTypeId === "string" && resourceTypeId.trim().startsWith("{")) { const parsed = JSON.parse(resourceTypeId); if (parsed && typeof parsed === "object") { if ("id" in parsed) { resourceTypeId = parsed.id; } if ("is_human" in parsed) { isHuman = parsed.is_human === true; } } } } catch (e) { } if (!isHuman && (typeof resourceTypeId === "number" || (typeof resourceTypeId === "string" && !isNaN(parseInt(resourceTypeId))))) { resourceTypeId = typeof resourceTypeId === "number" ? resourceTypeId : parseInt(resourceTypeId); } } const nameProperty = isHuman ? "first_name" : "name"; const body = { [nameProperty]: $parameter.first_name, start_date: $parameter.start_date ? new Date($parameter.start_date).toISOString().split("T")[0] : $parameter.start_date, resource_type_id: resourceTypeId, ...($parameter.additionalFields?.email ? { email: $parameter.additionalFields.email } : {}), ...($parameter.additionalFields?.phone ? { phone: $parameter.additionalFields.phone } : {}), ...($parameter.additionalFields?.calendar ? { calendar: $parameter.additionalFields.calendar } : {}), ...($parameter.additionalFields?.last_name ? { last_name: $parameter.additionalFields.last_name } : {}), ...($parameter.additionalFields?.last_date ? { last_date: new Date($parameter.additionalFields.last_date).toISOString().split("T")[0] } : {}), ...($parameter.udfFields?.field && Array.isArray($parameter.udfFields.field) ? $parameter.udfFields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = item.fieldValueText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } } catch (e) { } } return acc; }, {}) : {}) }; return body; })() }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a resource',
				description: 'Update an existing resource',
				routing: {
					request: {
						method: 'PUT',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.resource_id }}`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ { ...($parameter.first_name ? { first_name: $parameter.first_name } : {}), ...($parameter.additionalFields?.email ? { email: $parameter.additionalFields.email } : {}), ...($parameter.additionalFields?.phone ? { phone: $parameter.additionalFields.phone } : {}), ...($parameter.additionalFields?.calendar ? { calendar: $parameter.additionalFields.calendar } : {}), ...($parameter.additionalFields?.last_name ? { last_name: $parameter.additionalFields.last_name } : {}) } }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a resource',
				description: 'Delete a resource',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.resource_id }}`
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many resources',
				description: 'Retrieve a list of resources',
				routing: {
					request: {
						method: 'GET',
						url: `${BASE_URL}${API_BASE_PATH}/resources`,
					},
				},
			},
		],
		default: 'create',
	},
	...resourceGetResourcesDescription,
	...resourceCreateDescription,
	...resourceUpdateDescription,
	...resourceDeleteDescription,
];

