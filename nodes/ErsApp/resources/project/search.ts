import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectSearch = {
	operation: ['search'],
	resource: ['project'],
};

export const projectSearchDescription: INodeProperties[] = [
	{
		displayName: 'Search Body (JSON)',
		name: 'searchBodyJson',
		type: 'json',
		required: true,
		default: {},
		displayOptions: {
			show: showOnlyForProjectSearch,
		},
		description:
		'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs: https://apidocs.eresourcescheduler.cloud'
	},
];

