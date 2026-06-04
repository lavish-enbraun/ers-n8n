import type { INodeProperties } from 'n8n-workflow';
import { requirementCreateFieldValues } from './create';

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
		description: 'Unique ID of requirement to update',
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'string',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'Sent as a numeric project ID',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'Start date and time in yyyy-MM-ddThh:mm:00 format',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'End time, at least 15 minutes after start',
	},
	{
		displayName: 'Effort',
		name: 'effort',
		type: 'number',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		typeOptions: {
			minValue: 0,
			maxValue: 99999999.99,
			numberStepSize: 0.01,
		},
		default: undefined,
		description: 'Effort value for the requirement (0-99999999.99)',
	},
	{
		displayName: 'Unit',
		name: 'unit',
		type: 'options',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		options: [
			{
				name: 'Hours',
				value: 2,
				description: 'Fixed hours; does not change when the requirement changes',
			},
			{
				name: 'Full Time Equivalent',
				value: 4,
				description: 'FTE using the Administrator FTE calendar',
			},
		],
		default: 2,
		description: 'Unit for effort: Hours or FTE',
	},
	{
		displayName: 'Allow Multi Allocation',
		name: 'allow_multi_allocation',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		description: 'Whether to allow multiple resource allocations',
		hint: 'Toggle to allow multiple resource allocations.',
	},
	{
		displayName: 'Sync To Booking',
		name: 'sync_to_booking',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		description: 'Whether to sync custom fields to linked bookings',
		hint: 'Toggle to sync custom fields to linked bookings.',
	},
	{
		displayName: 'Flexi Range Duration',
		name: 'flexi_range_duration',
		type: 'number',
		default: undefined,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		typeOptions: {
			minValue: 0,
			numberPrecision: 0,
		},
		description: 'Optional duration range for fulfilling requirements',
	},
	{
		displayName: 'Flexi Range Unit',
		name: 'flexi_range_unit',
		type: 'options',
		default: 2,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		options: [
			{ name: 'Hours', value: 1, description: 'Hours as the flexi range unit' },
			{ name: 'Days', value: 2, description: 'Days as the flexi range unit' },
		],
		description: 'Unit for flexi range: Hours or Days',
	},
	{
		displayName: 'Update Fields',
		name: 'updateOptions',
		type: 'collection',
		placeholder: 'Add query option',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
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
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'fixedCollection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'User-defined fields for the requirement (required and optional)',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: requirementCreateFieldValues.map((p) => {
					if (p.name !== 'fieldName' || p.type !== 'options' || !p.typeOptions) return p;
					return {
						...p,
						typeOptions: {
							...p.typeOptions,
							loadOptionsMethod: 'getRequirementUDFFieldsAll',
							loadOptionsDependsOn: Array.from(
								new Set(['authentication', ...(p.typeOptions.loadOptionsDependsOn ?? [])]),
							),
						},
					};
				}),
			},
		],
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Comment for the requirement',
	},
];
