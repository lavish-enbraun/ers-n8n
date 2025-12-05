import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTimesheetUpdate = {
	operation: ['update'],
	resource: ['timesheet'],
};

export const timesheetUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Timesheet Entry ID',
		name: 'timesheet_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the timesheet entry to update',
	},
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		displayOptions: {
			show: showOnlyForTimesheetUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'ID of the resource',
		routing: {
			send: {
				property: 'resource_id',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		displayOptions: {
			show: showOnlyForTimesheetUpdate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'ID of the project',
		routing: {
			send: {
				property: 'project_id',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		displayOptions: {
			show: showOnlyForTimesheetUpdate,
		},
		typeOptions: {
			dateFormat: 'YYYY-MM-DD',
		},
		default: '',
		description: 'Date for the timesheet entry',
		routing: {
			send: {
				property: 'date',
				type: 'body',
				value: '={{ new Date($value).toISOString().split("T")[0] }}',
			},
		},
	},
	{
		displayName: 'Hours',
		name: 'hours',
		type: 'number',
		displayOptions: {
			show: showOnlyForTimesheetUpdate,
		},
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Number of hours for the timesheet entry',
		routing: {
			send: {
				property: 'hours',
				type: 'body',
			},
		},
	},
	{
		displayName: 'Comment',
		name: 'comment',
		type: 'string',
		displayOptions: {
			show: showOnlyForTimesheetUpdate,
		},
		typeOptions: {
			rows: 4,
		},
		default: '',
		description: 'Comment for the timesheet entry',
		routing: {
			send: {
				property: 'comment',
				type: 'body',
			},
		},
	},
];

