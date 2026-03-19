import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
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
						url: `${BASE_URL}${API_BASE_PATH}/bookings`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const processFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = fieldCode === "tags" ? item.fieldValueText.split(",").map(function(s){ return s.trim(); }).filter(Boolean) : item.fieldValueText; } else if (item.fieldValueRichText !== undefined && item.fieldValueRichText !== null && item.fieldValueRichText !== "") { acc[fieldCode] = item.fieldValueRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { acc[fieldCode] = formatTime(item.fieldValueDate); } else { acc[fieldCode] = new Date(item.fieldValueDate).toISOString().split("T")[0]; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueBillingStatus !== undefined && item.fieldValueBillingStatus !== null && item.fieldValueBillingStatus !== "") { acc[fieldCode] = extractId(item.fieldValueBillingStatus); } else if (item.fieldValueRateFrom !== undefined && item.fieldValueRateFrom !== null && item.fieldValueRateFrom !== "") { const rf = extractId(item.fieldValueRateFrom); if (rf !== null && rf !== undefined) acc[fieldCode] = rf; if (fieldCode === "rate_from" && rf === 8 && item.fieldValueRate !== undefined && item.fieldValueRate !== null && item.fieldValueRate !== "") { acc.rate = typeof item.fieldValueRate === "number" ? item.fieldValueRate : parseFloat(item.fieldValueRate); } } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueDisableParallel !== undefined && item.fieldValueDisableParallel !== null && item.fieldValueDisableParallel !== "") { acc[fieldCode] = extractId(item.fieldValueDisableParallel); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; return { resource_id: $parameter.resource_id, project_id: $parameter.project_id, start_time: formatTime($parameter.start_time), end_time: formatTime($parameter.end_time), ...processFields($parameter.mandatoryFields), ...processFields($parameter.otherFields) }; })() }}',
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
						url: '={{ (() => { const base = "' + BASE_URL + API_BASE_PATH + '/bookings/" + $parameter.booking_id; const ub = $parameter.additionalFields?.update_connected_bookings; if (ub === 1 || ub === 2 || ub === 4) return base + "?update_connected_bookings=" + ub; return base; })() }}',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const isUdfDateTimeType = (ft) => { const k = String(ft ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); if (!k || k === "DATE") return false; return k === "DATIM" || k === "DTIM" || k.includes("TIME"); }; const extractId = (value) => { if (value === undefined || value === null || value === "") return null; if (typeof value === "number") return value; if (typeof value === "string") { try { if (value.trim().startsWith("{")) { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } const num = parseInt(value); if (!isNaN(num)) return num; } catch (e) { } return value; } if (typeof value === "object" && value && "id" in value) { return value.id; } return value; }; const extractMultiSelectIds = (value) => { if (value === undefined || value === null) return []; if (Array.isArray(value)) { if (value.length === 0) return []; return value.map(extractId).filter(id => id !== null && id !== undefined); } const singleId = extractId(value); return singleId !== null && singleId !== undefined ? [singleId] : []; }; const toId = (v) => { const id = extractId(v); return id === null ? undefined : id; }; const processFields = (fields) => { if (fields?.field && Array.isArray(fields.field)) { return fields.field.reduce((acc, item) => { if (item.fieldName) { try { const fieldData = JSON.parse(item.fieldName); const fieldCode = fieldData.code; const fieldType = fieldData.field_type || ""; if (item.fieldValueText !== undefined && item.fieldValueText !== null && item.fieldValueText !== "") { acc[fieldCode] = fieldCode === "tags" ? item.fieldValueText.split(",").map(function(s){ return s.trim(); }).filter(Boolean) : item.fieldValueText; } else if (item.fieldValueRichText !== undefined && item.fieldValueRichText !== null && item.fieldValueRichText !== "") { acc[fieldCode] = item.fieldValueRichText; } else if (item.fieldValueBoolean !== undefined && item.fieldValueBoolean !== null) { acc[fieldCode] = item.fieldValueBoolean; } else if (item.fieldValueDate !== undefined && item.fieldValueDate !== null && item.fieldValueDate !== "") { if (isUdfDateTimeType(fieldType)) { acc[fieldCode] = formatTime(item.fieldValueDate); } else { acc[fieldCode] = new Date(item.fieldValueDate).toISOString().split("T")[0]; } } else if (item.fieldValueSelect !== undefined && item.fieldValueSelect !== null && item.fieldValueSelect !== "") { const id = extractId(item.fieldValueSelect); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueId !== undefined && item.fieldValueId !== null && item.fieldValueId !== "") { const id = extractId(item.fieldValueId); if (id !== null && id !== undefined) acc[fieldCode] = id; } else if (item.fieldValueBillingStatus !== undefined && item.fieldValueBillingStatus !== null && item.fieldValueBillingStatus !== "") { acc[fieldCode] = extractId(item.fieldValueBillingStatus); } else if (item.fieldValueRateFrom !== undefined && item.fieldValueRateFrom !== null && item.fieldValueRateFrom !== "") { const rf = extractId(item.fieldValueRateFrom); if (rf !== null && rf !== undefined) acc[fieldCode] = rf; if (fieldCode === "rate_from" && rf === 8 && item.fieldValueRate !== undefined && item.fieldValueRate !== null && item.fieldValueRate !== "") { acc.rate = typeof item.fieldValueRate === "number" ? item.fieldValueRate : parseFloat(item.fieldValueRate); } } else if (item.fieldValueUnit !== undefined && item.fieldValueUnit !== null && item.fieldValueUnit !== "") { acc[fieldCode] = extractId(item.fieldValueUnit); } else if (item.fieldValueDisableParallel !== undefined && item.fieldValueDisableParallel !== null && item.fieldValueDisableParallel !== "") { acc[fieldCode] = extractId(item.fieldValueDisableParallel); } else if (item.fieldValueMultiSelect !== undefined && item.fieldValueMultiSelect !== null) { const ids = extractMultiSelectIds(item.fieldValueMultiSelect); if (ids.length > 0) acc[fieldCode] = ids; } else if (item.fieldValueNumber !== undefined && item.fieldValueNumber !== null && item.fieldValueNumber !== "") { acc[fieldCode] = typeof item.fieldValueNumber === "number" ? item.fieldValueNumber : parseFloat(item.fieldValueNumber); } } catch (e) { } } return acc; }, {}); } return {}; }; const rid = toId($parameter.resource_id); const pid = toId($parameter.project_id); const body = {}; if (rid !== undefined) body.resource_id = rid; if (pid !== undefined) body.project_id = pid; const st = formatTime($parameter.start_time); const et = formatTime($parameter.end_time); if (st) body.start_time = st; if (et) body.end_time = et; Object.assign(body, processFields($parameter.udfFields)); return body; })() }}',
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
						url: `={{ "${BASE_URL}${API_BASE_PATH}/bookings/" + $parameter.booking_id }}`,
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
					url: `${BASE_URL}${API_BASE_PATH}/bookings`,
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
					url: `={{ "${BASE_URL}${API_BASE_PATH}/bookings/" + $parameter.booking_id }}`,
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
						url: `${BASE_URL}${API_BASE_PATH}/bookings/search`,
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

