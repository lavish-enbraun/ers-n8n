import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceSearch = {
	operation: ['search'],
	resource: ['resource'],
};

export const resourceSearchDescription: INodeProperties[] = [
	{
		displayName: 'Search Body (JSON)',
		name: 'searchBodyJson',
		type: 'json',
		required: true,
		default: {},
		displayOptions: {
			show: showOnlyForResourceSearch,
		},
		description:
		'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs: https://apidocs.eresourcescheduler.cloud'
	},
];

