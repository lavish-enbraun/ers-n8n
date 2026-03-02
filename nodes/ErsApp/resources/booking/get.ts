import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingGet = {
	operation: ['get'],
	resource: ['booking'],
};

export const bookingGetOneDescription: INodeProperties[] = [
	{
		displayName: 'Booking ID',
		name: 'booking_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingGet,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the booking to retrieve',
	},
];

