import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { projectCreateDescription } from './create';
import { projectUpdateDescription } from './update';
import { projectDeleteDescription } from './delete';
import { projectGetAllDescription } from './getAll';
import { projectGetOneDescription } from './get';
import { projectSearchDescription } from './search';

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
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { let projectTypeId = $parameter.project_type_id; if (projectTypeId) { try { if (typeof projectTypeId === "string" && projectTypeId.trim().startsWith("{")) { const parsed = JSON.parse(projectTypeId); if (parsed && typeof parsed === "object" && "id" in parsed) { projectTypeId = parsed.id; } } } catch (e) { } if (typeof projectTypeId === "number" || (typeof projectTypeId === "string" && !isNaN(parseInt(projectTypeId)))) { projectTypeId = typeof projectTypeId === "number" ? projectTypeId : parseInt(projectTypeId); } } const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const processUDFFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = fieldCode === "tags" ? item.fieldValueText.split(",").map(function(s){ return s.trim(); }).filter(Boolean) : item.fieldValueText; } else if (item.fieldValueRichText !== undefined && item.fieldValueRichText !== null && item.fieldValueRichText !== "") { acc[fieldCode] = item.fieldValueRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { acc[fieldCode] = isUdfDateTimeType(fieldType) ? formatTime(item.fieldValueDate) : new Date(item.fieldValueDate).toISOString().split("T")[0]; } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; const body = { title: $parameter.title, project_type_id: projectTypeId, ...processUDFFields($parameter.mandatoryFields), ...processUDFFields($parameter.otherFields) }; return body; })() }}',
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
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { let projectTypeId = $parameter.project_type_id; if (projectTypeId) { try { if (typeof projectTypeId === "string" && projectTypeId.trim().startsWith("{")) { const parsed = JSON.parse(projectTypeId); if (parsed && typeof parsed === "object" && "id" in parsed) { projectTypeId = parsed.id; } } } catch (e) { } if (typeof projectTypeId === "number" || (typeof projectTypeId === "string" && !isNaN(parseInt(projectTypeId)))) { projectTypeId = typeof projectTypeId === "number" ? projectTypeId : parseInt(projectTypeId); } } const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const body = {}; if ($parameter.title !== undefined && $parameter.title !== null && $parameter.title !== "") { body.title = $parameter.title; } if (projectTypeId) { body.project_type_id = projectTypeId; } if ($parameter.udfFields?.field && Array.isArray($parameter.udfFields.field)) { const udfData = $parameter.udfFields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = fieldCode === "tags" ? item.fieldValueText.split(",").map(function(s){ return s.trim(); }).filter(Boolean) : item.fieldValueText; } else if (item.fieldValueRichText !== undefined && item.fieldValueRichText !== null && item.fieldValueRichText !== "") { acc[fieldCode] = item.fieldValueRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { acc[fieldCode] = isUdfDateTimeType(fieldType) ? formatTime(item.fieldValueDate) : new Date(item.fieldValueDate).toISOString().split("T")[0]; } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}); Object.assign(body, udfData); } return body; })() }}',
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
						url: '={{ (() => { const base = "' + BASE_URL + API_BASE_PATH + '/projects/" + $parameter.project_id + "/"; const opts = $parameter.forceDeleteOptions || {}; const params = []; if (opts.force_delete_requirements === true) params.push("force_delete_requirements=true"); if (opts.force_delete_bookings === true) params.push("force_delete_bookings=true"); if (opts.force_delete_timesheet_entry === true) params.push("force_delete_timesheet_entry=true"); if (opts.force_delete_rates === true) params.push("force_delete_rates=true"); return params.length ? base + "?" + params.join("&") : base; })() }}',
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
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
			action: 'Get a project',
			description: 'Retrieve a single project by ID',
			routing: {
				request: {
					method: 'GET',
					url: `={{ "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.project_id }}`,
					headers: {
						Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
					},
				},
			},
		},
			{
				name: 'Search',
				value: 'search',
				action: 'Search projects',
				description:
					'Search for projects using the flexible /v1/projects/search endpoint with a raw JSON filter body as documented in the eRS Cloud API (Search Projects section)',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/projects/search`,
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
	...projectGetAllDescription,
	...projectCreateDescription,
	...projectUpdateDescription,
	...projectDeleteDescription,
	...projectGetOneDescription,
	...projectSearchDescription,
];

