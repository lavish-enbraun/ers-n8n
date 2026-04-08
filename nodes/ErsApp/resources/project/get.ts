import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectGet = {
	operation: ['get'],
	resource: ['project'],
};

export const projectGetOneDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForProjectGet,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the project to retrieve',
	},
];

