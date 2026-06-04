import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRequirementSearch = {
	operation: ['search'],
	resource: ['requirement'],
};

export const requirementSearchDescription: INodeProperties[] = [
	{
		displayName: 'Search Body (JSON)',
		name: 'searchBodyJson',
		type: 'json',
		required: true,
		default: {},
		displayOptions: {
			show: showOnlyForRequirementSearch,
		},
		description:
		'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs: https://apidocs.eresourcescheduler.cloud'
	},
];

