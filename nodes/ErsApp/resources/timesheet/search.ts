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
			'Raw JSON filter body sent directly to the eRS Cloud <code>/v1/timesheet/search</code> endpoint. ' +
			'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs ' +
			'(<em>Search Timesheet Entries</em> section at <code>https://apidocs.eresourcescheduler.cloud/#introduction</code>). ' +
			'On success the node returns the <code>data</code> array (which may be empty); if the body is invalid ' +
			'or filters are incorrect, the error response from the API is surfaced as-is.',
	},
];

