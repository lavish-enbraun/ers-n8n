import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRequirementUpdate = {
	operation: ['update'],
	resource: ['requirement'],
};

export const requirementUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Requirement ID',
		name: 'requirement_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'Unique ID of the requirement to update',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'Start date and time for requirement (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'End date and time for requirement (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45). Must be at least 15 minutes after start_time.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: {},
		options: [
			{
				displayName: 'Allow Multi Allocation',
				name: 'allow_multi_allocation',
				type: 'boolean',
				default: false,
				description: 'Whether to allow multi-allocation for the requirement',
			},
			{
				displayName: 'Delete Bookings',
				name: 'delete_bookings',
				type: 'boolean',
				default: false,
				description: 'Whether to delete linked bookings when updating the requirement',
				routing: {
					send: {
						type: 'query',
						property: 'delete_bookings',
					},
				},
			},
			{
				displayName: 'Effort',
				name: 'effort',
				type: 'string',
				typeOptions: {
					minValue: 0,
					maxValue: 99999999.99,
					numberStepSize: 0.01,
				},
				default: '',
				description: 'Effort value for the requirement. Defines how much effort is needed to complete the task (0-99999999.99).',
			},
			{
				displayName: 'Role ID',
				name: 'role_id',
				type: 'string',
				default: '',
				description: 'ID of the role object that the resource needs to perform for the requirement',
			},
			{
				displayName: 'Sync to Booking',
				name: 'sync_to_booking',
				type: 'boolean',
				default: false,
				description: 'Whether to sync the requirement to booking',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: [],
				description: 'Array of tags for the requirement',
				typeOptions: {
					multipleValues: true,
				},
			},
			{
				displayName: 'Task ID',
				name: 'task_id',
				type: 'string',
				default: '',
				description: 'ID of the task object within the project that needs to be done in this requirement',
			},
			{
				displayName: 'Unit',
				name: 'unit',
				type: 'options',
				options: [
					{
						name: 'Hours',
						value: 2,
						description: 'Effort value in fixed hours which doesn\'t change upon changes in requirement',
					},
					{
						name: 'Full Time Equivalent (FTE)',
						value: 4,
						description: 'Full time equivalent calculated using FTE calendar defined in Administrator calendar settings',
					},
				],
				default: 2,
				description: 'Unit in which effort is defined (2 for Hours, 4 for Full Time Equivalent)',
			},
			{
				displayName: 'Unlink Bookings',
				name: 'unlink_bookings',
				type: 'boolean',
				default: false,
				description: 'Whether to unlink linked bookings when updating the requirement',
				routing: {
					send: {
						type: 'query',
						property: 'unlink_bookings',
					},
				},
			},
		],
	},
];