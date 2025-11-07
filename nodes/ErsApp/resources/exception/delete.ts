import type { INodeProperties } from 'n8n-workflow';

const showOnlyForExceptionDelete = {
	operation: ['delete'],
	resource: ['exception'],
};

export const exceptionDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForExceptionDelete,
		},
		options: [
			{
				name: 'Project',
				value: 'project',
				description: 'Exception for a project',
			},
			{
				name: 'Resource',
				value: 'resource',
				description: 'Exception for a resource',
			},
		],
		default: 'project',
		description: 'Type of entity this exception belongs to',
	},
	{
		displayName: 'Project ID',
		name: 'entity_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForExceptionDelete,
				entity_type: ['project'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'ID of the project that contains the exception',
	},
	{
		displayName: 'Resource ID',
		name: 'entity_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForExceptionDelete,
				entity_type: ['resource'],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'ID of the resource that contains the exception',
	},
	{
		displayName: 'Exception ID',
		name: 'exception_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForExceptionDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the exception to delete',
	},
];

