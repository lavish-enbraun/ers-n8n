import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingGetAll = {
	operation: ['getAll'],
	resource: ['booking'],
};

export const bookingGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: showOnlyForBookingGetAll,
		},
		typeOptions: {
			minValue: 1,
			maxValue: 5000,
		},
		default: 50,
		description: 'Max number of results to return',
		hint: 'Maximum number of results to return.',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		displayOptions: {
			show: showOnlyForBookingGetAll,
		},
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Number of records to skip from start',
		routing: {
			send: {
				type: 'query',
				property: 'offset',
			},
		},
	},
	{
		displayName: 'Start Date',
		name: 'start',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForBookingGetAll,
		},
		default: '',
		description: 'Filter bookings on or after this date',
		routing: {
			send: {
				type: 'query',
				property: 'start',
				value: '={{ (() => { if (!$value) return undefined; const t = String($value).trim(); if (!t) return undefined; if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) return t; const d = new Date(t); if (isNaN(d.getTime())) return undefined; const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${day}`; })() }}',
			},
		},
	},
	{
		displayName: 'End Date',
		name: 'end',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForBookingGetAll,
		},
		default: '',
		description: 'Filter bookings starting before this date',
		routing: {
			send: {
				type: 'query',
				property: 'end',
				value: '={{ (() => { if (!$value) return undefined; const t = String($value).trim(); if (!t) return undefined; if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(t)) return t; const d = new Date(t); if (isNaN(d.getTime())) return undefined; const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); const day = String(d.getDate()).padStart(2, "0"); return `${y}-${m}-${day}`; })() }}',
			},
		},
	},
];

