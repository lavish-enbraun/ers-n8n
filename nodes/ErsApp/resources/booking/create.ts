import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingCreate = {
	operation: ['create'],
	resource: ['booking'],
};

export const bookingCreateDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingCreate,
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
			show: showOnlyForBookingCreate,
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
			show: showOnlyForBookingCreate,
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
			show: showOnlyForBookingCreate,
		},
		default: '',
		description: 'End time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
];