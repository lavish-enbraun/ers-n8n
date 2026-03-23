import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTimesheetCreate = {
	operation: ['create'],
	resource: ['timesheet'],
};

export const timesheetCreateDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		default: '',
		description: 'ID of the resource',
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		default: '',
		description: 'ID of the project',
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		typeOptions: {
			dateFormat: 'YYYY-MM-DD',
		},
		default: '',
		description: 'Date for the timesheet entry',
	},
	{
		displayName: 'Hours',
		name: 'hours',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Number of hours for the timesheet entry',
	},
	{
		displayName: 'Mandatory Fields',
		name: 'mandatoryFields',
		type: 'fixedCollection',
		placeholder: 'Add Mandatory Field',
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Mandatory fields from eResource Scheduler Timesheet. Fields are fetched dynamically from /timesheet/fields. Core fields (`resource_id`, `project_id`, `date`, `hours`) and `start_time`/`end_time` are excluded here.',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Field Name or Code',
						name: 'fieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getTimesheetFieldsMandatory',
						},
						default: '',
						description: 'Choose from the list, or specify a code using an expression',
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
							loadOptionsMethod: 'getTimesheetFieldOptionsMandatory',
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
							'Select multiple options from the dropdown. Selected values will be sent as an array of IDs.',
					},
					{
						displayName: 'Field Value (Number)',
						name: 'fieldValueNumber',
						type: 'number',
						default: 0,
						typeOptions: {
							maxValue: 999999999,
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
						description: 'Fill this for project/task (or role) when the API does not return a dropdown list.',
					},
					{
						displayName: 'Field Value (Billing Status)',
						name: 'fieldValueBillingStatus',
						type: 'options',
						default: 1,
						options: [
							{ name: 'Inherit from Project', value: 1 },
							{ name: 'Billable', value: 2 },
							{ name: 'Non Billable', value: 4 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"BLSTS".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Billing Rate From)',
						name: 'fieldValueRateFrom',
						type: 'options',
						default: 1,
						options: [
							{ name: 'Inherit from Project', value: 1 },
							{ name: 'Inherit from Resource', value: 2 },
							{ name: 'Inherit from Role', value: 4 },
							{ name: 'Custom', value: 8 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"RTFRM".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Custom Rate)',
						name: 'fieldValueRate',
						type: 'number',
						default: undefined,
						typeOptions: {
							minValue: 0,
							maxValue: 99999999.99,
						},
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"RTFRM".*' } }],
								fieldValueRateFrom: [8],
							},
						},
						description: 'Only used when Billing Rate From is set to Custom (8). Sent as `rate` in the request body.',
					},
					{
						displayName: 'Field Value (Unit)',
						name: 'fieldValueUnit',
						type: 'options',
						default: 1,
						options: [
							{ name: 'Capacity % (default)', value: 1 },
							{ name: 'Total Booking Hours', value: 2 },
							{ name: 'Full Time Equivalent', value: 4 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"UNIT".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Disable Parallel)',
						name: 'fieldValueDisableParallel',
						type: 'options',
						default: 1,
						options: [
							{ name: 'On selected resource', value: 1 },
							{ name: 'On selected project', value: 2 },
							{ name: 'On selected resource or project', value: 3 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"DDSS".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getTimesheetFieldOptionsMandatory',
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
						description: 'Fill for single-select dropdown fields when options are available.',
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
						description: 'For Tags, enter comma-separated values.',
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
				],
			},
		],
	},
	{
		displayName: 'Other Fields',
		name: 'otherFields',
		type: 'fixedCollection',
		placeholder: 'Add Other Field',
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Other fields from eResource Scheduler Timesheet. Fetched dynamically from /timesheet/fields.',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Field Name or Code',
						name: 'fieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getTimesheetFieldsOther',
						},
						default: '',
						description: 'Choose from the list, or specify a code using an expression',
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
							loadOptionsMethod: 'getTimesheetFieldOptionsOther',
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
							'Select multiple options from the dropdown. Selected values will be sent as an array of IDs.',
					},
					{
						displayName: 'Field Value (Number)',
						name: 'fieldValueNumber',
						type: 'number',
						default: 0,
						typeOptions: {
							maxValue: 999999999,
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
						description: 'Fill this for project/task (or role) when the API does not return a dropdown list.',
					},
					{
						displayName: 'Field Value (Billing Status)',
						name: 'fieldValueBillingStatus',
						type: 'options',
						default: 1,
						options: [
							{ name: 'Inherit from Project', value: 1 },
							{ name: 'Billable', value: 2 },
							{ name: 'Non Billable', value: 4 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"BLSTS".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Billing Rate From)',
						name: 'fieldValueRateFrom',
						type: 'options',
						default: 1,
						options: [
							{ name: 'Inherit from Project', value: 1 },
							{ name: 'Inherit from Resource', value: 2 },
							{ name: 'Inherit from Role', value: 4 },
							{ name: 'Custom', value: 8 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"RTFRM".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Custom Rate)',
						name: 'fieldValueRate',
						type: 'number',
						default: undefined,
						typeOptions: {
							minValue: 0,
							maxValue: 99999999.99,
						},
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"RTFRM".*' } }],
								fieldValueRateFrom: [8],
							},
						},
						description: 'Only used when Billing Rate From is set to Custom (8). Sent as `rate` in the request body.',
					},
					{
						displayName: 'Field Value (Unit)',
						name: 'fieldValueUnit',
						type: 'options',
						default: 1,
						options: [
							{ name: 'Capacity % (default)', value: 1 },
							{ name: 'Total Booking Hours', value: 2 },
							{ name: 'Full Time Equivalent', value: 4 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"UNIT".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Disable Parallel)',
						name: 'fieldValueDisableParallel',
						type: 'options',
						default: 1,
						options: [
							{ name: 'On selected resource', value: 1 },
							{ name: 'On selected project', value: 2 },
							{ name: 'On selected resource or project', value: 3 },
						],
						displayOptions: {
							show: {
								fieldName: [{ _cnd: { regex: '.*"field_type":"DDSS".*' } }],
							},
						},
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getTimesheetFieldOptionsOther',
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
						description: 'Fill for single-select dropdown fields when options are available.',
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
						description: 'For Tags, enter comma-separated values.',
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
				],
			},
		],
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Comment for the timesheet entry',
	},
];

