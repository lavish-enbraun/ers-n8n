import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRequirementCreate = {
	operation: ['create'],
	resource: ['requirement'],
};

export const requirementCreateFieldValues: INodeProperties[] = [
	{
		displayName: 'Field Name or ID',
		name: 'fieldName',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getRequirementFieldsMandatory',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
	},
	{
		displayName: 'Field Value (Boolean)',
		name: 'fieldValueBoolean',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"CHK".*' } },
					{ _cnd: { regex: '.*"field_type":"BOOLEAN".*' } },
				],
			},
		},
	},
	{
		displayName: 'Field Value (Date/Time)',
		name: 'fieldValueDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"DATE".*' } },
					{ _cnd: { regex: '.*"field_type":"DATIM".*' } },
				],
			},
		},
	},
	{
		displayName: 'Field Value (Multi-Select) Names or IDs',
		name: 'fieldValueMultiSelect',
		type: 'multiOptions',
		noDataExpression: true,
		typeOptions: {
			loadOptionsMethod: 'getRequirementFieldOptionsMandatory',
			loadOptionsDependsOn: ['fieldName'],
			searchable: true,
		},
		default: [],
		displayOptions: {
			show: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"DDMS".*' } },
					{ _cnd: { regex: '.*"field_type":"ROLES".*' } },
					{ _cnd: { regex: '.*"field_type":"CHGRP".*' } },
					{ _cnd: { regex: '.*"field_type":"UMS".*' } },
				],
			},
		},
		description:
			'Select multiple options from the dropdown. Selected values will be sent as an array of IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Field Value (Number)',
		name: 'fieldValueNumber',
		type: 'number',
		default: 0,
		typeOptions: {
			maxValue: 99999999.99,
			minValue: -999999999.99,
		},
		displayOptions: {
			show: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"NUMBER".*' } },
					{ _cnd: { regex: '.*"field_type":"INTEGER".*' } },
					{ _cnd: { regex: '.*"field_type":"FLOAT".*' } },
					{ _cnd: { regex: '.*"field_type":"INT"[^E].*' } },
					{ _cnd: { regex: '.*"field_type":"EFFORT".*' } },
				],
			},
		},
	},
	{
		displayName: 'Field Value (ID)',
		name: 'fieldValueId',
		type: 'number',
		default: undefined,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"TSKSS".*' } },
					{ _cnd: { regex: '.*"field_type":"REQSS".*' } },
					{ _cnd: { regex: '.*"field_type":"ROLEPS".*' } },
					{ _cnd: { regex: '.*"field_type":"PRJSS".*' } },
				],
			},
			hide: {
				fieldName: [{ _cnd: { regex: '.*"has_options":true.*' } }],
			},
		},
		description: 'Fill this for project/task (or role without options) when the API does not return a dropdown list',
	},
	{
		displayName: 'Field Value (Unit)',
		name: 'fieldValueUnit',
		type: 'options',
		default: 2,
		options: [
			{
				name: 'Hours',
				value: 2,
				description: "Effort in fixed hours (doesn't change when requirement changes)",
			},
			{
				name: 'Full Time Equivalent (FTE)',
				value: 4,
				description: 'FTE using the calendar from Administrator settings',
			},
		],
		displayOptions: {
			show: {
				fieldName: [{ _cnd: { regex: '.*"field_type":"UNIT".*' } }],
			},
		},
		description: 'Unit for effort (requirement API: typically 2 = Hours, 4 = FTE)',
	},
	{
		displayName: 'Field Value (Select) Name or ID',
		name: 'fieldValueSelect',
		type: 'options',
		noDataExpression: true,
		typeOptions: {
			loadOptionsMethod: 'getRequirementFieldOptionsMandatory',
			loadOptionsDependsOn: ['fieldName'],
			searchable: true,
		},
		default: '',
		displayOptions: {
			show: {
				fieldName: [{ _cnd: { regex: '.*"has_options":true.*' } }],
			},
			hide: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"DDMS".*' } },
					{ _cnd: { regex: '.*"field_type":"ROLES".*' } },
					{ _cnd: { regex: '.*"field_type":"CHGRP".*' } },
					{ _cnd: { regex: '.*"field_type":"UMS".*' } },
				],
			},
		},
		description:
			'Fill this for single-select dropdown fields (e.g. Performing Role when options are returned by the API). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Field Value (Text)',
		name: 'fieldValueText',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				fieldName: [
					{ _cnd: { regex: '.*"field_type":"TEXT".*' } },
					{ _cnd: { regex: '.*"field_type":"EMAIL".*' } },
					{ _cnd: { regex: '.*"field_type":"ENAME".*' } },
					{ _cnd: { regex: '.*"field_type":"URL".*' } },
					{ _cnd: { regex: '.*"field_type":"COLPICK".*' } },
					{ _cnd: { regex: '.*"field_type":"TAGS".*' } },
				],
			},
		},
		description: 'For Tags, enter comma-separated values (sent as an array of strings)',
	},
	{
		displayName: 'Field Value (Rich Text)',
		name: 'fieldValueRichText',
		type: 'string',
		default: '',
		typeOptions: {
			editor: 'htmlEditor',
		},
		displayOptions: {
			show: {
				fieldName: [{ _cnd: { regex: '.*"field_type":"MLTEXT".*' } }],
			},
		},
	},
];

