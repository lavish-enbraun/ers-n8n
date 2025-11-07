import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceDelete = {
	operation: ['delete'],
	resource: ['resource'],
};

export const resourceDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForResourceDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the resource to delete',
	},
];

