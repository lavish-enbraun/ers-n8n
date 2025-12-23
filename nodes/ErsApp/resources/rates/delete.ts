import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRatesDelete = {
	operation: ['delete'],
	resource: ['rates'],
};

export const ratesDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForRatesDelete,
		},
		options: [
			{
				name: 'Resource',
				value: 'resources',
			},
			{
				name: 'Project',
				value: 'projects',
			},
			{
				name: 'Roles',
				value: 'roles',
			},
		],
		default: 'resources',
		description: 'Select the entity type for which to delete a rate',
	},
	{
		displayName: 'Entity ID',
		name: 'entity_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForRatesDelete,
		},
		default: '',
		description: 'ID of the resource, project, or role',
	},
	{
		displayName: 'Rate ID',
		name: 'rate_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForRatesDelete,
		},
		default: '',
		description: 'ID of the rate to delete',
	},
];

