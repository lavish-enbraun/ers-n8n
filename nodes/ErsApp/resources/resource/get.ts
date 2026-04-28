import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceGet = {
	operation: ['get'],
	resource: ['resource'],
};

export const resourceGetOneDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForResourceGet,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the resource to retrieve',
	},
];

