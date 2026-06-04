import type { INodeProperties } from 'n8n-workflow';

const showOnlyForResourceCreate = {
	operation: ['create'],
	resource: ['resource'],
};

export const resourceCreateDescription: INodeProperties[] = [
	{
		displayName: 'Resource Type Name or ID',
		name: 'resource_type_id',
		type: 'options',
		required: true,
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		typeOptions: {
			loadOptionsMethod: 'getResourceTypes',
			loadOptionsDependsOn: ['authentication'],
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		hint: 'Select or specify the resource type.',
	},
	{
		displayName: 'Resource Name',
		name: 'first_name',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: '',
		description: 'First name of the resource',
	},
	{
		displayName: 'Start Date',
		name: 'start_date',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: '',
		description: 'Start date of the resource',
	},
	{
		displayName: 'Mandatory Fields',
		name: 'mandatoryFields',
		type: 'fixedCollection',
		placeholder: 'Add Mandatory Field',
		displayOptions: {
			show: {
				...showOnlyForResourceCreate,
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
		description: 'Required user-defined fields for the resource type',
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
							loadOptionsMethod: 'getResourceUDFFieldsMandatory',
							loadOptionsDependsOn: ['authentication', 'resource_type_id'],
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
						description: 'Whether the field value is true',
						hint: 'Enter true or false for Checkbox and Boolean field types.',
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
									{
										_cnd: {
											regex: '.*"field_type":"DATIM".*',
										},
									}
								],
							},
						},
						description: 'Enter a date or date-time value in ISO 8601 format',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							loadOptionsDependsOn: ['authentication', 'fieldName', 'resource_type_id'],
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
									{
										_cnd: {
											regex: '.*"field_type":"UMS".*',
										},
									},
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
						typeOptions: {
							maxValue: 999999999,
							minValue: -999999999,
						},
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
									{
										_cnd: {
											regex: '.*"field_type":"INT"[^E].*',
										},
									},
								],
							},
						},
						description: 'Enter a numeric value for this field',
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
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"MLTEXT".*',
										},
									},
								],
							},
						},
						description: 'Enter a text value for this field',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							loadOptionsDependsOn: ['authentication', 'fieldName', 'resource_type_id'],
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
									{
										_cnd: {
											regex: '.*"field_type":"RDGRP".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"LABL".*',
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
									{
										_cnd: {
											regex: '.*"field_type":"UMS".*',
										},
									},
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
								{
									_cnd: {
										regex: '.*"field_type":"URL".*',
									},
								},
								{
									_cnd: {
										regex: '.*"field_type":"COLPICK".*',
									},
								},
							],
						},
					},
					description:
						'Enter a text value for this field. For Tags, enter comma-separated values. For Color Picker, enter a hex color code in #XXXXXX;1/0 format.',
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
			show: {
				...showOnlyForResourceCreate,
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
		description: 'Optional user-defined fields for the resource type',
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
							loadOptionsMethod: 'getResourceUDFFieldsOther',
							loadOptionsDependsOn: ['authentication', 'resource_type_id'],
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
						description: 'Whether the field value is true',
						hint: 'Enter true or false for Checkbox and Boolean field types.',
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
									{
										_cnd: {
											regex: '.*"field_type":"DATIM".*',
										},
									}
								],
							},
						},
						description: 'Enter a date or date-time value in ISO 8601 format',
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							loadOptionsDependsOn: ['authentication', 'fieldName', 'resource_type_id'],
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
									{
										_cnd: {
											regex: '.*"field_type":"UMS".*',
										},
									},
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
						typeOptions: {
							maxValue: 999999999,
							minValue: -999999999,
						},
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
									{
										_cnd: {
											regex: '.*"field_type":"INT"[^E].*',
										},
									},
								],
							},
						},
						description: 'Enter a numeric value for this field',
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
								fieldName: [
									{
										_cnd: {
											regex: '.*"field_type":"MLTEXT".*',
										},
									},
								],
							},
						},
						description: 'Enter a text value for this field',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							searchable: true,
							loadOptionsDependsOn: ['authentication', 'fieldName', 'resource_type_id'],
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
									{
										_cnd: {
											regex: '.*"field_type":"RDGRP".*',
										},
									},
									{
										_cnd: {
											regex: '.*"field_type":"LABL".*',
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
									{
										_cnd: {
											regex: '.*"field_type":"UMS".*',
										},
									},
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
								{
									_cnd: {
										regex: '.*"field_type":"URL".*',
									},
								},
								{
									_cnd: {
										regex: '.*"field_type":"COLPICK".*',
									},
								},
							],
						},
					},
					description:
						'Enter a text value for this field. For Tags, enter comma-separated values. For Color Picker, enter a hex color code in #XXXXXX;1/0 format.',
				},
			],
		},
	],
},
];

