import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProjectUpdate = {
	operation: ['update'],
	resource: ['project'],
};

export const projectUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForProjectUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the project to update',
	},
	{
		displayName: 'Project Type Name or ID',
		name: 'project_type_id',
		type: 'options',
		displayOptions: {
			show: showOnlyForProjectUpdate,
		},
		typeOptions: {
			loadOptionsMethod: 'getProjectTypes',
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		displayOptions: {
			show: showOnlyForProjectUpdate,
		},
		default: '',
		description: 'Title of the project. Optional - only included in request if provided.',
	},
	{
		displayName: 'User Defined Fields',
		name: 'udfFields',
		type: 'fixedCollection',
		placeholder: 'Add UDF Field',
		displayOptions: {
			show: {
				...showOnlyForProjectUpdate,
				project_type_id: [
					{
						_cnd: {
							regex: '.+', // Show when project_type_id has any value
						},
					},
				],
			},
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Custom user-defined fields from eResource Scheduler. Fields are fetched dynamically based on the selected Project Type. After selecting a field, fill ONLY the appropriate value field that matches the field type (Text for TEXT/EMAIL/ENAME, Number for NUMBER/INTEGER, Date for DATE, Boolean for BOOLEAN/CHECKBOX, Select for dropdowns with options including CALSS project calendar when Scheduling Plus is on, Multi-Select for multi-select dropdowns).',
		options: [
			{
				displayName: 'Field',
				name: 'field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldName',
						type: 'options',
						default: '',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
							required:	true,
					},
					{
						displayName: 'Field Value (Boolean)',
						name: 'fieldValueBoolean',
						type: 'boolean',
						default: false,
						description: 'Whether to fill this for BOOLEAN, CHECKBOX field types',
					},
					{
						displayName: 'Field Value (Date)',
						name: 'fieldValueDate',
						type: 'dateTime',
						default: '',
						description: 'Fill this for DATE field types',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
							noDataExpression:	true,
						default: [	],
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Field Value (Number)',
						name: 'fieldValueNumber',
						type: 'number',
						default: 0,
						description: 'Fill this for NUMBER, INTEGER, FLOAT, INT field types. INT allows max 9 digits (999,999,999).',
					},
					{
						displayName: 'Field Value (Rich Text)',
						name: 'fieldValueRichText',
						type: 'string',
						default: '',
						description: 'Fill this for MLTEXT (Multi Line Rich Text) field types. Value is stored/sent as HTML (for example: <p>text</p>).',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
							noDataExpression:	true,
						default: '',
						description: 'Fill this for single-select dropdown fields (e.g. RTYPE, DDSS, RDGRP, LABL Label, CALSS Project Calendar). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Omit project calendar to keep or use the tenant default (Scheduling Plus).',
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
						description: 'Fill this for TEXT, EMAIL, ENAME, URL, COLPICK field types. For COLPICK use hex format	#XXXXXX;1 or	#XXXXXX;0 (1=white, 0=black foreground).',
					},
			],
			},
		],
	},
];

