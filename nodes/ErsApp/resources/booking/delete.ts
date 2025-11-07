import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingDelete = {
	operation: ['delete'],
	resource: ['booking'],
};

export const bookingDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Booking ID',
		name: 'booking_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the booking to delete',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForBookingDelete,
		},
		default: {},
		options: [
			{
				displayName: 'Delete Connected Bookings',
				name: 'delete_connected_bookings',
				type: 'options',
				default: 4,
				description: 'How to handle recurring bookings when deleting',
				options: [
					{
						name: 'All Related Bookings',
						value: 1,
						description: 'Delete this booking and all its related bookings',
					},
					{
						name: 'Future Bookings Only',
						value: 2,
						description: 'Delete this booking and all its future bookings',
					},
					{
						name: 'This Booking Only',
						value: 4,
						description: 'Delete only this booking without affecting related bookings',
					},
				],
				routing: {
					send: {
						type: 'query',
						property: 'delete_connected_bookings',
					},
				},
			},
		],
	},
];

