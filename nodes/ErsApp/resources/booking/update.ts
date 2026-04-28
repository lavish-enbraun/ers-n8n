import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBookingUpdate = {
	operation: ['update'],
	resource: ['booking'],
};

export const bookingUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Booking ID',
		name: 'booking_id',
		type: 'string',
		required: true,
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		placeholder: 'Enter Booking ID',
		description: 'Unique ID of the booking to update',
	},
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'string',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		placeholder: 'Enter Resource ID',
		description: 'Unique ID of the resource',
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'string',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		placeholder: 'Enter Project ID',
		description: 'Unique ID of the project',
	},
	{
		displayName: 'Start Time',
		name: 'start_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		description: 'Start time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'End Time',
		name: 'end_time',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: '',
		description: 'End time of the booking (format: yyyy-MM-ddThh:mm:00, minutes will be rounded to 0, 15, 30, or 45)',
	},
	{
		displayName: 'Connected Bookings Fields',
		name: 'connectedBookingsFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: {
			update_connected_bookings: 4,
		},
		description: 'Optional settings for update behavior (query params)',
		options: [
			{
				displayName: 'Update Connected Bookings',
				name: 'update_connected_bookings',
				type: 'options',
				default: 4,
				description: 'How to handle recurring bookings when updating',
				options: [
					{
						name: 'All Related Bookings',
						value: 1,
						description: 'Update this booking and all its related bookings',
					},
					{
						name: 'Future Bookings Only',
						value: 2,
						description: 'Update this booking and all its future bookings',
					},
					{
						name: 'This Booking Only',
						value: 4,
						description: 'Update only this booking without changing related bookings',
					},
				],
				routing: {
					send: {
						type: 'query',
						property: 'update_connected_bookings',
					},
				},
			},
		],
	},
	{
		displayName: 'Additional Booking Fields',
		name: 'additionalBookingFields',
		type: 'fixedCollection',
		placeholder: 'Add Field',
		displayOptions: {
			show: showOnlyForBookingUpdate,
		},
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description:
			'Booking fields fetched dynamically from /booking/fields. After selecting a field, fill ONLY the appropriate value field that matches the field type.',
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
					},
					{
						displayName: 'Field Value (Multi-Select) Names or IDs',
						name: 'fieldValueMultiSelect',
						type: 'multiOptions',
							noDataExpression:	true,
						default: []
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
					},
					{
						displayName: 'Field Value (Text)',
						name: 'fieldValueText',
						type: 'string',
						default: '',
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