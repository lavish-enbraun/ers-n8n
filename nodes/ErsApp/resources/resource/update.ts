import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceUpdate = {
	operation: ['update'],
	resource: ['resource'],
};

export const resourceUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForResourceUpdate,
		},
		typeOptions: {
			minValue: 0,
		},
		default: '',
		description: 'Unique ID of the resource to update',
	},
	{
		displayName: 'Resource Type Name or ID',
		name: 'resource_type_id',
		type: 'options',
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
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFields',
							loadOptionsDependsOn: ['resource_type_id'],
						},
						default: '',
						description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
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
									{
										_cnd: {
											regex: '.*"field_type":"CHK".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"BOOLEAN".*',
										},
									},
								],
							},
						},
						description: 'Whether to fill this for BOOLEAN, CHECKBOX field types',
					},
					{
						displayName: 'Field Value (Date)',
						name: 'fieldValueDate',
						type: 'dateTime',
						default: '',
						displayOptions: {
							show: {
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"DATE".*',
										},
									},
								],
							},
						},
						description: 'Fill this for DATE field types',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							loadOptionsDependsOn: ['fieldName', 'resource_type_id'],
							searchable: true,
						},
						default: [],
						displayOptions: {
							show: {
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"DDMS".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"ROLES".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"CHGRP".*',
										},
									},
								],
							},
						},
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Field Value (Number)',
						name: 'fieldValueNumber',
						type: 'number',
						default: 0,
						displayOptions: {
							show: {
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"NUMBER".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"INTEGER".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"FLOAT".*',
										},
									},
								],
							},
						},
						description: 'Fill this for NUMBER, INTEGER, FLOAT field types',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							loadOptionsDependsOn: ['fieldName', 'resource_type_id'],
							searchable: true,
						},
						default: '',
						displayOptions: {
							show: {
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"RTYPE".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"DDSS".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"ROLESS".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"USS".*',
										},
									},
								],
							},
							hide: {
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"DDMS".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"ROLES".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"CHGRP".*',
										},
									},
								],
							},
						},
						description: 'Fill this for single-select dropdown fields. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
						displayOptions: {
							show: {
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"TEXT".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"EMAIL".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"ENAME".*',
										},
									},
								],
							},
						},
						description: 'Fill this for TEXT, EMAIL, ENAME field types',
					},
				],
			},
		],
	},
];

