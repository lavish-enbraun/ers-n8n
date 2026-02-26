import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRequirementGet = {
	operation: ['get'],
	resource: ['requirement'],
};

export const requirementGetOneDescription: INodeProperties[] = [
	{
		displayName: 'Requirement ID',
		name: 'requirement_id',
		type: 'number',
		required: true,
		displayOptions: {
			show: showOnlyForRequirementGet,
		},
		typeOptions: {
			minValue: 1,
		},
		default: undefined,
		description: 'Unique ID of the requirement to retrieve',
	},
];

