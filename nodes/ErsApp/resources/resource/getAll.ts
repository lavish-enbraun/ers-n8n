import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceGetResources = {
	operation: ['getAll'],
	resource: ['resource'],
};

const API_PAGE_SIZE = 500;

export const resourceGetResourcesDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForResourceGetResources,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
			},
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter: 'limit',
						offsetParameter: 'offset',
						pageSize: API_PAGE_SIZE,
						type: 'query',
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForResourceGetResources,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: 25,
		description: 'Max number of results to return.',
		routing: {
			send: {
				paginate: `={{ $value > ${API_PAGE_SIZE} }}`,
			},
			operations: {
				pagination: {
					type: 'offset',
					properties: {
						limitParameter: 'limit',
						offsetParameter: 'offset',
						pageSize: API_PAGE_SIZE,
						type: 'query',
					},
				},
			},
			output: {
				maxResults: '={{$value}}',
			},
		},
	},
];
