import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingUpdate = {
	operation: ['update'],
	resource: ['booking'],
};

export const bookingUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Booking ID',
		name: 'booking_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the booking to update',
	},
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the resource',
		routing: {
			send: {
				property: 'resource_id',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the project',
		routing: {
			send: {
				property: 'project_id',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		description: 'Start time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		description: 'End time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Update Connected Bookings',
				name: 'update_connected_bookings',
				type: 'options',
				default: 4,
				description: 'How to handle recurring bookings when updating',
				options: [
					{
						name: 'All Related Bookings',
						value: 1,
						description: 'Update this booking and all its related bookings',
					},
					{
						name: 'Future Bookings Only',
						value: 2,
						description: 'Update this booking and all its future bookings',
					},
					{
						name: 'This Booking Only',
						value: 4,
						description: 'Update only this booking without changing related bookings',
					},
				],
				routing: {
					send: {
						type: 'query',
						property: 'update_connected_bookings',
					},
				},
			},
		],
	},
];

