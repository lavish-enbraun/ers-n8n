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
		default: 500,
		description: 'The limit keyword is used to limit the number of records returned from a result set. Default value is 500. Maximum value is 5000.',
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
		description: 'Offset keyword is used to skip n items. If offset value is given as 10, then first 10 records will be skipped from result set. Default value is 0.',
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
		description: 'Start date in ISO 8601 format (yyyy-MM-dd). Used to filter bookings starting on or after this date. Must be provided together with End Date.',
		routing: {
			send: {
				type: 'query',
				property: 'start',
				value: '={{ $value ? new Date($value).toISOString().split("T")[0] : undefined }}',
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
		description: 'End date in ISO 8601 format (yyyy-MM-dd). Used to filter bookings starting before this date. Must be provided together with Start Date.',
		routing: {
			send: {
				type: 'query',
				property: 'end',
				value: '={{ $value ? new Date($value).toISOString().split("T")[0] : undefined }}',
			},
		},
	},
];

