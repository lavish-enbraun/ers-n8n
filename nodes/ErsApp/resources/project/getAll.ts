import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectGetAll = {
	operation: ['getAll'],
	resource: ['project'],
};

export const projectGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: showOnlyForProjectGetAll,
		},
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		displayOptions: {
			show: showOnlyForProjectGetAll,
		},
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Offset keyword is used to skip n items. If offset value is given as 10, then first 10 records will be skipped from result set. Default value is 0.',
		routing: {
			send: {
				type: 'query',
				property: 'offset',
			},
		},
	},
];

