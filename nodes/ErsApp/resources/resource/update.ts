import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceUpdate = {
	operation: ['update'],
	resource: ['resource'],
};

export const resourceUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Resource Type Name or ID',
		name: 'resource_type_id',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForResourceUpdate,
		},
		typeOptions: {
			loadOptionsMethod: 'getResourceTypes',
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForResourceUpdate,
		},
		default: '',
		placeholder: 'Enter Resource ID',
		description: 'Unique ID of the resource to update',
	},
	{
		displayName: 'Resource Name',
		name: 'first_name',
		type: 'string',
		displayOptions: {
			show: showOnlyForResourceUpdate,
		},
		default: '',
		description: 'Name of the resource (sent as "first_name" for human resources or "name" for non-human resources). Optional - only included in request if provided.',
	},
	{
		displayName: 'User Defined Fields',
		name: 'udfFields',
		type: 'fixedCollection',
		placeholder: 'Add UDF Field',
		displayOptions: {
			show: {
				...showOnlyForResourceUpdate,
				resource_type_id: [
					{
						_cnd: {
							regex: '.+', // Show when resource_type_id has any value
						},
					},
				],
			},
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Custom user-defined fields from eResource Scheduler. Fields are loaded dynamically by Resource Type; dropdown options are loaded on demand. After selecting a field, fill ONLY the value that matches the field type (Text, Number, Date, Boolean, Select, or Multi-Select).',
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
						description: 'Fill this for single-select dropdown fields (e.g. RTYPE, DDSS, RDGRP, LABL Label). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
