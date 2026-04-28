import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingCreate = {
	operation: ['create'],
	resource: ['booking'],
};

export const bookingCreateDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingCreate,
		},
		typeOptions: {
			minValue: 0,
		},
		default: undefined,
		description: 'Unique ID of the resource',
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForBookingCreate,
		},
		typeOptions: {
			minValue: 0,
		},
		default: undefined,
		description: 'Unique ID of the project',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForBookingCreate,
		},
		default: '',
		description: 'Start time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForBookingCreate,
		},
		default: '',
		description: 'End time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'Mandatory Fields',
		name: 'mandatoryFields',
		type: 'fixedCollection',
		placeholder: 'Add Mandatory Field',
		displayOptions: {
			show: showOnlyForBookingCreate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Mandatory fields from eResource Scheduler Booking. Fields are fetched dynamically from /booking/fields. After selecting a field, fill ONLY the appropriate value field that matches the field type (Text for TEXT/EMAIL/ENAME, Number for NUMBER/INTEGER/FLOAT/INT, Date/Time for DATIM/DATE, Boolean for BOOLEAN/CHK, Select for dropdowns with options, Multi-Select for multi-select dropdowns).',
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
						description: 'Choose from the list, or specify a code using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
						displayName: 'Field Value (Disable Parallel)',
						name: 'fieldValueDisableParallel',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'On Selected Resource',
								value: 1
							},
							{
								name: 'On Selected Project',
								value: 2
							},
							{
								name: 'On Selected Resource or Project',
								value: 3
							},
					]
					},
					{
						displayName: 'Field Value (ID)',
						name: 'fieldValueId',
						type: 'number',
						default: 0,
						description: 'Fill this when the field expects an ID and no options list is available',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
							noDataExpression:	true,
						default: [],
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
						description: 'Fill this for single-select dropdown fields. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
						description: 'Fill this for text-like field types. For Tags, enter comma-separated values.',
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
			show: showOnlyForBookingCreate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Other fields from eResource Scheduler Booking. Fields are fetched dynamically from /booking/fields. After selecting a field, fill ONLY the appropriate value field that matches the field type.',
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
						description: 'Choose from the list, or specify a code using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
						displayName: 'Field Value (Disable Parallel)',
						name: 'fieldValueDisableParallel',
						type: 'options',
						default: 1,
						options: [
							{
								name: 'On Selected Resource',
								value: 1
							},
							{
								name: 'On Selected Project',
								value: 2
							},
							{
								name: 'On Selected Resource or Project',
								value: 3
							},
					]
					},
					{
						displayName: 'Field Value (ID)',
						name: 'fieldValueId',
						type: 'number',
						default: 0,
						description: 'Fill this when the field expects an ID and no options list is available',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
							noDataExpression:	true,
						default: [],
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
						description: 'Fill this for single-select dropdown fields. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
						description: 'Fill this for text-like field types. For Tags, enter comma-separated values.',
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
];