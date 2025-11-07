import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { projectCreateDescription } from './create';
import { projectUpdateDescription } from './update';
import { projectDeleteDescription } from './delete';
import { projectGetAllDescription } from './getAll';

const showOnlyForProjects = {
	resource: ['project'],
};

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProjects,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a project',
				description: 'Create a new project',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/projects`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ { title: $parameter.title, project_type_id: $parameter.project_type_id, ...($parameter.additionalFields?.project_start_date ? { project_start_date: new Date($parameter.additionalFields.project_start_date).toISOString().split("T")[0] } : {}), ...($parameter.additionalFields?.end_date ? { end_date: new Date($parameter.additionalFields.end_date).toISOString().split("T")[0] } : {}), ...($parameter.additionalFields?.tags ? { tags: $parameter.additionalFields.tags } : {}), ...($parameter.additionalFields?.project_calendar ? { project_calendar: $parameter.additionalFields.project_calendar } : {}), ...($parameter.udfFields?.field && Array.isArray($parameter.udfFields.field) ? $parameter.udfFields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = item.fieldValueText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null) { acc[fieldCode] = item.fieldValueNumber; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { acc[fieldCode] = new Date(item.fieldValueDate).toISOString().split("T")[0]; } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { acc[fieldCode] = item.fieldValueSelect; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null && Array.isArray(item.fieldValueMultiSelect) && item.fieldValueMultiSelect.length > 0) { acc[fieldCode] = item.fieldValueMultiSelect; } } catch (e) { } } return acc; }, {}) : {}) } }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a project',
				description: 'Update an existing project',
				routing: {
					request: {
						method: 'PUT',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.project_id }}`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ { title: $parameter.title, ...($parameter.additionalFields?.project_type_id ? { project_type_id: $parameter.additionalFields.project_type_id } : {}), ...($parameter.additionalFields?.project_start_date ? { project_start_date: new Date($parameter.additionalFields.project_start_date).toISOString().split("T")[0] } : {}), ...($parameter.additionalFields?.end_date ? { end_date: new Date($parameter.additionalFields.end_date).toISOString().split("T")[0] } : {}), ...($parameter.additionalFields?.tags ? { tags: $parameter.additionalFields.tags } : {}), ...($parameter.additionalFields?.project_calendar ? { project_calendar: $parameter.additionalFields.project_calendar } : {}) } }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a project',
				description: 'Delete a project',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.project_id }}`,
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'Retrieve a list of many projects',
				routing: {
					request: {
						method: 'GET',
						url: `${BASE_URL}${API_BASE_PATH}/projects`,
					},
				},
			},
		],
		default: 'create',
	},
	...projectGetAllDescription,
	...projectCreateDescription,
	...projectUpdateDescription,
	...projectDeleteDescription,
];

