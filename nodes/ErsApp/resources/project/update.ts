import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectUpdate = {
	operation: ['update'],
	resource: ['project'],
};

export const projectUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForProjectUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the project to update',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForProjectUpdate,
		},
		default: '',
		description: 'Title of the project',
		routing: {
			send: {
				property: 'title',
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
			show: showOnlyForProjectUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Project Type ID',
				name: 'project_type_id',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Type ID of the project',
				routing: {
					send: {
						property: 'project_type_id',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'project_start_date',
				type: 'dateTime',
				default: '',
				description: 'Start date of the project',
				routing: {
					send: {
						property: 'project_start_date',
						type: 'body',
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'end_date',
				type: 'dateTime',
				default: '',
				description: 'End date of the project',
				routing: {
					send: {
						property: 'end_date',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Tags for the project',
				routing: {
					send: {
						property: 'tags',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Project Calendar',
				name: 'project_calendar',
				type: 'number',
				placeholder: '',
				default: '',
				description: 'ID of Calendar to assign to project',
				routing: {
					send: {
						property: 'project_calendar',
						type: 'body',
					},
				},
			},
		],
	},
];