export function withRequirementOtherFieldLoader(values: INodeProperties[]): INodeProperties[] {
	return values.map((prop) => {
		if (prop.name === 'fieldName' && prop.typeOptions && 'loadOptionsMethod' in prop.typeOptions) {
			return {
				...prop,
				typeOptions: {
					...prop.typeOptions,
					loadOptionsMethod: 'getRequirementFieldsOther',
				},
			};
		}
		if (
			(prop.name === 'fieldValueMultiSelect' || prop.name === 'fieldValueSelect') &&
			prop.typeOptions &&
			'loadOptionsMethod' in prop.typeOptions
		) {
			return {
				...prop,
				typeOptions: {
					...prop.typeOptions,
					loadOptionsMethod: 'getRequirementFieldOptionsOther',
				},
			};
		}
		return prop;
	});
}

export const requirementCreateDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		default: '',
		description:
			'ID of the project for which this requirement is created',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		default: '',
		description:
			'Start date and time (snapped to 15-minute intervals with seconds 00 in the request, format yyyy-MM-ddThh:mm:00)',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		default: '',
		description:
			'End date and time (must be at least 15 minutes after start; snapped like start_time)',
	},
	{
		displayName: 'Effort',
		name: 'effort',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		typeOptions: {
			minValue: 0,
			maxValue: 99999999.99,
			numberStepSize: 0.01,
		},
		default: 0,
		description: 'Effort for the requirement (0–99999999.99)',
	},
	{
		displayName: 'Unit',
		name: 'unit',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementCreate,
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
		description: 'Unit for effort: 2 = Hours, 4 = FTE',
	},
	{
		displayName: 'Copies',
		name: 'copies',
		type: 'number',
		default: 0,
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		description: 'Number of copies to create',
	},
	{
		displayName: 'Allow Multi Allocation',
		name: 'allow_multi_allocation',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForRequirementCreate,
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
			show: showOnlyForRequirementCreate,
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
			show: showOnlyForRequirementCreate,
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
			show: showOnlyForRequirementCreate,
		},
		options: [
			{ name: 'Hours', value: 1, description: 'Hours as the flexi range unit' },
			{ name: 'Days', value: 2, description: 'Days as the flexi range unit' },
		],
		description:
			'Optional unit for flexi range (1 = Hours, 2 = Days). Default is 2. Used when flexi_range_duration is set.',
	},
	{
		displayName: 'Mandatory Fields',
		name: 'mandatoryFields',
		type: 'fixedCollection',
		placeholder: 'Add Mandatory Field',
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Required fields from GET /requirement/fields (project, start/end time, effort, and unit are set above and are not listed here). Add one row per field; fill only the matching value control.',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: requirementCreateFieldValues,
			},
		],
	},
	{
		displayName: 'Other Fields',
		name: 'otherFields',
		type: 'fixedCollection',
		placeholder: 'Add Other Field',
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Optional fields from GET /requirement/fields (same value rules as mandatory fields; core fields above are excluded)',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: withRequirementOtherFieldLoader(requirementCreateFieldValues),
			},
		],
	},
];
