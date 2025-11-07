import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { exceptionCreateDescription } from './create';
import { exceptionUpdateDescription } from './update';
import { exceptionDeleteDescription } from './delete';
import { exceptionGetAllDescription } from './getAll';

const showOnlyForExceptions = {
	resource: ['exception'],
};

export const exceptionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForExceptions,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create an exception',
				description: 'Create a new exception',
				routing: {
					request: {
						method: 'POST',
						url: `={{ $parameter.entity_type === "project" ? "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.entity_id + "/exceptions" : "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.entity_id + "/exceptions" }}`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ (() => { const buildBody = () => { const body = { name: $parameter.name, date: $parameter.date ? new Date($parameter.date).toISOString().split("T")[0] : $parameter.date, is_working_exception: $parameter.is_working_exception }; if ($parameter.additionalFields?.description) body.description = $parameter.additionalFields.description; if ($parameter.additionalFields?.timing_blocks?.timing_block && Array.isArray($parameter.additionalFields.timing_blocks.timing_block) && $parameter.additionalFields.timing_blocks.timing_block.length > 0) { body.timing_blocks = $parameter.additionalFields.timing_blocks.timing_block.map(tb => ({ start_time: tb.start_time, end_time: tb.end_time })).filter(tb => tb.start_time !== undefined && tb.end_time !== undefined); } return body; }; return buildBody(); })() }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update an exception',
				description: 'Update an existing exception',
				routing: {
					request: {
						method: 'PUT',
						url: `={{ $parameter.entity_type === "project" ? "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.entity_id + "/exceptions/" + $parameter.exception_id : "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.entity_id + "/exceptions/" + $parameter.exception_id }}`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ (() => { const buildBody = () => { const body = {}; if ($parameter.additionalFields?.name !== undefined) body.name = $parameter.additionalFields.name; if ($parameter.additionalFields?.date) body.date = new Date($parameter.additionalFields.date).toISOString().split("T")[0]; if ($parameter.additionalFields?.is_working_exception !== undefined) body.is_working_exception = $parameter.additionalFields.is_working_exception; if ($parameter.additionalFields?.description !== undefined) body.description = $parameter.additionalFields.description; if ($parameter.additionalFields?.timing_blocks?.timing_block && Array.isArray($parameter.additionalFields.timing_blocks.timing_block) && $parameter.additionalFields.timing_blocks.timing_block.length > 0) { body.timing_blocks = $parameter.additionalFields.timing_blocks.timing_block.map(tb => ({ start_time: tb.start_time, end_time: tb.end_time })).filter(tb => tb.start_time !== undefined && tb.end_time !== undefined); } return body; }; return buildBody(); })() }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete an exception',
				description: 'Delete an exception',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ $parameter.entity_type === "project" ? "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.entity_id + "/exceptions/" + $parameter.exception_id : "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.entity_id + "/exceptions/" + $parameter.exception_id }}`,
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many exceptions',
				description: 'Retrieve a list of exceptions',
				routing: {
					request: {
						method: 'GET',
						url: `={{ $parameter.entity_type === "project" ? "${BASE_URL}${API_BASE_PATH}/projects/" + $parameter.entity_id + "/exceptions" : "${BASE_URL}${API_BASE_PATH}/resources/" + $parameter.entity_id + "/exceptions" }}`,
					},
				},
			},
		],
		default: 'create',
	},
	...exceptionCreateDescription,
	...exceptionUpdateDescription,
	...exceptionDeleteDescription,
	...exceptionGetAllDescription,
];

