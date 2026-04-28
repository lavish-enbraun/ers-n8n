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
						default: '',
						description: 'Choose from the list, or specify a code using an expression',
							required:	true,
					},
					{
						displayName: 'Field Value (Billing Rate From)',
						name: 'fieldValueRateFrom',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'Inherit From Project',
								value: 1
							},
							{
								name: 'Inherit From Resource',
								value: 2
							},
							{
								name: 'Inherit From Role',
								value: 4
							},
							{
								name: 'Custom',
								value: 8
							},
						]
					},
					{
						displayName: 'Field Value (Billing Status)',
						name: 'fieldValueBillingStatus',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'Inherit From Project',
								value: 1
							},
							{
								name: 'Billable',
								value: 2
							},
							{
								name: 'Non Billable',
								value: 4
							},
					]
					},
					{
						displayName: 'Field Value (Boolean)',
						name: 'fieldValueBoolean',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Field Value (Custom Rate)',
						name: 'fieldValueRate',
						type: 'number',
						default: 0,
						description: 'Only used when Billing Rate From is set to Custom (8). Sent as	`rate`	in the request body.',
					},
					{
						displayName: 'Field Value (Date/Time)',
						name: 'fieldValueDate',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Field Value (ID)',
						name: 'fieldValueId',
						type: 'number',
						default: 0,
						description: 'Fill this for project/task (or role) when the API does not return a dropdown list',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
							noDataExpression:	true,
						default: [],
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs.',
					},
					{
						displayName: 'Field Value (Number)',
						name: 'fieldValueNumber',
						type: 'number',
						default: 0
					},
					{
						displayName: 'Field Value (Rich Text)',
						name: 'fieldValueRichText',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
							noDataExpression:	true,
						default: '',
						description: 'Fill for single-select dropdown fields when options are available',
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
						description: 'For Tags, enter comma-separated values',
					},
					{
						displayName: 'Field Value (Unit)',
						name: 'fieldValueUnit',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'Capacity	% (Default)',
								value: 1
							},
							{
								name: 'Total Booking Hours',
								value: 2
							},
							{
								name: 'Full Time Equivalent',
								value: 4
							},
					]
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
						default: '',
						description: 'Choose from the list, or specify a code using an expression',
							required:	true,
					},
					{
						displayName: 'Field Value (Billing Rate From)',
						name: 'fieldValueRateFrom',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'Inherit From Project',
								value: 1
							},
							{
								name: 'Inherit From Resource',
								value: 2
							},
							{
								name: 'Inherit From Role',
								value: 4
							},
							{
								name: 'Custom',
								value: 8
							},
						]
					},
					{
						displayName: 'Field Value (Billing Status)',
						name: 'fieldValueBillingStatus',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'Inherit From Project',
								value: 1
							},
							{
								name: 'Billable',
								value: 2
							},
							{
								name: 'Non Billable',
								value: 4
							},
					]
					},
					{
						displayName: 'Field Value (Boolean)',
						name: 'fieldValueBoolean',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Field Value (Custom Rate)',
						name: 'fieldValueRate',
						type: 'number',
						default: 0,
						description: 'Only used when Billing Rate From is set to Custom (8). Sent as	`rate`	in the request body.',
					},
					{
						displayName: 'Field Value (Date/Time)',
						name: 'fieldValueDate',
						type: 'dateTime',
						default: '',
					},
					{
						displayName: 'Field Value (ID)',
						name: 'fieldValueId',
						type: 'number',
						default: 0,
						description: 'Fill this for project/task (or role) when the API does not return a dropdown list',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
							noDataExpression:	true,
						default: [],
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs.',
					},
					{
						displayName: 'Field Value (Number)',
						name: 'fieldValueNumber',
						type: 'number',
						default: 0
					},
					{
						displayName: 'Field Value (Rich Text)',
						name: 'fieldValueRichText',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
							noDataExpression:	true,
						default: '',
						description: 'Fill for single-select dropdown fields when options are available',
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
						description: 'For Tags, enter comma-separated values',
					},
					{
						displayName: 'Field Value (Unit)',
						name: 'fieldValueUnit',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'Capacity	% (Default)',
								value: 1
							},
							{
								name: 'Total Booking Hours',
								value: 2
							},
							{
								name: 'Full Time Equivalent',
								value: 4
							},
					]
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

