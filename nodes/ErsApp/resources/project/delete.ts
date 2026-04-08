import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectDelete = {
	operation: ['delete'],
	resource: ['project'],
};

export const projectDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForProjectDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the project to delete',
	},
	{
		displayName: 'Force Delete Options',
		name: 'forceDeleteOptions',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: showOnlyForProjectDelete,
		},
		options: [
			{
				displayName: 'Force Delete Requirements',
				name: 'force_delete_requirements',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the project along with all associated requirements',
			},
			{
				displayName: 'Force Delete Bookings',
				name: 'force_delete_bookings',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the project along with all associated bookings',
			},
			{
				displayName: 'Force Delete Timesheet Entries',
				name: 'force_delete_timesheet_entry',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the project along with all associated timesheet entries',
			},
			{
				displayName: 'Force Delete Rates',
				name: 'force_delete_rates',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the project along with all associated rates',
			},
		],
		description: 'Optional flags to force delete related requirements, bookings, timesheet entries, and rates',
	},
];

