import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTimesheetSearch = {
	operation: ['search'],
	resource: ['timesheet'],
};

export const timesheetSearchDescription: INodeProperties[] = [
	{
		displayName: 'Search Body (JSON)',
		name: 'searchBodyJson',
		type: 'json',
		required: true,
		default: {},
		displayOptions: {
			show: showOnlyForTimesheetSearch,
		},
		description:
		'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs: https://apidocs.eresourcescheduler.cloud'
	},
];

