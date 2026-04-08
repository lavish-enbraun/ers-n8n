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
				description: 'Whether to delete the resource along with all associated bookings',
			},
			{
				displayName: 'Force Delete Rates',
				name: 'force_delete_rates',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the resource along with all associated rates',
			},
			{
				displayName: 'Force Delete Timesheet Entries',
				name: 'force_delete_timesheet_entry',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the resource along with all associated timesheet entries',
			},
		],
		description: 'Optional flags to force delete related bookings, rates, and timesheet entries',
	},
];

