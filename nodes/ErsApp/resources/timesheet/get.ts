import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTimesheetGet = {
	operation: ['get'],
	resource: ['timesheet'],
};

export const timesheetGetOneDescription: INodeProperties[] = [
	{
		displayName: 'Timesheet Entry ID',
		name: 'timesheet_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetGet,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the timesheet entry to retrieve',
	},
];

