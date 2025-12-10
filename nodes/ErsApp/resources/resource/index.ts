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
						body: '={{ (() => { let resourceTypeId = $parameter.resource_type_id; let isHuman = false; if (resourceTypeId) { try { if (typeof resourceTypeId === "string" && resourceTypeId.trim().startsWith("{")) { const parsed = JSON.parse(resourceTypeId); if (parsed && typeof parsed === "object") { if ("id" in parsed) { resourceTypeId = parsed.id; } if ("is_human" in parsed) { isHuman = parsed.is_human === true; } } } } catch (e) { } if (!isHuman && (typeof resourceTypeId === "number" || (typeof resourceTypeId === "string" && !isNaN(parseInt(resourceTypeId))))) { resourceTypeId = typeof resourceTypeId === "number" ? resourceTypeId : parseInt(resourceTypeId); } } const nameProperty = isHuman ? "first_name" : "name"; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const body = { [nameProperty]: $parameter.first_name, start_date: $parameter.start_date ? new Date($parameter.start_date).toISOString().split("T")[0] : $parameter.start_date, resource_type_id: resourceTypeId, ...($parameter.udfFields?.field && Array.isArray($parameter.udfFields.field) ? $parameter.udfFields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = item.fieldValueText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { acc[fieldCode] = new Date(item.fieldValueDate).toISOString().split("T")[0]; } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}) : {}) }; return body; })() }}',
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
						body: '={{ (() => { let resourceTypeId = $parameter.resource_type_id; let isHuman = false; if (resourceTypeId) { try { if (typeof resourceTypeId === "string" && resourceTypeId.trim().startsWith("{")) { const parsed = JSON.parse(resourceTypeId); if (parsed && typeof parsed === "object") { if ("id" in parsed) { resourceTypeId = parsed.id; } if ("is_human" in parsed) { isHuman = parsed.is_human === true; } } } } catch (e) { } if (typeof resourceTypeId === "number" || (typeof resourceTypeId === "string" && !isNaN(parseInt(resourceTypeId)))) { resourceTypeId = typeof resourceTypeId === "number" ? resourceTypeId : parseInt(resourceTypeId); } } const nameProperty = isHuman ? "first_name" : "name"; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const body = {}; if ($parameter.first_name !== undefined && $parameter.first_name !== null && $parameter.first_name !== "") { body[nameProperty] = $parameter.first_name; } if (resourceTypeId) { body.resource_type_id = resourceTypeId; } if ($parameter.udfFields?.field && Array.isArray($parameter.udfFields.field)) { const udfData = $parameter.udfFields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = item.fieldValueText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { acc[fieldCode] = new Date(item.fieldValueDate).toISOString().split("T")[0]; } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}); Object.assign(body, udfData); } return body; })() }}',
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

