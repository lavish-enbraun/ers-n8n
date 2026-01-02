import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTimesheetCreate = {
	operation: ['create'],
	resource: ['timesheet'],
};

export const timesheetCreateDescription: INodeProperties[] = [
	{
		displayName: 'Resource ID',
		name: 'resource_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'ID of the resource',
	},
	{
		displayName: 'Project ID',
		name: 'project_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetCreate,
		},
		typeOptions: {
			minValue: 1,
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

