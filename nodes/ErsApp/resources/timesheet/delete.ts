import type { INodeProperties } from 'n8n-workflow';

const showOnlyForTimesheetDelete = {
	operation: ['delete'],
	resource: ['timesheet'],
};

export const timesheetDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Timesheet Entry ID',
		name: 'timesheet_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForTimesheetDelete,
		},
		typeOptions: {
			minValue: 1,
		},
		default: '',
		description: 'Unique ID of the timesheet entry to delete',
	},
];

