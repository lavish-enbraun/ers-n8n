import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceDelete = {
	operation: ['delete'],
	resource: ['resource'],
};

export const resourceDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForResourceDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the resource to delete',
	},
	{
		displayName: 'Force Delete Options',
		name: 'forceDeleteOptions',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		displayOptions: {
			show: showOnlyForResourceDelete,
		},
		options: [
			{
				displayName: 'Force Delete Bookings',
				name: 'force_delete_bookings',
				type: 'boolean',
				default: false,
				description: 'Whether to also delete all associated bookings',
				hint: 'Also delete all associated bookings.',
			},
			{
				displayName: 'Force Delete Rates',
				name: 'force_delete_rates',
				type: 'boolean',
				default: false,
				description: 'Whether to also delete all associated rates',
				hint: 'Also delete all associated rates.',
			},
			{
				displayName: 'Force Delete Timesheet Entries',
				name: 'force_delete_timesheet_entry',
				type: 'boolean',
				default: false,
				description: 'Whether to also delete all associated timesheet entries',
				hint: 'Also delete all associated timesheet entries.',
			},
		],
		description: 'Whether to also delete associated records',
		hint: 'Toggle to also delete associated records.',
	},
];

