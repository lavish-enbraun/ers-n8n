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
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const processFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = fieldCode === "tags" ? item.fieldValueText.split(",").map(function(s){ return s.trim(); }).filter(Boolean) : item.fieldValueText; } else if (item.fieldValueRichText !== undefined && item.fieldValueRichText !== null && item.fieldValueRichText !== "") { acc[fieldCode] = item.fieldValueRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { acc[fieldCode] = formatTime(item.fieldValueDate); } else { acc[fieldCode] = new Date(item.fieldValueDate).toISOString().split("T")[0]; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; const body = Object.assign({}, processFields($parameter.mandatoryFields), processFields($parameter.otherFields)); const projectIdRaw = extractId($parameter.project_id); body.project_id = Number(projectIdRaw !== null && projectIdRaw !== undefined ? projectIdRaw : $parameter.project_id); body.start_time = formatTime($parameter.start_time); body.end_time = formatTime($parameter.end_time); let eff = typeof $parameter.effort === "number" ? $parameter.effort : parseFloat(String($parameter.effort)); if (isNaN(eff)) eff = 0; body.effort = eff; body.unit = Number($parameter.unit); return body; })() }}',
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
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const buildBody = () => { const body = {}; const af = $parameter.additionalFields; if (af?.project_id !== undefined) body.project_id = Number(af.project_id); if ($parameter.start_time) body.start_time = formatTime($parameter.start_time); if ($parameter.end_time) body.end_time = formatTime($parameter.end_time); if (af?.effort !== undefined) body.effort = Number(af.effort); if (af?.unit !== undefined) body.unit = Number(af.unit); if (af?.task_id !== undefined) body.task_id = Number(af.task_id); if (af?.role_id !== undefined) body.role_id = Number(af.role_id); const parseTags = (v) => { if (v === undefined || v === null) return []; if (Array.isArray(v)) return v.map((t) => String(t).trim()).filter(Boolean); if (typeof v === "string" && v.trim()) return v.split(",").map((t) => t.trim()).filter(Boolean); return []; }; const tags = parseTags(af?.tags); if (tags.length > 0) body.tags = tags; if (af?.allow_multi_allocation !== undefined) body.allow_multi_allocation = af.allow_multi_allocation === true; if (af?.sync_to_booking !== undefined) body.sync_to_booking = af.sync_to_booking === true; return body; }; return buildBody(); })() }}',
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

