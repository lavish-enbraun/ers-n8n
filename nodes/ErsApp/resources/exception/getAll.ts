import type { INodeProperties } from 'n8n-workflow';

const showOnlyForExceptionGetAll = {
	operation: ['getAll'],
	resource: ['exception'],
};

export const exceptionGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForExceptionGetAll,
		},
		options: [
			{
				name: 'Project',
				value: 'project',
				description: 'Exceptions for a project',
			},
			{
				name: 'Resource',
				value: 'resource',
				description: 'Exceptions for a resource',
			},
		],
		default: 'project',
		description: 'Type of entity to retrieve exceptions for',
	},
	{
		displayName: 'Project ID',
		name: 'entity_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForExceptionGetAll,
				entity_type: ['project'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'ID of the project to retrieve exceptions for',
	},
	{
		displayName: 'Resource ID',
		name: 'entity_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForExceptionGetAll,
				entity_type: ['resource'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'ID of the resource to retrieve exceptions for',
	},
];

