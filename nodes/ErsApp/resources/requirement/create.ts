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
			loadOptionsMethod: 'getRequirementUDFFieldsMandatory',
		loadOptionsDependsOn: ['authentication'],
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		hint: 'Select the user-defined field from the list.',
		required: true,
	},
	{
		displayName: 'Field Value (Boolean)',
		name: 'fieldValueBoolean',
		type: 'boolean',
		default: false,
		description: 'Whether the field value is true',
		hint: 'Enter true or false for Checkbox and Boolean field types.',
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
		description: 'Enter a date or date-time value in ISO 8601 format',
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
			loadOptionsMethod: 'getRequirementUDFFieldOptions',
			loadOptionsDependsOn: ['authentication', 'fieldName'],
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
		description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		hint: 'Select one or more options from the list.',
	},
	{
		displayName: 'Field Value (Number)',
		name: 'fieldValueNumber',
		type: 'number',
		default: 0,
		description: 'Enter a numeric value for this field',
		typeOptions: {
			maxValue: 99999999.99,
			minValue: -999999999,
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
		description: 'Enter the ID of the selected option when no options list is available',
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
			loadOptionsMethod: 'getRequirementUDFFieldOptions',
			loadOptionsDependsOn: ['authentication', 'fieldName'],
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
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		hint: 'Enter true, false, or the ID of the selected option.',
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
		description: 'Enter a text value for this field. For Tags, enter comma-separated values.',
	},
	{
		displayName: 'Field Value (Rich Text)',
		name: 'fieldValueRichText',
		type: 'string',
		default: '',
		description: 'Enter a text value for this field',
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

/** Reuse shared field value controls with the "other fields" field-name loader. */
export function withRequirementOtherFieldLoader(values: INodeProperties[]): INodeProperties[] {
	return values.map((prop) => {
		if (prop.name !== 'fieldName' || !prop.typeOptions || !('loadOptionsMethod' in prop.typeOptions)) {
			return prop;
		}
		return {
			...prop,
			typeOptions: {
				...prop.typeOptions,
				loadOptionsMethod: 'getRequirementUDFFieldsOther',
			},
		};
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
		description: 'ID of the project for this requirement',
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
		description: 'Start date and time in yyyy-MM-ddThh:mm:00 format',
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
		description: 'End time, at least 15 minutes after start',
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
		description: 'Effort value for the requirement (0-99999999.99)',
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
		description: 'Unit for effort: Hours or FTE',
	},
	{
		displayName: 'Allow Multi Allocation',
		name: 'allow_multi_allocation',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForRequirementCreate,
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
			show: showOnlyForRequirementCreate,
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
			show: showOnlyForRequirementCreate,
		},
		typeOptions: {
			minValue: 0,
			numberPrecision: 0,
		},
		description: 'Optional duration range for fulfilling the requirement',
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
		description: 'Unit for flexi range: Hours or Days',
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
		description: 'Required user-defined fields for the requirement type',
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
		description: 'Optional user-defined fields for the requirement type',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: withRequirementOtherFieldLoader(requirementCreateFieldValues),
			},
		],
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		displayOptions: {
			show: showOnlyForRequirementCreate,
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Comment for the requirement',
	},
];
