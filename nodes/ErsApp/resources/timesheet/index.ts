import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { timesheetCreateDescription } from './create';
import { timesheetUpdateDescription } from './update';
import { timesheetDeleteDescription } from './delete';

const showOnlyForTimesheet = {
	resource: ['timesheet'],
};

export const timesheetDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForTimesheet,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a timesheet entry',
				description: 'Create a new timesheet entry',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/timesheet`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: '={{ { resource_id: $parameter.resource_id, project_id: $parameter.project_id, date: new Date($parameter.date).toISOString().split("T")[0], ...($parameter.hours !== undefined && $parameter.hours !== null ? { hours: $parameter.hours } : {}), ...($parameter.comment ? { comment: $parameter.comment } : {}) } }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a timesheet entry',
				description: 'Update an existing timesheet entry',
				routing: {
					request: {
						method: 'PUT',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/timesheet/" + $parameter.timesheet_id }}`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: '={{ { ...($parameter.resource_id !== undefined && $parameter.resource_id !== null ? { resource_id: $parameter.resource_id } : {}), ...($parameter.project_id !== undefined && $parameter.project_id !== null ? { project_id: $parameter.project_id } : {}), ...($parameter.date ? { date: new Date($parameter.date).toISOString().split("T")[0] } : {}), ...($parameter.hours !== undefined && $parameter.hours !== null ? { hours: $parameter.hours } : {}), ...($parameter.comment ? { comment: $parameter.comment } : {}) } }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a timesheet entry',
				description: 'Delete a timesheet entry',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/timesheet/" + $parameter.timesheet_id }}`,
					},
				},
			},
		],
		default: 'create',
	},
	...timesheetCreateDescription,
	...timesheetUpdateDescription,
	...timesheetDeleteDescription,
];

