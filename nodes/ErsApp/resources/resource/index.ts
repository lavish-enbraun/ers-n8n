import type { INodeProperties } from 'n8n-workflow';
import { resourceGetManyDescription } from './getAll';
import { resourcePostManyDescription } from './postMany';
import { resourceCreateDescription } from './create';

const showOnlyForResources = {
	resource: ['resource'],
};

export const resourceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForResources,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get resources',
				description: 'Get many resources',
				routing: {
					request: {
						method: 'GET',
						url: `http://192.168.1.16:8080/rest/v1/resources`,
					},
				},
			},
			{
				name: 'POST Many',
				value: 'postMany',
				action: 'Post many resources',
				description: 'Post many resources',
				routing: {
					request: {
						method: 'POST',
						url: `http://192.168.1.16:8080/rest/v1/resources`,
						body: '={{ $json }}',
						headers: {
							'Content-Type': 'application/json',
						},
					},
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a resource',
				description: 'Create a new resource',
				routing: {
					request: {
						method: 'POST',
						url: `http://192.168.1.16:8080/rest/v1/resources`,
						headers: {
							'Content-Type': 'application/json',
						},
						body: '={{ { first_name: $parameter.first_name, start_date: $parameter.start_date ? new Date($parameter.start_date).toISOString().split("T")[0] : $parameter.start_date, resource_type_id: $parameter.resource_type_id, ...($parameter.last_name ? { last_name: $parameter.last_name } : {}), ...($parameter.last_date ? { last_date: new Date($parameter.last_date).toISOString().split("T")[0] } : {}), ...($parameter.additionalFields?.email ? { email: $parameter.additionalFields.email } : {}), ...($parameter.additionalFields?.phone ? { phone: $parameter.additionalFields.phone } : {}), ...($parameter.additionalFields?.calendar ? { calendar: $parameter.additionalFields.calendar } : {}) } }}',
					},
				},
			},
			
		],
		default: 'getAll',
	},
	...resourceGetManyDescription,
	...resourcePostManyDescription,
	...resourceCreateDescription,
];

