import type { INodeProperties } from 'n8n-workflow';
import { bookingCreateDescription } from './create';
import { bookingUpdateDescription } from './update';
import { bookingDeleteDescription } from './delete';
import { bookingGetAllDescription } from './getAll';
import { bookingGetOneDescription } from './get';
import { bookingSearchDescription } from './search';

const showOnlyForBookings = {
	resource: ['booking'],
};

export const bookingDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForBookings,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a booking',
				description: 'Create a new booking',
				routing: {
					request: {
						method: 'POST',
						url: `http://dev.eresourcescheduler.cloud:8080/rest/v1/bookings`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const resolveExpr = (value) => { if (value === undefined || value === null) return value; if (typeof value !== "string") return value; const raw = value.trim(); if (!raw) return value; const first = raw.charCodeAt(0); const second = raw.length > 1 ? raw.charCodeAt(1) : 0; const third = raw.length > 2 ? raw.charCodeAt(2) : 0; const isDoubleOpen = first === 123 && second === 123; const isEqualDoubleOpen = first === 61 && second === 123 && third === 123; const endsDoubleClose = raw.length >= 2 && raw.charCodeAt(raw.length - 2) === 125 && raw.charCodeAt(raw.length - 1) === 125; if ((isDoubleOpen || isEqualDoubleOpen) && endsDoubleClose) { try { const expressionToEvaluate = isEqualDoubleOpen ? raw.slice(1) : raw; const evaluated = $evaluateExpression(expressionToEvaluate); if (evaluated !== undefined && evaluated !== null) return evaluated; } catch (e) { } } return value; }; const toCalendarDateOnly = (value) => { if (value === undefined || value === null || value === "") return ""; if (typeof value === "string") { const resolved = resolveExpr(value); if (resolved !== value) return toCalendarDateOnly(resolved); const t = resolved.trim(); if (!t) return ""; if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) return t; const d = new Date(t); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "object" && value) { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) return toCalendarDateOnly(iso); } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") return toCalendarDateOnly(s); } if (typeof value.ts === "number") return toCalendarDateOnly(value.ts); } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }; const normalizeDateInput = (value) => { if (value === undefined || value === null || value === "") return ""; const resolved = resolveExpr(value); if (resolved !== value) return normalizeDateInput(resolved); if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : d.toISOString(); } if (typeof value === "string") { const raw = value.trim(); if (!raw) return ""; if (/^[0-9]+$/.test(raw)) { const n = Number(raw); if (!isNaN(n)) { const ms = n > 1000000000000 ? n : n * 1000; const d = new Date(ms); if (!isNaN(d.getTime())) return d.toISOString(); } } const d = new Date(raw); if (!isNaN(d.getTime())) return d.toISOString(); return ""; } if (typeof value === "object") { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.ts === "number") { const d = new Date(value.ts); if (!isNaN(d.getTime())) return d.toISOString(); } } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : d.toISOString(); }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const processFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; const resolvedText = resolveExpr(item.fieldValueText); const resolvedRichText = resolveExpr(item.fieldValueRichText); const resolvedNumber = resolveExpr(item.fieldValueNumber); if (resolvedText !== undefined && resolvedText !== null && resolvedText !== "") { acc[fieldCode] = fieldCode === "tags" ? String(resolvedText).split(",").map(function(s){ return s.trim(); }).filter(Boolean) : resolvedText; } else if (resolvedRichText !== undefined && resolvedRichText !== null && resolvedRichText !== "") { acc[fieldCode] = resolvedRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { const normalizedDate = normalizeDateInput(item.fieldValueDate); if (normalizedDate !== "") acc[fieldCode] = formatTime(normalizedDate); } else { const cal = toCalendarDateOnly(item.fieldValueDate); if (cal !== "") acc[fieldCode] = cal; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueBillingStatus !== undefined && item.fieldValueBillingStatus !== null && item.fieldValueBillingStatus !== "") { acc[fieldCode] = extractId(item.fieldValueBillingStatus); } else if (item.fieldValueRateFrom !== undefined && item.fieldValueRateFrom !== null && item.fieldValueRateFrom !== "") { const rf = extractId(item.fieldValueRateFrom); if (rf !== null && rf !== undefined) acc[fieldCode] = rf; if (fieldCode === "rate_from" && rf === 8 && item.fieldValueRate !== undefined && item.fieldValueRate !== null && item.fieldValueRate !== "") { acc.rate = typeof item.fieldValueRate === "number" ? item.fieldValueRate : parseFloat(item.fieldValueRate); } } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueDisableParallel !== undefined && item.fieldValueDisableParallel !== null && item.fieldValueDisableParallel !== "") { acc[fieldCode] = extractId(item.fieldValueDisableParallel); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (resolvedNumber !== undefined && resolvedNumber !== null && resolvedNumber !== "") { acc[fieldCode] = typeof resolvedNumber === "number" ? resolvedNumber : parseFloat(resolvedNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; return { resource_id: Number($parameter.resource_id), project_id: Number($parameter.project_id), start_time: formatTime($parameter.start_time), end_time: formatTime($parameter.end_time), ...processFields($parameter.mandatoryFields), ...processFields($parameter.otherFields) }; })() }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a booking',
				description: 'Update an existing booking',
				routing: {
					request: {
						method: 'PUT',
						url: '={{ (() => { const base = "http://dev.eresourcescheduler.cloud:8080/rest/v1/bookings/" + $parameter.booking_id; const ub = $parameter.connectedBookingsFields?.update_connected_bookings; if (ub === 1 || ub === 2 || ub === 4) return base + "?update_connected_bookings=" + ub; return base; })() }}',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const resolveExpr = (value) => { if (value === undefined || value === null) return value; if (typeof value !== "string") return value; const raw = value.trim(); if (!raw) return value; const first = raw.charCodeAt(0); const second = raw.length > 1 ? raw.charCodeAt(1) : 0; const third = raw.length > 2 ? raw.charCodeAt(2) : 0; const isDoubleOpen = first === 123 && second === 123; const isEqualDoubleOpen = first === 61 && second === 123 && third === 123; const endsDoubleClose = raw.length >= 2 && raw.charCodeAt(raw.length - 2) === 125 && raw.charCodeAt(raw.length - 1) === 125; if ((isDoubleOpen || isEqualDoubleOpen) && endsDoubleClose) { try { const expressionToEvaluate = isEqualDoubleOpen ? raw.slice(1) : raw; const evaluated = $evaluateExpression(expressionToEvaluate); if (evaluated !== undefined && evaluated !== null) return evaluated; } catch (e) { } } return value; }; const toCalendarDateOnly = (value) => { if (value === undefined || value === null || value === "") return ""; if (typeof value === "string") { const resolved = resolveExpr(value); if (resolved !== value) return toCalendarDateOnly(resolved); const t = resolved.trim(); if (!t) return ""; if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) return t; const d = new Date(t); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; } if (typeof value === "object" && value) { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) return toCalendarDateOnly(iso); } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") return toCalendarDateOnly(s); } if (typeof value.ts === "number") return toCalendarDateOnly(value.ts); } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }; const normalizeDateInput = (value) => { if (value === undefined || value === null || value === "") return ""; const resolved = resolveExpr(value); if (resolved !== value) return normalizeDateInput(resolved); if (typeof value === "number") { const ms = value > 1000000000000 ? value : value * 1000; const d = new Date(ms); return isNaN(d.getTime()) ? "" : d.toISOString(); } if (typeof value === "string") { const raw = value.trim(); if (!raw) return ""; if (/^[0-9]+$/.test(raw)) { const n = Number(raw); if (!isNaN(n)) { const ms = n > 1000000000000 ? n : n * 1000; const d = new Date(ms); if (!isNaN(d.getTime())) return d.toISOString(); } } const d = new Date(raw); if (!isNaN(d.getTime())) return d.toISOString(); return ""; } if (typeof value === "object") { try { if (typeof value.toISO === "function") { const iso = value.toISO(); if (iso) { const d = new Date(iso); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.toString === "function") { const s = value.toString(); if (typeof s === "string" && s.trim() !== "" && s !== "[object Object]") { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString(); } } if (typeof value.ts === "number") { const d = new Date(value.ts); if (!isNaN(d.getTime())) return d.toISOString(); } } catch (e) { } return ""; } const d = new Date(value); return isNaN(d.getTime()) ? "" : d.toISOString(); }; const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const toId = (v) => { const id = extractId(v); return id === null ? undefined : id; }; const processFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; const resolvedText = resolveExpr(item.fieldValueText); const resolvedRichText = resolveExpr(item.fieldValueRichText); const resolvedNumber = resolveExpr(item.fieldValueNumber); if (resolvedText !== undefined && resolvedText !== null && resolvedText !== "") { acc[fieldCode] = fieldCode === "tags" ? String(resolvedText).split(",").map(function(s){ return s.trim(); }).filter(Boolean) : resolvedText; } else if (resolvedRichText !== undefined && resolvedRichText !== null && resolvedRichText !== "") { acc[fieldCode] = resolvedRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { const normalizedDate = normalizeDateInput(item.fieldValueDate); if (normalizedDate !== "") acc[fieldCode] = formatTime(normalizedDate); } else { const cal = toCalendarDateOnly(item.fieldValueDate); if (cal !== "") acc[fieldCode] = cal; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueBillingStatus !== undefined && item.fieldValueBillingStatus !== null && item.fieldValueBillingStatus !== "") { acc[fieldCode] = extractId(item.fieldValueBillingStatus); } else if (item.fieldValueRateFrom !== undefined && item.fieldValueRateFrom !== null && item.fieldValueRateFrom !== "") { const rf = extractId(item.fieldValueRateFrom); if (rf !== null && rf !== undefined) acc[fieldCode] = rf; if (fieldCode === "rate_from" && rf === 8 && item.fieldValueRate !== undefined && item.fieldValueRate !== null && item.fieldValueRate !== "") { acc.rate = typeof item.fieldValueRate === "number" ? item.fieldValueRate : parseFloat(item.fieldValueRate); } } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueDisableParallel !== undefined && item.fieldValueDisableParallel !== null && item.fieldValueDisableParallel !== "") { acc[fieldCode] = extractId(item.fieldValueDisableParallel); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (resolvedNumber !== undefined && resolvedNumber !== null && resolvedNumber !== "") { acc[fieldCode] = typeof resolvedNumber === "number" ? resolvedNumber : parseFloat(resolvedNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; const rid = toId($parameter.resource_id); const pid = toId($parameter.project_id); const body = {}; if (rid !== undefined) body.resource_id = rid; if (pid !== undefined) body.project_id = pid; const st = formatTime($parameter.start_time); const et = formatTime($parameter.end_time); if (st) body.start_time = st; if (et) body.end_time = et; Object.assign(body, processFields($parameter.additionalBookingFields)); return body; })() }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a booking',
				description: 'Delete a booking',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "http://dev.eresourcescheduler.cloud:8080/rest/v1/bookings/" + $parameter.booking_id }}`,
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
					},
				},
			},
		{
			name: 'Get Many',
			value: 'getAll',
			action: 'Get bookings',
			description: 'Retrieve a list of many bookings',
			routing: {
				request: {
					method: 'GET',
					url: `http://dev.eresourcescheduler.cloud:8080/rest/v1/bookings`,
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
			action: 'Get a booking',
			description: 'Retrieve a single booking by ID',
			routing: {
				request: {
					method: 'GET',
					url: `={{ "http://dev.eresourcescheduler.cloud:8080/rest/v1/bookings/" + $parameter.booking_id }}`,
					headers: {
						Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
					},
				},
			},
		},
			{
				name: 'Search',
				value: 'search',
				action: 'Search bookings',
				description:
					'Search for bookings using the flexible /v1/bookings/search endpoint with a raw JSON filter body as documented in the eRS Cloud API (Search Bookings section)',
				routing: {
					request: {
						method: 'POST',
						url: `http://dev.eresourcescheduler.cloud:8080/rest/v1/bookings/search`,
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
	...bookingGetAllDescription,
	...bookingCreateDescription,
	...bookingUpdateDescription,
	...bookingDeleteDescription,
	...bookingGetOneDescription,
	...bookingSearchDescription,
];

