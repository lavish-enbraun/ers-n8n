import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { timesheetCreateDescription } from './create';
import { timesheetUpdateDescription } from './update';
import { timesheetDeleteDescription } from './delete';
import { timesheetGetOneDescription } from './get';
import { timesheetSearchDescription } from './search';

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
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
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
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
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
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
					},
				},
			},
			{
				name: 'Get One',
				value: 'get',
				action: 'Get a timesheet entry',
				description: 'Retrieve a single timesheet entry by ID',
				routing: {
					request: {
						method: 'GET',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/timesheet/" + $parameter.timesheet_id }}`,
						headers: {
							Authorization: '={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search timesheet entries',
				description:
					'Search for timesheet entries using the flexible /v1/timesheet/search endpoint with a raw JSON filter body as documented in the eRS Cloud API (Search Timesheet Entries section).',
				routing: {
					request: {
						method: 'POST',
						url: `${BASE_URL}${API_BASE_PATH}/timesheet/search`,
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
							Authorization:
								'={{ $parameter.authentication === "accessToken" && $credentials.accessToken ? "Bearer " + $credentials.accessToken : undefined }}',
						},
						body: '={{ (() => { if (!$parameter.searchBodyJson) { throw new Error("Search Body cannot be empty"); } let body; if (typeof $parameter.searchBodyJson === "string") { try { body = JSON.parse($parameter.searchBodyJson); } catch (e) { throw new Error("Search Body must be valid JSON"); } } else { body = $parameter.searchBodyJson; } return body; })() }}',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'create',
	},
	...timesheetCreateDescription,
	...timesheetUpdateDescription,
	...timesheetDeleteDescription,
	...timesheetGetOneDescription,
	...timesheetSearchDescription,
];

