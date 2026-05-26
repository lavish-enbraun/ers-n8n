import type { INodeProperties } from 'n8n-workflow';
import { ERS_APP_V1_BASE_URL } from '../../shared/api.constants';
import { timesheetCreateDescription } from './create';
import { timesheetUpdateDescription } from './update';
import { timesheetDeleteDescription } from './delete';
import { timesheetGetOneDescription } from './get';
import { timesheetSearchDescription } from './search';

const showOnlyForTimesheet = {
	resource: ['timesheet'],
};

export const timesheetDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForTimesheet,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a timesheet entry',
				description: 'Create a new timesheet entry',
				routing: {
					request: {
						method: 'POST',
						url: `${ERS_APP_V1_BASE_URL}/timesheet`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const resolveExpr = (value) => { if (value === undefined || value === null) return value; if (typeof value !== "string") return value; const raw = value.trim(); if (!raw) return value; const first = raw.charCodeAt(0); const second = raw.length > 1 ? raw.charCodeAt(1) : 0; const third = raw.length > 2 ? raw.charCodeAt(2) : 0; const isDoubleOpen = first === 123 && second === 123; const isEqualDoubleOpen = first === 61 && second === 123 && third === 123; const endsDoubleClose = raw.length >= 2 && raw.charCodeAt(raw.length - 2) === 125 && raw.charCodeAt(raw.length - 1) === 125; if ((isDoubleOpen || isEqualDoubleOpen) && endsDoubleClose) { try { const expressionToEvaluate = isEqualDoubleOpen ? raw.slice(1) : raw; const evaluated = $evaluateExpression(expressionToEvaluate); if (evaluated !== undefined && evaluated !== null) return evaluated; } catch (e) { } } return value; }; const toCalendarDateOnly = (value) => { if (value === undefined || value === null || value === "") return ""; if (typeof value === "string") { const resolved = resolveExpr(value); if (resolved !== value) return toCalendarDateOnly(resolved); const t = resolved.trim(); if (!t) return ""; if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) return t; const d = new Date(t); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "object" && value) { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) return toCalendarDateOnly(iso); } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") return toCalendarDateOnly(s); } if (typeof value.ts === "number") return toCalendarDateOnly(value.ts); } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }; const normalizeDateInput = (value) => { if (value === undefined || value === null || value === "") return ""; const resolved = resolveExpr(value); if (resolved !== value) return normalizeDateInput(resolved); if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : d.toISOString(); } if (typeof value === "string") { const raw = value.trim(); if (!raw) return ""; if (/^[0-9]+$/.test(raw)) { const n = Number(raw); if (!isNaN(n)) { const ms = n > 1000000000000 ? n : n * 1000; const d = new Date(ms); if (!isNaN(d.getTime())) return d.toISOString(); } } const d = new Date(raw); if (!isNaN(d.getTime())) return d.toISOString(); return ""; } if (typeof value === "object") { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.ts === "number") { const d = new Date(value.ts); if (!isNaN(d.getTime())) return d.toISOString(); } } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : d.toISOString(); }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const processFields = (fields) => { const excludedFieldCodes = new Set(["resource_id","project_id","date","hours","entry_status","time_start","time_end"]); if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (excludedFieldCodes.has(fieldCode)) return acc; const resolvedText = resolveExpr(item.fieldValueText); const resolvedRichText = resolveExpr(item.fieldValueRichText); const resolvedNumber = resolveExpr(item.fieldValueNumber); if (resolvedText !== undefined && resolvedText !== null && resolvedText !== "") { acc[fieldCode] = fieldCode === "tags" ? String(resolvedText).split(",").map(function(s){ return s.trim(); }).filter(Boolean) : resolvedText; } else if (resolvedRichText !== undefined && resolvedRichText !== null && resolvedRichText !== "") { acc[fieldCode] = resolvedRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { const normalizedDate = normalizeDateInput(item.fieldValueDate); if (normalizedDate !== "") acc[fieldCode] = formatTime(normalizedDate); } else { const cal = toCalendarDateOnly(item.fieldValueDate); if (cal !== "") acc[fieldCode] = cal; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueBillingStatus !== undefined && item.fieldValueBillingStatus !== null && item.fieldValueBillingStatus !== "") { acc[fieldCode] = extractId(item.fieldValueBillingStatus); } else if (item.fieldValueRateFrom !== undefined && item.fieldValueRateFrom !== null && item.fieldValueRateFrom !== "") { const rf = extractId(item.fieldValueRateFrom); if (rf !== null && rf !== undefined) acc[fieldCode] = rf; if (fieldCode === "rate_from" && rf === 8 && item.fieldValueRate !== undefined && item.fieldValueRate !== null && item.fieldValueRate !== "") { acc.rate = typeof item.fieldValueRate === "number" ? item.fieldValueRate : parseFloat(item.fieldValueRate); } } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (resolvedNumber !== undefined && resolvedNumber !== null && resolvedNumber !== "") { acc[fieldCode] = typeof resolvedNumber === "number" ? resolvedNumber : parseFloat(resolvedNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; const hoursVal = typeof $parameter.hours === "number" ? $parameter.hours : parseFloat(String($parameter.hours)); return { entry_status: 1, resource_id: Number($parameter.resource_id), project_id: Number($parameter.project_id), date: toCalendarDateOnly($parameter.date), hours: hoursVal, ...processFields($parameter.mandatoryFields), ...processFields($parameter.otherFields), ...($parameter.comment ? { comment: $parameter.comment } : {}) }; })() }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a timesheet entry',
				description: 'Delete a timesheet entry',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "${ERS_APP_V1_BASE_URL}/timesheet/" + $parameter.timesheet_id }}`,
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
					},
				},
			},
			{
				name: 'Get One',
				value: 'get',
				action: 'Get a timesheet entry',
				description: 'Retrieve a single timesheet entry by ID',
				routing: {
					request: {
						method: 'GET',
						url: `={{ "${ERS_APP_V1_BASE_URL}/timesheet/" + $parameter.timesheet_id }}`,
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search timesheet entries',
				description:
					'Search for timesheet entries using the flexible /v1/timesheet/search endpoint with a raw JSON filter body as documented in the eRS Cloud API (Search Timesheet Entries section)',
				routing: {
					request: {
						method: 'POST',
						url: `${ERS_APP_V1_BASE_URL}/timesheet/search`,
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
			{
				name: 'Update',
				value: 'update',
				action: 'Update a timesheet entry',
				description: 'Update an existing timesheet entry',
				routing: {
					request: {
						method: 'PUT',
						url: `={{ "${ERS_APP_V1_BASE_URL}/timesheet/" + $parameter.timesheet_id }}`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const resolveExpr = (value) => { if (value === undefined || value === null) return value; if (typeof value !== "string") return value; const raw = value.trim(); if (!raw) return value; const first = raw.charCodeAt(0); const second = raw.length > 1 ? raw.charCodeAt(1) : 0; const third = raw.length > 2 ? raw.charCodeAt(2) : 0; const isDoubleOpen = first === 123 && second === 123; const isEqualDoubleOpen = first === 61 && second === 123 && third === 123; const endsDoubleClose = raw.length >= 2 && raw.charCodeAt(raw.length - 2) === 125 && raw.charCodeAt(raw.length - 1) === 125; if ((isDoubleOpen || isEqualDoubleOpen) && endsDoubleClose) { try { const expressionToEvaluate = isEqualDoubleOpen ? raw.slice(1) : raw; const evaluated = $evaluateExpression(expressionToEvaluate); if (evaluated !== undefined && evaluated !== null) return evaluated; } catch (e) { } } return value; }; const toCalendarDateOnly = (value) => { if (value === undefined || value === null || value === "") return ""; if (typeof value === "string") { const resolved = resolveExpr(value); if (resolved !== value) return toCalendarDateOnly(resolved); const t = resolved.trim(); if (!t) return ""; if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) return t; const d = new Date(t); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "object" && value) { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) return toCalendarDateOnly(iso); } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") return toCalendarDateOnly(s); } if (typeof value.ts === "number") return toCalendarDateOnly(value.ts); } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }; const normalizeDateInput = (value) => { if (value === undefined || value === null || value === "") return ""; const resolved = resolveExpr(value); if (resolved !== value) return normalizeDateInput(resolved); if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : d.toISOString(); } if (typeof value === "string") { const raw = value.trim(); if (!raw) return ""; if (/^[0-9]+$/.test(raw)) { const n = Number(raw); if (!isNaN(n)) { const ms = n > 1000000000000 ? n : n * 1000; const d = new Date(ms); if (!isNaN(d.getTime())) return d.toISOString(); } } const d = new Date(raw); if (!isNaN(d.getTime())) return d.toISOString(); return ""; } if (typeof value === "object") { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.ts === "number") { const d = new Date(value.ts); if (!isNaN(d.getTime())) return d.toISOString(); } } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : d.toISOString(); }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const toNumber = (value) => { const id = extractId(value); if (id === null || id === undefined || id === "") return undefined; if (typeof id === "number") return isNaN(id) ? undefined : id; const n = parseInt(String(id).trim()); return isNaN(n) ? undefined : n; }; const processFields = (fields) => { const excludedFieldCodes = new Set(["resource_id","project_id","date","hours","entry_status","time_start","time_end"]); if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (excludedFieldCodes.has(fieldCode)) return acc; const resolvedText = resolveExpr(item.fieldValueText); const resolvedRichText = resolveExpr(item.fieldValueRichText); const resolvedNumber = resolveExpr(item.fieldValueNumber); if (resolvedText !== undefined && resolvedText !== null && resolvedText !== "") { acc[fieldCode] = fieldCode === "tags" ? String(resolvedText).split(",").map(function(s){ return s.trim(); }).filter(Boolean) : resolvedText; } else if (resolvedRichText !== undefined && resolvedRichText !== null && resolvedRichText !== "") { acc[fieldCode] = resolvedRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { const normalizedDate = normalizeDateInput(item.fieldValueDate); if (normalizedDate !== "") acc[fieldCode] = formatTime(normalizedDate); } else { const cal = toCalendarDateOnly(item.fieldValueDate); if (cal !== "") acc[fieldCode] = cal; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueBillingStatus !== undefined && item.fieldValueBillingStatus !== null && item.fieldValueBillingStatus !== "") { acc[fieldCode] = extractId(item.fieldValueBillingStatus); } else if (item.fieldValueRateFrom !== undefined && item.fieldValueRateFrom !== null && item.fieldValueRateFrom !== "") { const rf = extractId(item.fieldValueRateFrom); if (rf !== null && rf !== undefined) acc[fieldCode] = rf; if (fieldCode === "rate_from" && rf === 8 && item.fieldValueRate !== undefined && item.fieldValueRate !== null && item.fieldValueRate !== "") { const rateNum = typeof item.fieldValueRate === "number" ? item.fieldValueRate : parseFloat(String(item.fieldValueRate).trim()); if (isFinite(rateNum) && !isNaN(rateNum)) acc.rate = rateNum; } } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (resolvedNumber !== undefined && resolvedNumber !== null && resolvedNumber !== "") { const num = typeof resolvedNumber === "number" ? resolvedNumber : parseFloat(String(resolvedNumber).trim()); if (isFinite(num) && !isNaN(num)) acc[fieldCode] = num; } } catch (e) { } } return acc; }, {}); } return {}; }; const body = Object.assign({}, processFields($parameter.updateMandatoryFields), processFields($parameter.updateOtherFields)); const rid = toNumber($parameter.resource_id); if (rid !== undefined) body.resource_id = rid; const pid = toNumber($parameter.project_id); if (pid !== undefined) body.project_id = pid; const calDate = toCalendarDateOnly($parameter.date); if (calDate) body.date = calDate; if ($parameter.hours !== undefined && $parameter.hours !== null && String($parameter.hours).trim() !== "") { const h = typeof $parameter.hours === "number" ? $parameter.hours : parseFloat(String($parameter.hours)); if (!isNaN(h) && isFinite(h)) body.hours = h; } if ($parameter.comment !== undefined && $parameter.comment !== null && String($parameter.comment).trim() !== "") body.comment = $parameter.comment; return Object.keys(body).length ? body : {}; })() }}',
					},
				},
			},
		],
		default: 'create',
	},
	...timesheetCreateDescription,
	...timesheetUpdateDescription,
	...timesheetDeleteDescription,
	...timesheetGetOneDescription,
	...timesheetSearchDescription,
];

