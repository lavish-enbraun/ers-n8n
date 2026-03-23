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
		description: 'Unique ID of the requirement to update',
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'string',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description:
			'If set, sent as a numeric project ID',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description:
			'If set, start date and time (snapped to 15-minute intervals with seconds 00 in the request)',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		default: '',
		description: 'If set, end date and time (snapped like start time; must be at least 15 minutes after start)',
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
		description: 'If set, effort for the requirement (0–99999999.99)',
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
		description: 'If set with effort, unit for effort: 2 = Hours, 4 = FTE',
	},
	{
		displayName: 'Allow Multi Allocation',
		name: 'allow_multi_allocation',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		description:
			'When enabled, this refers to allocation of this specific requirement to multiple resources simultaneously.',
	},
	{
		displayName: 'Sync To Booking',
		name: 'sync_to_booking',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForRequirementUpdate,
		},
		description:
			'When enabled, common custom field values in bookings linked to this requirement are always synced from the requirement (users cannot modify those common custom fields in the booking form).',
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
		description:
			'Optional. Defined duration range for flexibility in fulfilling the requirement compared to the original requirement date. When set, flexi_range_unit is sent (default 2 = Days).',
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
		description:
			'Optional unit for flexi range (1 = Hours, 2 = Days). Default is 2. Used when flexi_range_duration is set.',
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
				description: 'Whether to delete linked bookings when updating the requirement',
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
		description:
			'Fields from GET /requirement/fields (required and optional; core fields above are excluded). After selecting a field, fill only the matching value control.',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: requirementCreateFieldValues.map((p) => {
					if (p.name === 'fieldName' && p.type === 'options') {
						return {
							...p,
							typeOptions: {
								...p.typeOptions,
								loadOptionsMethod: 'getRequirementFieldsAll',
							},
						};
					}
					if (
						(p.name === 'fieldValueMultiSelect' || p.name === 'fieldValueSelect') &&
						p.typeOptions &&
						'loadOptionsMethod' in p.typeOptions
					) {
						return {
							...p,
							typeOptions: {
								...p.typeOptions,
								loadOptionsMethod: 'getRequirementFieldOptionsAdditional',
							},
						};
					}
					return p;
				}),
			},
		],
	},
];
