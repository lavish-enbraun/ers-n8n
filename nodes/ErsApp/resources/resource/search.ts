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
			'Raw JSON filter body sent directly to the eRS Cloud <code>/v1/resources/search</code> endpoint. ' +
			'It must be valid JSON and follow the filter syntax described in the eRS Cloud API docs ' +
			'(<em>Search Resources</em> section at <code>https://apidocs.eresourcescheduler.cloud/#introduction</code>). ' +
			'For example: <code>{"resource_type_id:eq": 1}</code> or <code>{"name:has": "Amy"}</code>. ' +
			'On success the node returns the <code>data</code> array (which may be empty); if the body is invalid ' +
			'or filters are incorrect, the error response from the API is surfaced as-is.',
	},
];

