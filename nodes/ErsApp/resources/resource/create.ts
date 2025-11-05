import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceCreate = {
	operation: ['create'],
	resource: ['resource'],
};

export const resourceCreateDescription: INodeProperties[] = [
	{
		displayName: 'First Name',
		name: 'first_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: '',
		description: 'First name of the resource',
		routing: {
			send: {
				property: 'first_name',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Start Date',
		name: 'start_date',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: '',
		description: 'Start date of the resource (format: YYYY-MM-DD)',
		routing: {
			send: {
				property: 'start_date',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Resource Type ID',
		name: 'resource_type_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: 1,
		routing: {
			send: {
				property: 'resource_type_id',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Last Name',
		name: 'last_name',
		type: 'string',
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: '',
		description: 'Last name of the resource (for human resources only, up to 100 characters)',
		routing: {
			send: {
				property: 'last_name',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Last Date',
		name: 'last_date',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: '',
		description: 'Last working date of the resource (format: YYYY-MM-DD). Resource is only available till this date.',
		routing: {
			send: {
				property: 'last_date',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: {},
		options: [
			{
				displayName: 'Calendar',
				name: 'calendar',
				type: 'number',
				placeholder: '',
				default: '',
				description: 'ID of Calendar object to assign to resource effective from start_date',
				routing: {
					send: {
						property: 'calendar',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address of resource (maximum 254 characters)',
				routing: {
					send: {
						property: 'email',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Phone Number',
				name: 'phone',
				type: 'string',
				placeholder: '',
				default: '',
				description: 'Phone number of resource',
				routing: {
					send: {
						property: 'phone',
						type: 'body',
					},
				},
			},
		],
	},
];

