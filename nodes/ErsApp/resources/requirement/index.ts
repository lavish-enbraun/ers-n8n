import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { requirementCreateDescription } from './create';
import { requirementUpdateDescription } from './update';
import { requirementDeleteDescription } from './delete';
import { requirementGetAllDescription } from './getAll';

const showOnlyForRequirements = {
	resource: ['requirement'],
};

export const requirementDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRequirements,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a requirement',
				description: 'Create a new requirement',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/requirements`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const buildBody = () => { const body = { project_id: $parameter.project_id, start_time: formatTime($parameter.start_time), end_time: formatTime($parameter.end_time), effort: $parameter.effort, unit: $parameter.unit }; if ($parameter.additionalFields?.task_id) body.task_id = $parameter.additionalFields.task_id; if ($parameter.additionalFields?.role_id) body.role_id = $parameter.additionalFields.role_id; if ($parameter.additionalFields?.udf_confirmed !== undefined) body.udf_confirmed = $parameter.additionalFields.udf_confirmed; if ($parameter.additionalFields?.tags && Array.isArray($parameter.additionalFields.tags) && $parameter.additionalFields.tags.length > 0) body.tags = $parameter.additionalFields.tags.filter(t => t); if ($parameter.additionalFields?.allow_multi_allocation !== undefined) body.allow_multi_allocation = $parameter.additionalFields.allow_multi_allocation; if ($parameter.additionalFields?.sync_to_booking !== undefined) body.sync_to_booking = $parameter.additionalFields.sync_to_booking; if ($parameter.additionalFields?.conditions && $parameter.additionalFields.conditions.condition && $parameter.additionalFields.conditions.condition.length > 0) { body.conditions = $parameter.additionalFields.conditions.condition.map(c => ({ field: c.field, operator: c.operator, values: Array.isArray(c.values) ? c.values : [], weightage: c.weightage, is_mandatory: c.is_mandatory })); } return body; }; return buildBody(); })() }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a requirement',
				description: 'Update an existing requirement',
				routing: {
					request: {
						method: 'PUT',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/requirements/" + $parameter.requirement_id }}`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const buildBody = () => { const body = {}; if ($parameter.additionalFields?.project_id !== undefined) body.project_id = $parameter.additionalFields.project_id; if ($parameter.additionalFields?.start_time) body.start_time = formatTime($parameter.additionalFields.start_time); if ($parameter.additionalFields?.end_time) body.end_time = formatTime($parameter.additionalFields.end_time); if ($parameter.additionalFields?.effort !== undefined) body.effort = $parameter.additionalFields.effort; if ($parameter.additionalFields?.unit !== undefined) body.unit = $parameter.additionalFields.unit; if ($parameter.additionalFields?.task_id !== undefined) body.task_id = $parameter.additionalFields.task_id; if ($parameter.additionalFields?.role_id !== undefined) body.role_id = $parameter.additionalFields.role_id; if ($parameter.additionalFields?.tags && Array.isArray($parameter.additionalFields.tags) && $parameter.additionalFields.tags.length > 0) body.tags = $parameter.additionalFields.tags.filter(t => t); if ($parameter.additionalFields?.allow_multi_allocation !== undefined) body.allow_multi_allocation = $parameter.additionalFields.allow_multi_allocation; if ($parameter.additionalFields?.sync_to_booking !== undefined) body.sync_to_booking = $parameter.additionalFields.sync_to_booking; if ($parameter.additionalFields?.conditions && $parameter.additionalFields.conditions.condition && $parameter.additionalFields.conditions.condition.length > 0) { body.conditions = $parameter.additionalFields.conditions.condition.map(c => ({ field: c.field, operator: c.operator, values: Array.isArray(c.values) ? c.values : [], weightage: c.weightage, is_mandatory: c.is_mandatory })); } return body; }; return buildBody(); })() }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a requirement',
				description: 'Delete a requirement',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/requirements/" + $parameter.requirement_id }}`,
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many requirements',
				description: 'Retrieve a list of requirements',
				routing: {
					request: {
						method: 'GET',
						url: `${BASE_URL}${API_BASE_PATH}/requirements`,
					},
				},
			},
		],
		default: 'create',
	},
	...requirementCreateDescription,
	...requirementUpdateDescription,
	...requirementDeleteDescription,
	...requirementGetAllDescription,
];

