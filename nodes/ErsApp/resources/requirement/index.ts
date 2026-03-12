import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { requirementCreateDescription } from './create';
import { requirementUpdateDescription } from './update';
import { requirementDeleteDescription } from './delete';
import { requirementGetAllDescription } from './getAll';
import { requirementGetOneDescription } from './get';
import { requirementSearchDescription } from './search';

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
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const parseJsonArray = (v) => { if (v === undefined || v === null || v === "") return undefined; if (Array.isArray(v)) return v; try { const parsed = typeof v === "string" ? JSON.parse(v) : v; return Array.isArray(parsed) ? parsed : undefined; } catch (_) { return undefined; } }; const parseTags = (v) => { if (v === undefined || v === null) return []; if (Array.isArray(v)) return v.map(t => String(t)).filter(t => t.trim()); if (typeof v === "string" && v.trim()) return v.split(",").map(t => t.trim()).filter(Boolean); return []; }; const buildBody = () => { const body = { task_id: $parameter.additionalFields?.task_id !== undefined ? Number($parameter.additionalFields.task_id) : undefined, role_id: $parameter.additionalFields?.role_id !== undefined ? Number($parameter.additionalFields.role_id) : undefined, start_time: formatTime($parameter.start_time), end_time: formatTime($parameter.end_time), project_id: Number($parameter.project_id), udf_submitted_to: parseJsonArray($parameter.additionalFields?.udf_submitted_to) || [], unit: Number($parameter.unit), effort: Number($parameter.effort), allow_multi_allocation: $parameter.additionalFields?.allow_multi_allocation === true, flexi_range_unit: $parameter.additionalFields?.flexi_range_unit !== undefined ? Number($parameter.additionalFields.flexi_range_unit) : 2, sync_to_booking: $parameter.additionalFields?.sync_to_booking === true }; const tags = parseTags($parameter.additionalFields?.tags); if (tags.length > 0) body.tags = tags; return body; }; return buildBody(); })() }}',
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
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const buildBody = () => { const body = {}; const af = $parameter.additionalFields; if (af?.project_id !== undefined) body.project_id = Number(af.project_id); if ($parameter.start_time) body.start_time = formatTime($parameter.start_time); if ($parameter.end_time) body.end_time = formatTime($parameter.end_time); if (af?.effort !== undefined) body.effort = Number(af.effort); if (af?.unit !== undefined) body.unit = Number(af.unit); if (af?.task_id !== undefined) body.task_id = Number(af.task_id); if (af?.role_id !== undefined) body.role_id = Number(af.role_id); const parseTags = (v) => { if (v === undefined || v === null) return []; if (Array.isArray(v)) return v.map((t) => String(t)).filter(Boolean); if (typeof v === "string" && v.trim()) return v.split(",").map((t) => t.trim()).filter(Boolean); return []; }; const tags = parseTags(af?.tags); if (tags.length > 0) body.tags = tags; if (af?.allow_multi_allocation !== undefined) body.allow_multi_allocation = af.allow_multi_allocation === true; if (af?.sync_to_booking !== undefined) body.sync_to_booking = af.sync_to_booking === true; return body; }; return buildBody(); })() }}',
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
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
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
					headers: {
						Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
					},
				},
				output: {
					postReceive: [
						{
							type: 'rootProperty',
							properties: {
								property: 'data',
							},
						},
					],
				},
			},
		},
		{
			name: 'Get One',
			value: 'get',
			action: 'Get a requirement',
			description: 'Retrieve a single requirement by ID',
			routing: {
				request: {
					method: 'GET',
					url: `={{ "${BASE_URL}${API_BASE_PATH}/requirements/" + $parameter.requirement_id }}`,
					headers: {
						Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
					},
				},
			},
		},
			{
				name: 'Search',
				value: 'search',
				action: 'Search requirements',
				description:
					'Search for requirements using the flexible /v1/requirements/search endpoint with a raw JSON filter body as documented in the eRS Cloud API (Search Requirements section)',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/requirements/search`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization:
								'={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { if (!$parameter.searchBodyJson) { throw new Error("Search Body cannot be empty"); } let body; if (typeof $parameter.searchBodyJson === "string") { try { body = JSON.parse($parameter.searchBodyJson); } catch (e) { throw new Error("Search Body must be valid JSON"); } } else { body = $parameter.searchBodyJson; } return body; })() }}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
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
	...requirementGetOneDescription,
	...requirementSearchDescription,
];

