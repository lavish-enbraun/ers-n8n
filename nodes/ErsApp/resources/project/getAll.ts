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
		hint: 'Maximum number of results to return.',
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
		description: 'Number of records to skip from the start',
		routing: {
			send: {
				type: 'query',
				property: 'offset',
			},
		},
	},
];

