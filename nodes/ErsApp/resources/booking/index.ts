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
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; return { resource_id: $parameter.resource_id, project_id: $parameter.project_id, start_time: formatTime($parameter.start_time), end_time: formatTime($parameter.end_time) }; })() }}',
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
						body: '={{ (() => { const formatTime = (dateStr) => { if (!dateStr) return ""; const d = new Date(dateStr); if (isNaN(d.getTime())) return ""; const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); let hours = d.getHours(); let minutes = d.getMinutes(); const rounded = Math.round(minutes / 15) * 15; if (rounded === 60) { minutes = 0; hours += 1; } else { minutes = rounded; } const hrs = String(hours).padStart(2, "0"); const mins = String(minutes).padStart(2, "0"); return `${year}-${month}-${day}T${hrs}:${mins}:00`; }; const toId = (v) => { if (v === undefined || v === null || v === "") return undefined; if (typeof v === "number" && !isNaN(v)) return v; const n = typeof v === "string" ? parseInt(v, 10) : Number(v); return isNaN(n) ? undefined : n; }; const rid = toId($parameter.resource_id); const pid = toId($parameter.project_id); const body = {}; if (rid !== undefined) body.resource_id = rid; if (pid !== undefined) body.project_id = pid; const st = formatTime($parameter.start_time); const et = formatTime($parameter.end_time); if (st) body.start_time = st; if (et) body.end_time = et; return body; })() }}',
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

