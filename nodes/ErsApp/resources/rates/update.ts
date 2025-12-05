import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRatesUpdate = {
	operation: ['update'],
	resource: ['rates'],
};

export const ratesUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForRatesUpdate,
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
		description: 'Select the entity type for which to update a rate',
	},
	{
		displayName: 'Entity ID',
		name: 'entity_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForRatesUpdate,
		},
		default: '',
		description: 'ID of the resource, project, or role',
	},
	{
		displayName: 'Cost Rate (in $)',
		name: 'cost_rate',
		type: 'number',
		displayOptions: {
			show: showOnlyForRatesUpdate,
		},
		default: 0,
		description: 'Cost rate in dollars',
		routing: {
			send: {
				property: 'cost_rate',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Billing Rate (in $)',
		name: 'billing_rate',
		type: 'number',
		displayOptions: {
			show: showOnlyForRatesUpdate,
		},
		default: 0,
		description: 'Billing rate in dollars',
		routing: {
			send: {
				property: 'billing_rate',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Effective Date',
		name: 'effective_date',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForRatesUpdate,
		},
		default: '',
		description: 'Effective date for the rate',
		routing: {
			send: {
				property: 'effective_date',
				type: 'body',
				value: '={{ new Date($value).toISOString().split("T")[0] }}',
			},
		},
	},
];

