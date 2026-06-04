import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingSearch = {
	operation: ['search'],
	resource: ['booking'],
};

export const bookingSearchDescription: INodeProperties[] = [
	{
		displayName: 'Search Body (JSON)',
		name: 'searchBodyJson',
		type: 'json',
		required: true,
		default: {},
		displayOptions: {
			show: showOnlyForBookingSearch,
		},
		description:
			'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs: https://apidocs.eresourcescheduler.cloud'
	},
];

