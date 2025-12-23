import type { INodeProperties } from 'n8n-workflow';
import { BASE_URL, API_BASE_PATH } from '../../constants';
import { ratesCreateDescription } from './create';
import { ratesUpdateDescription } from './update';
import { ratesDeleteDescription } from './delete';

const showOnlyForRates = {
	resource: ['rates'],
};

export const ratesDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRates,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a rate',
				description: 'Create a new rate for a resource, project, or role',
				routing: {
					request: {
						method: 'POST',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/" + $parameter.entity_type + "/" + $parameter.entity_id + "/rates" }}`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ { ...($parameter.cost_rate !== undefined && $parameter.cost_rate !== null ? { cost_rate: $parameter.cost_rate } : {}), ...($parameter.billing_rate !== undefined && $parameter.billing_rate !== null ? { billing_rate: $parameter.billing_rate } : {}), effective_date: new Date($parameter.effective_date).toISOString().split("T")[0] } }}',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a rate',
				description: 'Update an existing rate for a resource, project, or role',
				routing: {
					request: {
						method: 'POST',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/" + $parameter.entity_type + "/" + $parameter.entity_id + "/rates" }}`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ { ...($parameter.cost_rate !== undefined && $parameter.cost_rate !== null ? { cost_rate: $parameter.cost_rate } : {}), ...($parameter.billing_rate !== undefined && $parameter.billing_rate !== null ? { billing_rate: $parameter.billing_rate } : {}), effective_date: new Date($parameter.effective_date).toISOString().split("T")[0], replace_existing_rate: true } }}',
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a rate',
				description: 'Delete a rate for a resource, project, or role',
				routing: {
					request: {
						method: 'DELETE',
						url: `={{ "${BASE_URL}${API_BASE_PATH}/" + $parameter.entity_type + "/" + $parameter.entity_id + "/rates/" + $parameter.rate_id }}`,
					},
				},
			},
		],
		default: 'create',
	},
	...ratesCreateDescription,
	...ratesUpdateDescription,
	...ratesDeleteDescription,
];

