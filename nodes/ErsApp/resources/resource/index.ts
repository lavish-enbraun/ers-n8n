import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { resourceGetResourcesDescription } from './getAll';
import { resourceCreateDescription } from './create';
import { resourceUpdateDescription } from './update';
import { resourceDeleteDescription } from './delete';
import { resourceGetOneDescription } from './get';
import { resourceSearchDescription } from './search';

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
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { let resourceTypeId = $parameter.resource_type_id; let isHuman = false; if (resourceTypeId) { try { if (typeof resourceTypeId === "string" && resourceTypeId.trim().startsWith("{")) { const parsed = JSON.parse(resourceTypeId); if (parsed && typeof parsed === "object") { if ("id" in parsed) { resourceTypeId = parsed.id; } if ("is_human" in parsed) { isHuman = parsed.is_human === true; } } } } catch (e) { } if (!isHuman && (typeof resourceTypeId === "number" || (typeof resourceTypeId === "string" && !isNaN(parseInt(resourceTypeId))))) { resourceTypeId = typeof resourceTypeId === "number" ? resourceTypeId : parseInt(resourceTypeId); } } const nameProperty = isHuman ? "first_name" : "name"; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const resolveExpr = (value) => { if (value === undefined || value === null) return value; if (typeof value !== "string") return value; const raw = value.trim(); if (!raw) return value; const first = raw.charCodeAt(0); const second = raw.length > 1 ? raw.charCodeAt(1) : 0; const third = raw.length > 2 ? raw.charCodeAt(2) : 0; const isDoubleOpen = first === 123 && second === 123; const isEqualDoubleOpen = first === 61 && second === 123 && third === 123; const endsDoubleClose = raw.length >= 2 && raw.charCodeAt(raw.length - 2) === 125 && raw.charCodeAt(raw.length - 1) === 125; if ((isDoubleOpen || isEqualDoubleOpen) && endsDoubleClose) { try { const expressionToEvaluate = isEqualDoubleOpen ? raw.slice(1) : raw; const evaluated = $evaluateExpression(expressionToEvaluate); if (evaluated !== undefined && evaluated !== null) return evaluated; } catch (e) { } } return value; }; const normalizeDateInput = (value) => { if (value === undefined || value === null || value === "") return ""; const resolved = resolveExpr(value); if (resolved !== value) return normalizeDateInput(resolved); if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : d.toISOString(); } if (typeof value === "string") { const raw = value.trim(); if (!raw) return ""; if (/^[0-9]+$/.test(raw)) { const n = Number(raw); if (!isNaN(n)) { const ms = n > 1000000000000 ? n : n * 1000; const d = new Date(ms); if (!isNaN(d.getTime())) return d.toISOString(); } } const d = new Date(raw); if (!isNaN(d.getTime())) return d.toISOString(); return ""; } if (typeof value === "object") { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.ts === "number") { const d = new Date(value.ts); if (!isNaN(d.getTime())) return d.toISOString(); } } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : d.toISOString(); }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const processUDFFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; const resolvedText = resolveExpr(item.fieldValueText); const resolvedRichText = resolveExpr(item.fieldValueRichText); const resolvedNumber = resolveExpr(item.fieldValueNumber); if (resolvedText !== undefined && resolvedText !== null && resolvedText !== "") { acc[fieldCode] = fieldCode === "tags" ? String(resolvedText).split(",").map(function(s){ return s.trim(); }).filter(Boolean) : resolvedText; } else if (resolvedRichText !== undefined && resolvedRichText !== null && resolvedRichText !== "") { acc[fieldCode] = resolvedRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { const normalizedDate = normalizeDateInput(item.fieldValueDate); if (normalizedDate !== "") { acc[fieldCode] = isUdfDateTimeType(fieldType) ? formatTime(normalizedDate) : normalizedDate.split("T")[0]; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (resolvedNumber !== undefined && resolvedNumber !== null && resolvedNumber !== "") { acc[fieldCode] = typeof resolvedNumber === "number" ? resolvedNumber : parseFloat(resolvedNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; const body = { [nameProperty]: $parameter.first_name, start_date: $parameter.start_date ? new Date($parameter.start_date).toISOString().split("T")[0] : $parameter.start_date, resource_type_id: resourceTypeId, ...processUDFFields($parameter.mandatoryFields), ...processUDFFields($parameter.otherFields) }; return body; })() }}',
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
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { let resourceTypeId = $parameter.resource_type_id; let isHuman = false; if (resourceTypeId) { try { if (typeof resourceTypeId === "string" && resourceTypeId.trim().startsWith("{")) { const parsed = JSON.parse(resourceTypeId); if (parsed && typeof parsed === "object") { if ("id" in parsed) { resourceTypeId = parsed.id; } if ("is_human" in parsed) { isHuman = parsed.is_human === true; } } } } catch (e) { } if (typeof resourceTypeId === "number" || (typeof resourceTypeId === "string" && !isNaN(parseInt(resourceTypeId)))) { resourceTypeId = typeof resourceTypeId === "number" ? resourceTypeId : parseInt(resourceTypeId); } } const nameProperty = isHuman ? "first_name" : "name"; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const resolveExpr = (value) => { if (value === undefined || value === null) return value; if (typeof value !== "string") return value; const raw = value.trim(); if (!raw) return value; const first = raw.charCodeAt(0); const second = raw.length > 1 ? raw.charCodeAt(1) : 0; const third = raw.length > 2 ? raw.charCodeAt(2) : 0; const isDoubleOpen = first === 123 && second === 123; const isEqualDoubleOpen = first === 61 && second === 123 && third === 123; const endsDoubleClose = raw.length >= 2 && raw.charCodeAt(raw.length - 2) === 125 && raw.charCodeAt(raw.length - 1) === 125; if ((isDoubleOpen || isEqualDoubleOpen) && endsDoubleClose) { try { const expressionToEvaluate = isEqualDoubleOpen ? raw.slice(1) : raw; const evaluated = $evaluateExpression(expressionToEvaluate); if (evaluated !== undefined && evaluated !== null) return evaluated; } catch (e) { } } return value; }; const normalizeDateInput = (value) => { if (value === undefined || value === null || value === "") return ""; const resolved = resolveExpr(value); if (resolved !== value) return normalizeDateInput(resolved); if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : d.toISOString(); } if (typeof value === "string") { const raw = value.trim(); if (!raw) return ""; if (/^[0-9]+$/.test(raw)) { const n = Number(raw); if (!isNaN(n)) { const ms = n > 1000000000000 ? n : n * 1000; const d = new Date(ms); if (!isNaN(d.getTime())) return d.toISOString(); } } const d = new Date(raw); if (!isNaN(d.getTime())) return d.toISOString(); return ""; } if (typeof value === "object") { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.ts === "number") { const d = new Date(value.ts); if (!isNaN(d.getTime())) return d.toISOString(); } } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : d.toISOString(); }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const body = {}; if ($parameter.first_name !== undefined && $parameter.first_name !== null && $parameter.first_name !== "") { body[nameProperty] = $parameter.first_name; } if (resourceTypeId) { body.resource_type_id = resourceTypeId; } if ($parameter.udfFields?.field && Array.isArray($parameter.udfFields.field)) { const udfData = $parameter.udfFields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; const resolvedText = resolveExpr(item.fieldValueText); const resolvedRichText = resolveExpr(item.fieldValueRichText); const resolvedNumber = resolveExpr(item.fieldValueNumber); if (resolvedText !== undefined && resolvedText !== null && resolvedText !== "") { acc[fieldCode] = fieldCode === "tags" ? String(resolvedText).split(",").map(function(s){ return s.trim(); }).filter(Boolean) : resolvedText; } else if (resolvedRichText !== undefined && resolvedRichText !== null && resolvedRichText !== "") { acc[fieldCode] = resolvedRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { const normalizedDate = normalizeDateInput(item.fieldValueDate); if (normalizedDate !== "") { acc[fieldCode] = isUdfDateTimeType(fieldType) ? formatTime(normalizedDate) : normalizedDate.split("T")[0]; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (resolvedNumber !== undefined && resolvedNumber !== null && resolvedNumber !== "") { acc[fieldCode] = typeof resolvedNumber === "number" ? resolvedNumber : parseFloat(resolvedNumber); } } catch (e) { } } return acc; }, {}); Object.assign(body, udfData); } return body; })() }}',
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
						url: '={{ (() => { const base = "' + BASE_URL + API_BASE_PATH + '/resources/" + $parameter.resource_id + "/"; const opts = $parameter.forceDeleteOptions || {}; const params = []; if (opts.force_delete_bookings === true) params.push("force_delete_bookings=true"); if (opts.force_delete_rates === true) params.push("force_delete_rates=true"); if (opts.force_delete_timesheet_entry === true) params.push("force_delete_timesheet_entry=true"); return params.length ? base + "?" + params.join("&") : base; })() }}',
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
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
			action: 'Get a resource',
			description: 'Retrieve a single resource by ID',
			routing: {
				request: {
					method: 'GET',
					url: `={{ "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.resource_id }}`,
					headers: {
						Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
					},
				},
			},
		},
			{
				name: 'Search',
				value: 'search',
				action: 'Search resources',
				description:
					'Search for resources using the flexible /v1/resources/search endpoint with a raw JSON filter body as documented in the eRS Cloud API (Search Resources section)',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/resources/search`,
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
	...resourceGetResourcesDescription,
	...resourceCreateDescription,
	...resourceUpdateDescription,
	...resourceDeleteDescription,
	...resourceGetOneDescription,
	...resourceSearchDescription,
];

