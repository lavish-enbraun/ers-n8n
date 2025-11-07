import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceUpdate = {
	operation: ['update'],
	resource: ['resource'],
};

export const resourceUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForResourceUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the resource to update',
	},
	{
		displayName: 'First Name',
		name: 'first_name',
		type: 'string',
		displayOptions: {
			show: showOnlyForResourceUpdate,
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
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForResourceUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Calendar ID',
				name: 'calendar',
				type: 'number',
				placeholder: '',
				default: '',
				description: 'ID of Calendar to assign to resource',
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
				routing: {
					send: {
						property: 'email',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Last name of the resource',
				routing: {
					send: {
						property: 'last_name',
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

