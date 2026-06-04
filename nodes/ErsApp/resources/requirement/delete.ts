import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRequirementDelete = {
	operation: ['delete'],
	resource: ['requirement'],
};

export const requirementDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Requirement ID',
		name: 'requirement_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the requirement to delete',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForRequirementDelete,
		},
		default: {},
		options: [
			{
				displayName: 'Delete Bookings',
				name: 'delete_bookings',
				type: 'boolean',
				default: false,
				description: 'Whether to delete all associated bookings',
				hint: 'Toggle to delete all associated bookings.',
				routing: {
					send: {
						type: 'query',
						property: 'delete_bookings',
					},
				},
			},
			{
				displayName: 'Unlink Bookings',
				name: 'unlink_bookings',
				type: 'boolean',
				default: false,
				description: 'Whether to unlink all associated bookings',
				hint: 'Toggle to unlink all associated bookings.',
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

