import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectDelete = {
	operation: ['delete'],
	resource: ['project'],
};

export const projectDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForProjectDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the project to delete',
	},
];

