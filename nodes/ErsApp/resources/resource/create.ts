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
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		routing: {
			send: {
				property: 'resource_type_id',
				type: 'body',
				value: '={{ (() => { try { if (typeof $value === "string") { const parsed = JSON.parse($value); if (parsed && typeof parsed === "object" && "id" in parsed) { return parsed.id; } } } catch (e) { } return $value; })() }}',
			},
		},
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
		routing: {
			send: {
				property: '={{ (() => { try { if ($parameter.resource_type_id) { if (typeof $parameter.resource_type_id === "string") { const parsed = JSON.parse($parameter.resource_type_id); if (parsed && typeof parsed === "object" && "is_human" in parsed) { return parsed.is_human ? "first_name" : "name"; } } } } catch (e) { } return "first_name"; })() }}',
				type: 'body',
			},
		},
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
		routing: {
			send: {
				property: 'start_date',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForResourceCreate,
		},
		default: {},
		options: [
			{
				displayName: 'Calendar',
				name: 'calendar',
				type: 'number',
				placeholder: '',
				default: '',
				description: 'ID of Calendar to assign to resource',
				routing: {
					send: {
						property: 'calendar',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				routing: {
					send: {
						property: 'email',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Last Date',
				name: 'last_date',
				type: 'dateTime',
				default: '',
				description: 'Last working date of the resource (if applicable)',
				routing: {
					send: {
						property: 'last_date',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Last name of the resource',
				routing: {
					send: {
						property: 'last_name',
						type: 'body',
					},
				},
			},
			{
				displayName: 'Phone Number',
				name: 'phone',
				type: 'string',
				placeholder: '',
				default: '',
				routing: {
					send: {
						property: 'phone',
						type: 'body',
					},
				},
			},
		],
	},
	{
		displayName: 'User Defined Fields',
		name: 'udfFields',
		type: 'fixedCollection',
		placeholder: 'Add UDF Field',
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
		description: 'Custom user-defined fields from eResource Scheduler. Fields are fetched dynamically based on the selected Resource Type. After selecting a field, fill ONLY the appropriate value field that matches the field type (Text for TEXT/EMAIL/ENAME, Number for NUMBER/INTEGER, Date for DATE, Boolean for BOOLEAN/CHECKBOX, Select for dropdowns with options, Multi-Select for multi-select dropdowns).',
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
						displayName: 'Field Value (Multi-Select) Name or ID',
						name: 'fieldValueMultiSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getResourceUDFFieldOptions',
							multipleValues: true,
						},
						default: '',
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
						description: 'Fill this for multi-select dropdown fields. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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

