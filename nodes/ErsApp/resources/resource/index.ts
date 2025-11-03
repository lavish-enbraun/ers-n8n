import type { INodeProperties } from 'n8n-workflow';
import { resourceGetManyDescription } from './getAll';
import { resourcePostManyDescription } from './postMany';

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
					},
				},
			},
			
		],
		default: 'getAll',
	},
	...resourceGetManyDescription,
	...resourcePostManyDescription,
];

