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
						typeOptions: {
							loadOptionsMethod: 'getProjectUDFFields',
							loadOptionsDependsOn: ['project_type_id'],
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
									{
										_cnd: {
											regex: '.*"field_type":"DATIM".*',
										},
									}
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
							loadOptionsMethod: 'getProjectUDFFieldOptions',
							loadOptionsDependsOn: ['fieldName'],
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
						description: 'Select multiple options from the dropdown. Selected values will be sent as an array of IDs. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
						description: 'Fill this for NUMBER, INTEGER, FLOAT, INT field types. INT allows max 9 digits (999,999,999).',
					},
					{
						displayName: 'Field Value (Select) Name or ID',
						name: 'fieldValueSelect',
						type: 'options',
						noDataExpression: true,
						typeOptions: {
							loadOptionsMethod: 'getProjectUDFFieldOptions',
							loadOptionsDependsOn: ['fieldName'],
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
									{
										_cnd: {
											regex: '.*"field_type":"CALSS".*',
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
						description:
							'Fill this for single-select dropdown fields (e.g. RTYPE, DDSS, RDGRP, LABL Label, CALSS Project Calendar). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>. Omit project calendar to keep or use the tenant default (Scheduling Plus).',
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
						description: 'Fill this for TEXT, EMAIL, ENAME, URL, COLPICK field types. For COLPICK use hex format #XXXXXX;1 or #XXXXXX;0 (1=white, 0=black foreground).',
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
						description:
							'Fill this for MLTEXT (Multi Line Rich Text) field types. Value is stored/sent as HTML (for example: <p>text</p>).',
					},
				],
			},
		],
	},
];

