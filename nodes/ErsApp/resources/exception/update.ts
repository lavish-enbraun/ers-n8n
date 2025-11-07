import type { INodeProperties } from 'n8n-workflow';

const showOnlyForExceptionUpdate = {
	operation: ['update'],
	resource: ['exception'],
};

export const exceptionUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Entity Type',
		name: 'entity_type',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForExceptionUpdate,
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
				...showOnlyForExceptionUpdate,
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
				...showOnlyForExceptionUpdate,
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
			show: showOnlyForExceptionUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the exception to update',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForExceptionUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the exception',
			},
			{
				displayName: 'Date',
				name: 'date',
				type: 'dateTime',
				default: '',
				description: 'Date when the exception will be applied (format: yyyy-MM-dd)',
			},
			{
				displayName: 'Is Working Exception',
				name: 'is_working_exception',
				type: 'boolean',
				default: true,
				description: 'Whether this is a working exception (true) or non-working exception (false)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the exception',
			},
			{
				displayName: 'Timing Blocks',
				name: 'timing_blocks',
				type: 'fixedCollection',
				default: {},
				description: 'Array of timing blocks for the exception. Each block has start_time and end_time in minutes from midnight (0-1439)',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Timing Block',
						name: 'timing_block',
						values: [
							{
								displayName: 'Start Time',
								name: 'start_time',
								type: 'number',
								typeOptions: {
									minValue: 0,
									maxValue: 1439,
								},
								default: 0,
								description: 'Start time in minutes from midnight (0-1439). Example: 600 = 10:00 AM',
							},
							{
								displayName: 'End Time',
								name: 'end_time',
								type: 'number',
								typeOptions: {
									minValue: 0,
									maxValue: 1439,
								},
								default: 0,
								description: 'End time in minutes from midnight (0-1439). Example: 1080 = 6:00 PM',
							},
						],
					},
				],
			},
		],
	},
];

