import { OptionsWithUri } from 'request';

import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	ICredentialsDecrypted,
	ICredentialTestFunctions,
	IDataObject,
	INodeCredentialTestResult,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	getFileSha,
	githubApiRequest,
	githubApiRequestAllItems,
} from './GenericFunctions';

import {
	snakeCase,
} from 'change-case';

export class Github implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GitHub',
		name: 'github',
		icon: 'file:github.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume GitHub API',
		defaults: {
			name: 'GitHub',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'githubApi',
				required: true,
				testedBy: 'githubApiTest',
				displayOptions: {
					show: {
						authentication: [
							'accessToken',
						],
					},
				},
			},
			{
				name: 'githubOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: [
							'oAuth2',
						],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'accessToken',
				description: 'The resource to operate on.',
			},
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Issue',
						value: 'issue',
					},
					{
						name: 'Repository',
						value: 'repository',
					},
					{
						name: 'Release',
						value: 'release',
					},
					{
						name: 'Review',
						value: 'review',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'issue',
				description: 'The resource to operate on.',
			},



			// ----------------------------------
			//         operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'issue',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new issue.',
					},
					{
						name: 'Create Comment',
						value: 'createComment',
						description: 'Create a new comment on an issue.',
					},
					{
						name: 'Edit',
						value: 'edit',
						description: 'Edit an issue.',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get the data of a single issue.',
					},
					{
						name: 'Lock',
						value: 'lock',
						description: 'Lock an issue.',
					},
				],
				default: 'create',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'file',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new file in repository.',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a file in repository.',
					},
					{
						name: 'Edit',
						value: 'edit',
						description: 'Edit a file in repository.',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get the data of a single file.',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List contents of a folder.',
					},
				],
				default: 'create',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'repository',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get the data of a single repository.',
					},
					{
						name: 'Get License',
						value: 'getLicense',
						description: 'Returns the contents of the repository\'s license file, if one is detected.',
					},
					{
						name: 'Get Issues',
						value: 'getIssues',
						description: 'Returns issues of a repository.',
					},
					{
						name: 'Get Profile',
						value: 'getProfile',
						description: 'Get the community profile of a repository with metrics, health score, description, license, etc.',
					},
					{
						name: 'List Popular Paths',
						value: 'listPopularPaths',
						description: 'Get the top 10 popular content paths over the last 14 days.',
					},
					{
						name: 'List Referrers',
						value: 'listReferrers',
						description: 'Get the top 10 referrering domains over the last 14 days.',
					},
				],
				default: 'getIssues',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'user',
						],
					},
				},
				options: [
					{
						name: 'Get Repositories',
						value: 'getRepositories',
						description: 'Returns the repositories of a user.',
					},
					{
						name: 'Invite',
						value: 'invite',
						description: 'Invites a user to an organization.',
					},
				],
				default: 'getRepositories',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'release',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Creates a new release.',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a release.',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all repository releases.',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a release.',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a release.',
					},
				],
				default: 'create',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'review',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Creates a new review.',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a review for a pull request.',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all reviews for a pull request.',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a review.',
					},
				],
				default: 'create',
				description: 'The operation to perform.',
			},

			// ----------------------------------
			//         shared
			// ----------------------------------
			{
				displayName: 'Repository Owner',
				name: 'owner',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						operation: [
							'invite',
						],
					},
				},
				placeholder: 'n8n-io',
				description: 'Owner of the repository.',
			},
			{
				displayName: 'Repository Name',
				name: 'repository',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						resource: [
							'user',
						],
						operation: [
							'getRepositories',
						],
					},
				},
				placeholder: 'n8n',
				description: 'The name of the repository.',
			},



			// ----------------------------------
			//         file
			// ----------------------------------

			// ----------------------------------
			//         file:create/delete/edit/get
			// ----------------------------------
			{
				displayName: 'File Path',
				name: 'filePath',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'file',
						],
					},
					hide: {
						operation: [
							'list',
						],
					},
				},
				placeholder: 'docs/README.md',
				description: 'The file path of the file. Has to contain the full path.',
			},

			// ----------------------------------
			//         file:list
			// ----------------------------------
			{
				displayName: 'Path',
				name: 'filePath',
				type: 'string',
				default: '',
				required: false,
				displayOptions: {
					show: {
						resource: [
							'file',
						],
						operation: [
							'list',
						],
					},
				},
				placeholder: 'docs/',
				description: 'The path of the folder to list.',
			},

			// ----------------------------------
			//         file:create/edit
			// ----------------------------------
			{
				displayName: 'Binary Data',
				name: 'binaryData',
				type: 'boolean',
				default: false,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create',
							'edit',
						],
						resource: [
							'file',
						],
					},
				},
				description: 'If the data to upload should be taken from binary field.',
			},
			{
				displayName: 'File Content',
				name: 'fileContent',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						binaryData: [
							false,
						],
						operation: [
							'create',
							'edit',
						],
						resource: [
							'file',
						],
					},

				},
				placeholder: '',
				description: 'The text content of the file.',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						binaryData: [
							true,
						],
						operation: [
							'create',
							'edit',
						],
						resource: [
							'file',
						],
					},

				},
				placeholder: '',
				description: 'Name of the binary property which contains the data for the file.',
			},
			{
				displayName: 'Commit Message',
				name: 'commitMessage',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create',
							'delete',
							'edit',
						],
						resource: [
							'file',
						],
					},
				},
				description: 'The commit message.',
			},
			{
				displayName: 'Additional Parameters',
				name: 'additionalParameters',
				placeholder: 'Add Parameter',
				description: 'Additional fields to add.',
				type: 'fixedCollection',
				default: {},
				displayOptions: {
					show: {
						operation: [
							'create',
							'delete',
							'edit',
						],
						resource: [
							'file',
						],
					},
				},
				options: [
					{
						name: 'author',
						displayName: 'Author',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'The name of the author of the commit.',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								description: 'The email of the author of the commit.',
							},
						],
					},
					{
						name: 'branch',
						displayName: 'Branch',
						values: [
							{
								displayName: 'Branch',
								name: 'branch',
								type: 'string',
								default: '',
								description: 'The branch to commit to. If not set the repository’s default branch (usually master) is used.',
							},
						],
					},
					{
						name: 'committer',
						displayName: 'Committer',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'The name of the committer of the commit.',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								description: 'The email of the committer of the commit.',
							},
						],
					},
				],
			},

			// ----------------------------------
			//         file:get
			// ----------------------------------
			{
				displayName: 'As Binary Property',
				name: 'asBinaryProperty',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: [
							'get',
						],
						resource: [
							'file',
						],
					},
				},
				description: 'If set it will set the data of the file as binary property instead of returning the raw API response.',
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						asBinaryProperty: [
							true,
						],
						operation: [
							'get',
						],
						resource: [
							'file',
						],
					},

				},
				placeholder: '',
				description: 'Name of the binary property in which to save the binary data of the received file.',
			},



			// ----------------------------------
			//         issue
			// ----------------------------------

			// ----------------------------------
			//         issue:create
			// ----------------------------------
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'issue',
						],
					},
				},
				description: 'The title of the issue.',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '',
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'issue',
						],
					},
				},
				description: 'The body of the issue.',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'collection',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Label',
				},
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'issue',
						],
					},
				},
				default: { 'label': '' },
				options: [
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						description: 'Label to add to issue.',
					},
				],
			},
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'collection',
				typeOptions: {
					multipleValues: true,
					multipleValueButtonText: 'Add Assignee',
				},
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'issue',
						],
					},
				},
				default: { 'assignee': '' },
				options: [
					{
						displayName: 'Assignee',
						name: 'assignee',
						type: 'string',
						default: '',
						description: 'User to assign issue too.',
					},
				],
			},

			// ----------------------------------
			//         issue:createComment
			// ----------------------------------
			{
				displayName: 'Issue Number',
				name: 'issueNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'createComment',
						],
						resource: [
							'issue',
						],
					},
				},
				description: 'The number of the issue on which to create the comment on.',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				displayOptions: {
					show: {
						operation: [
							'createComment',
						],
						resource: [
							'issue',
						],
					},
				},
				default: '',
				description: 'The body of the comment.',
			},

			// ----------------------------------
			//         issue:edit
			// ----------------------------------
			{
				displayName: 'Issue Number',
				name: 'issueNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'edit',
						],
						resource: [
							'issue',
						],
					},
				},
				description: 'The number of the issue edit.',
			},
			{
				displayName: 'Edit Fields',
				name: 'editFields',
				type: 'collection',
				typeOptions: {
					multipleValueButtonText: 'Add Field',
				},
				displayOptions: {
					show: {
						operation: [
							'edit',
						],
						resource: [
							'issue',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'The title of the issue.',
					},
					{
						displayName: 'Body',
						name: 'body',
						type: 'string',
						typeOptions: {
							rows: 5,
						},
						default: '',
						description: 'The body of the issue.',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'options',
						options: [
							{
								name: 'Closed',
								value: 'closed',
								description: 'Set the state to "closed".',
							},
							{
								name: 'Open',
								value: 'open',
								description: 'Set the state to "open".',
							},
						],
						default: 'open',
						description: 'The state to set.',
					},
					{
						displayName: 'Labels',
						name: 'labels',
						type: 'collection',
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Label',
						},
						default: { 'label': '' },
						options: [
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'Label to add to issue.',
							},
						],
					},
					{
						displayName: 'Assignees',
						name: 'assignees',
						type: 'collection',
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Assignee',
						},
						default: { 'assignee': '' },
						options: [
							{
								displayName: 'Assignees',
								name: 'assignee',
								type: 'string',
								default: '',
								description: 'User to assign issue to.',
							},
						],
					},
				],
			},

			// ----------------------------------
			//         issue:get
			// ----------------------------------
			{
				displayName: 'Issue Number',
				name: 'issueNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get',
						],
						resource: [
							'issue',
						],
					},
				},
				description: 'The number of the issue get data of.',
			},

			// ----------------------------------
			//         issue:lock
			// ----------------------------------
			{
				displayName: 'Issue Number',
				name: 'issueNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'lock',
						],
						resource: [
							'issue',
						],
					},
				},
				description: 'The number of the issue to lock.',
			},
			{
				displayName: 'Lock Reason',
				name: 'lockReason',
				type: 'options',
				displayOptions: {
					show: {
						operation: [
							'lock',
						],
						resource: [
							'issue',
						],
					},
				},
				options: [
					{
						name: 'Off-Topic',
						value: 'off-topic',
						description: 'The issue is Off-Topic',
					},
					{
						name: 'Too Heated',
						value: 'too heated',
						description: 'The discussion is too heated',
					},
					{
						name: 'Resolved',
						value: 'resolved',
						description: 'The issue got resolved',
					},
					{
						name: 'Spam',
						value: 'spam',
						description: 'The issue is spam',
					},
				],
				default: 'resolved',
				description: 'The reason to lock the issue.',
			},



			// ----------------------------------
			//         release
			// ----------------------------------

			// ----------------------------------
			//         release:create
			// ----------------------------------
			{
				displayName: 'Tag',
				name: 'releaseTag',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'release',
						],
					},
				},
				description: 'The tag of the release.',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				typeOptions: {
					multipleValueButtonText: 'Add Field',
				},
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'release',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The name of the issue.',
					},
					{
						displayName: 'Body',
						name: 'body',
						type: 'string',
						typeOptions: {
							rows: 5,
						},
						default: '',
						description: 'The body of the release.',
					},
					{
						displayName: 'Draft',
						name: 'draft',
						type: 'boolean',
						default: false,
						description: 'Set "true" to create a draft (unpublished) release, "false" to create a published one.',
					},
					{
						displayName: 'Prerelease',
						name: 'prerelease',
						type: 'boolean',
						default: false,
						description: 'If set to "true" it will point out that the release is non-production ready.',
					},
					{
						displayName: 'Target Commitish',
						name: 'target_commitish',
						type: 'string',
						default: '',
						description: 'Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default: the repository\'s default branch(usually master).',
					},
				],
			},

			// ----------------------------------
			//         release:get/delete/update
			// ----------------------------------
			{
				displayName: 'Release ID',
				name: 'release_id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: [
							'release',
						],
						operation: [
							'get',
							'delete',
							'update',
						],
					},
				},
				description: 'The release ID.',
			},

			// ----------------------------------
			//         release:update
			// ----------------------------------
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				typeOptions: {
					multipleValueButtonText: 'Add Field',
				},
				displayOptions: {
					show: {
						operation: [
							'update',
						],
						resource: [
							'release',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Body',
						name: 'body',
						type: 'string',
						typeOptions: {
							rows: 5,
						},
						default: '',
						description: 'The body of the release.',
					},
					{
						displayName: 'Draft',
						name: 'draft',
						type: 'boolean',
						default: false,
						description: 'Set "true" to create a draft (unpublished) release, "false" to create a published one.',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'The name of the release.',
					},
					{
						displayName: 'Prerelease',
						name: 'prerelease',
						type: 'boolean',
						default: false,
						description: 'If set to "true" it will point out that the release is non-production ready.',
					},
					{
						displayName: 'Tag Name',
						name: 'tag_name',
						type: 'string',
						default: '',
						description: 'The name of the tag.',
					},
					{
						displayName: 'Target Commitish',
						name: 'target_commitish',
						type: 'string',
						default: '',
						description: 'Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default: the repository\'s default branch(usually master).',
					},
				],
			},
			// ----------------------------------
			//         release:getAll
			// ----------------------------------
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'release',
						],
						operation: [
							'getAll',
						],
					},
				},
				default: false,
				description: 'If all results should be returned or only up to a given limit.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: [
							'release',
						],
						operation: [
							'getAll',
						],
						returnAll: [
							false,
						],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'How many results to return.',
			},


			// ----------------------------------
			//         repository
			// ----------------------------------

			// ----------------------------------
			//         repository:getIssues
			// ----------------------------------
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'repository',
						],
						operation: [
							'getIssues',
						],
					},
				},
				default: false,
				description: 'If all results should be returned or only up to a given limit.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: [
							'repository',
						],
						operation: [
							'getIssues',
						],
						returnAll: [
							false,
						],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'How many results to return.',
			},
			{
				displayName: 'Filters',
				name: 'getRepositoryIssuesFilters',
				type: 'collection',
				typeOptions: {
					multipleValueButtonText: 'Add Filter',
				},
				displayOptions: {
					show: {
						operation: [
							'getIssues',
						],
						resource: [
							'repository',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Assignee',
						name: 'assignee',
						type: 'string',
						default: '',
						description: 'Return only issues which are assigned to a specific user.',
					},
					{
						displayName: 'Creator',
						name: 'creator',
						type: 'string',
						default: '',
						description: 'Return only issues which were created by a specific user.',
					},
					{
						displayName: 'Mentioned',
						name: 'mentioned',
						type: 'string',
						default: '',
						description: 'Return only issues in which a specific user was mentioned.',
					},
					{
						displayName: 'Labels',
						name: 'labels',
						type: 'string',
						default: '',
						description: 'Return only issues with the given labels. Multiple lables can be separated by comma.',
					},
					{
						displayName: 'Updated Since',
						name: 'since',
						type: 'dateTime',
						default: '',
						description: 'Return only issues updated at or after this time.',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'options',
						options: [
							{
								name: 'All',
								value: 'all',
								description: 'Returns issues with any state.',
							},
							{
								name: 'Closed',
								value: 'closed',
								description: 'Return issues with "closed" state.',
							},
							{
								name: 'Open',
								value: 'open',
								description: 'Return issues with "open" state.',
							},
						],
						default: 'open',
						description: 'The state to set.',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'options',
						options: [
							{
								name: 'Created',
								value: 'created',
								description: 'Sort by created date.',
							},
							{
								name: 'Updated',
								value: 'updated',
								description: 'Sort by updated date.',
							},
							{
								name: 'Comments',
								value: 'comments',
								description: 'Sort by comments.',
							},
						],
						default: 'created',
						description: 'The order the issues should be returned in.',
					},
					{
						displayName: 'Direction',
						name: 'direction',
						type: 'options',
						options: [
							{
								name: 'Ascending',
								value: 'asc',
								description: 'Sort in ascending order.',
							},
							{
								name: 'Descending',
								value: 'desc',
								description: 'Sort in descending order.',
							},
						],
						default: 'desc',
						description: 'The sort order.',
					},

				],
			},


			// ----------------------------------
			//         rerview
			// ----------------------------------
			// ----------------------------------
			//         review:getAll
			// ----------------------------------
			{
				displayName: 'PR Number',
				name: 'pullRequestNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get',
							'update',
						],
						resource: [
							'review',
						],
					},
				},
				description: 'The number of the pull request.',
			},
			{
				displayName: 'Review ID',
				name: 'reviewId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'get',
							'update',
						],
						resource: [
							'review',
						],
					},
				},
				description: 'ID of the review.',
			},

			// ----------------------------------
			//         review:getAll
			// ----------------------------------
			{
				displayName: 'PR Number',
				name: 'pullRequestNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getAll',
						],
						resource: [
							'review',
						],
					},
				},
				description: 'The number of the pull request.',
			},
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'review',
						],
						operation: [
							'getAll',
						],
					},
				},
				default: false,
				description: 'If all results should be returned or only up to a given limit.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: [
							'review',
						],
						operation: [
							'getAll',
						],
						returnAll: [
							false,
						],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'How many results to return.',
			},
			// ----------------------------------
			//         review:create
			// ----------------------------------
			{
				displayName: 'PR Number',
				name: 'pullRequestNumber',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'review',
						],
					},
				},
				description: 'The number of the pull request to review.',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'review',
						],
					},
				},
				options: [
					{
						name: 'Approve',
						value: 'approve',
						description: 'Approve the pull request.',
					},
					{
						name: 'Request Change',
						value: 'requestChanges',
						description: 'Request code changes.',
					},
					{
						name: 'Comment',
						value: 'comment',
						description: 'Add a comment without approval or change requests.',
					},
					{
						name: 'Pending',
						value: 'pending',
						description: 'You will need to submit the pull request review when you are ready.',
					},
				],
				default: 'approve',
				description: 'The review action you want to perform.',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'review',
						],
						event: [
							'requestChanges',
							'comment',
						],
					},
				},
				default: '',
				description: 'The body of the review (required for events Request Changes or Comment).',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				placeholder: 'Add Field',
				description: 'Additional fields.',
				type: 'collection',
				default: {},
				displayOptions: {
					show: {
						operation: [
							'create',
						],
						resource: [
							'review',
						],
					},
				},
				options: [
					{
						displayName: 'Commit ID',
						name: 'commitId',
						type: 'string',
						default: '',
						description: 'The SHA of the commit that needs a review, if different from the latest.',
					},
				],
			},
			// ----------------------------------
			//         review:update
			// ----------------------------------
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				displayOptions: {
					show: {
						operation: [
							'update',
						],
						resource: [
							'review',
						],
					},
				},
				default: '',
				description: 'The body of the review',
			},
			// ----------------------------------
			//       user:getRepositories
			// ----------------------------------
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: [
							'user',
						],
						operation: [
							'getRepositories',
						],
					},
				},
				default: false,
				description: 'If all results should be returned or only up to a given limit.',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: [
							'user',
						],
						operation: [
							'getRepositories',
						],
						returnAll: [
							false,
						],
					},
				},
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'How many results to return.',
			},
			// ----------------------------------
			//         user:invite
			// ----------------------------------
			{
				displayName: 'Organization',
				name: 'organization',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'invite',
						],
						resource: [
							'user',
						],
					},
				},
				description: 'The GitHub organization that the user is being invited to.',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'invite',
						],
						resource: [
							'user',
						],
					},
				},
				description: 'The email address of the invited user.',
			},
		],
	};

	methods = {
		credentialTest: {
			async githubApiTest(this: ICredentialTestFunctions, credential: ICredentialsDecrypted): Promise<INodeCredentialTestResult> {
				const credentials = credential.data;
				const baseUrl = credentials!.server as string || 'https://api.github.com/user';

				const options: OptionsWithUri = {
					method: 'GET',
					headers: {
						'User-Agent': 'n8n',
						Authorization: `token ${credentials!.accessToken}`,
					},
					uri: baseUrl,
					json: true,
					timeout: 5000,
				};
				try {
					const response = await this.helpers.request(options);
					if (!response.id) {
						return {
							status: 'Error',
							message: `Token is not valid: ${response.error}`,
						};
					}
				} catch (error) {
					return {
						status: 'Error',
						message: `Settings are not valid: ${error}`,
					};
				}
				return {
					status: 'OK',
					message: 'Authentication successful!',
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		let returnAll = false;

		let responseData;

		// Operations which overwrite the returned data
		const overwriteDataOperations = [
			'file:create',
			'file:delete',
			'file:edit',
			'file:get',
			'issue:create',
			'issue:createComment',
			'issue:edit',
			'issue:get',
			'release:create',
			'release:delete',
			'release:get',
			'release:update',
			'repository:get',
			'repository:getLicense',
			'repository:getProfile',
			'review:create',
			'review:get',
			'review:update',
			'user:invite',
		];
		// Operations which overwrite the returned data and return arrays
		// and has so to be merged with the data of other items
		const overwriteDataOperationsArray = [
			'file:list',
			'repository:getIssues',
			'repository:listPopularPaths',
			'repository:listReferrers',
			'user:getRepositories',
			'release:getAll',
			'review:getAll',
		];


		// For Post
		let body: IDataObject;
		// For Query string
		let qs: IDataObject;

		let requestMethod: string;
		let endpoint: string;

		const operation = this.getNodeParameter('operation', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;
		const fullOperation = `${resource}:${operation}`;

		for (let i = 0; i < items.length; i++) {
			try {
				// Reset all values
				requestMethod = 'GET';
				endpoint = '';
				body = {};
				qs = {};

				let owner = '';
				if (fullOperation !== 'user:invite') {
					// Request the parameters which almost all operations need
					owner = this.getNodeParameter('owner', i) as string;
				}

				let repository = '';
				if (fullOperation !== 'user:getRepositories' && fullOperation !== 'user:invite') {
					repository = this.getNodeParameter('repository', i) as string;
				}

				if (resource === 'file') {
					if (['create', 'edit'].includes(operation)) {
						// ----------------------------------
						//         create/edit
						// ----------------------------------

						requestMethod = 'PUT';

						const filePath = this.getNodeParameter('filePath', i) as string;

						const additionalParameters = this.getNodeParameter('additionalParameters', i, {}) as IDataObject;
						if (additionalParameters.author) {
							body.author = additionalParameters.author;
						}
						if (additionalParameters.committer) {
							body.committer = additionalParameters.committer;
						}
						if (additionalParameters.branch && (additionalParameters.branch as IDataObject).branch) {
							body.branch = (additionalParameters.branch as IDataObject).branch;
						}

						if (operation === 'edit') {
							// If the file should be updated the request has to contain the SHA
							// of the file which gets replaced.
							body.sha = await getFileSha.call(this, owner, repository, filePath, body.branch as string | undefined);
						}

						body.message = this.getNodeParameter('commitMessage', i) as string;

						if (this.getNodeParameter('binaryData', i) === true) {
							// Is binary file to upload
							const item = items[i];

							if (item.binary === undefined) {
								throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
							}

							const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

							if (item.binary[binaryPropertyName] === undefined) {
								throw new NodeOperationError(this.getNode(), `No binary data property "${binaryPropertyName}" does not exists on item!`);
							}

							// Currently internally n8n uses base64 and also Github expects it base64 encoded.
							// If that ever changes the data has to get converted here.
							body.content = item.binary[binaryPropertyName].data;
						} else {
							// Is text file
							// body.content = Buffer.from(this.getNodeParameter('fileContent', i) as string, 'base64');
							body.content = Buffer.from(this.getNodeParameter('fileContent', i) as string).toString('base64');
						}

						endpoint = `/repos/${owner}/${repository}/contents/${encodeURI(filePath)}`;
					} else if (operation === 'delete') {
						// ----------------------------------
						//         delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const additionalParameters = this.getNodeParameter('additionalParameters', i, {}) as IDataObject;
						if (additionalParameters.author) {
							body.author = additionalParameters.author;
						}
						if (additionalParameters.committer) {
							body.committer = additionalParameters.committer;
						}
						if (additionalParameters.branch && (additionalParameters.branch as IDataObject).branch) {
							body.branch = (additionalParameters.branch as IDataObject).branch;
						}

						const filePath = this.getNodeParameter('filePath', i) as string;
						body.message = this.getNodeParameter('commitMessage', i) as string;

						body.sha = await getFileSha.call(this, owner, repository, filePath, body.branch as string | undefined);

						endpoint = `/repos/${owner}/${repository}/contents/${encodeURI(filePath)}`;
					} else if (operation === 'get' || operation === 'list') {
						requestMethod = 'GET';

						const filePath = this.getNodeParameter('filePath', i) as string;

						endpoint = `/repos/${owner}/${repository}/contents/${encodeURI(filePath)}`;
					}
				} else if (resource === 'issue') {
					if (operation === 'create') {
						// ----------------------------------
						//         create
						// ----------------------------------

						requestMethod = 'POST';

						body.title = this.getNodeParameter('title', i) as string;
						body.body = this.getNodeParameter('body', i) as string;
						const labels = this.getNodeParameter('labels', i) as IDataObject[];

						const assignees = this.getNodeParameter('assignees', i) as IDataObject[];

						body.labels = labels.map((data) => data['label']);
						body.assignees = assignees.map((data) => data['assignee']);

						endpoint = `/repos/${owner}/${repository}/issues`;
					} else if (operation === 'createComment') {
						// ----------------------------------
						//         createComment
						// ----------------------------------
						requestMethod = 'POST';

						const issueNumber = this.getNodeParameter('issueNumber', i) as string;

						body.body = this.getNodeParameter('body', i) as string;

						endpoint = `/repos/${owner}/${repository}/issues/${issueNumber}/comments`;
					} else if (operation === 'edit') {
						// ----------------------------------
						//         edit
						// ----------------------------------

						requestMethod = 'PATCH';

						const issueNumber = this.getNodeParameter('issueNumber', i) as string;

						body = this.getNodeParameter('editFields', i, {}) as IDataObject;

						if (body.labels !== undefined) {
							body.labels = (body.labels as IDataObject[]).map((data) => data['label']);
						}
						if (body.assignees !== undefined) {
							body.assignees = (body.assignees as IDataObject[]).map((data) => data['assignee']);
						}

						endpoint = `/repos/${owner}/${repository}/issues/${issueNumber}`;
					} else if (operation === 'get') {
						// ----------------------------------
						//         get
						// ----------------------------------

						requestMethod = 'GET';

						const issueNumber = this.getNodeParameter('issueNumber', i) as string;

						endpoint = `/repos/${owner}/${repository}/issues/${issueNumber}`;
					} else if (operation === 'lock') {
						// ----------------------------------
						//         lock
						// ----------------------------------

						requestMethod = 'PUT';

						const issueNumber = this.getNodeParameter('issueNumber', i) as string;

						qs.lock_reason = this.getNodeParameter('lockReason', i) as string;

						endpoint = `/repos/${owner}/${repository}/issues/${issueNumber}/lock`;
					}
				} else if (resource === 'release') {
					if (operation === 'create') {
						// ----------------------------------
						//         create
						// ----------------------------------

						requestMethod = 'POST';

						body = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						body.tag_name = this.getNodeParameter('releaseTag', i) as string;

						endpoint = `/repos/${owner}/${repository}/releases`;
					}
					if (operation === 'delete') {
						// ----------------------------------
						//         delete
						// ----------------------------------

						requestMethod = 'DELETE';

						const releaseId = this.getNodeParameter('release_id', i) as string;

						endpoint = `/repos/${owner}/${repository}/releases/${releaseId}`;
					}
					if (operation === 'get') {
						// ----------------------------------
						//         get
						// ----------------------------------

						requestMethod = 'GET';

						const releaseId = this.getNodeParameter('release_id', i) as string;

						endpoint = `/repos/${owner}/${repository}/releases/${releaseId}`;
					}
					if (operation === 'getAll') {
						// ----------------------------------
						//         getAll
						// ----------------------------------

						requestMethod = 'GET';

						endpoint = `/repos/${owner}/${repository}/releases`;

						returnAll = this.getNodeParameter('returnAll', 0) as boolean;

						if (returnAll === false) {
							qs.per_page = this.getNodeParameter('limit', 0) as number;
						}
					}
					if (operation === 'update') {
						// ----------------------------------
						//         update
						// ----------------------------------

						requestMethod = 'PATCH';

						const releaseId = this.getNodeParameter('release_id', i) as string;

						body = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						endpoint = `/repos/${owner}/${repository}/releases/${releaseId}`;
					}
				} else if (resource === 'repository') {
					if (operation === 'listPopularPaths') {
						// ----------------------------------
						//         listPopularPaths
						// ----------------------------------

						requestMethod = 'GET';

						endpoint = `/repos/${owner}/${repository}/traffic/popular/paths`;
					} else if (operation === 'listReferrers') {
						// ----------------------------------
						//         listReferrers
						// ----------------------------------

						requestMethod = 'GET';

						endpoint = `/repos/${owner}/${repository}/traffic/popular/referrers`;
					} else if (operation === 'get') {
						// ----------------------------------
						//         get
						// ----------------------------------

						requestMethod = 'GET';

						endpoint = `/repos/${owner}/${repository}`;
					} else if (operation === 'getLicense') {
						// ----------------------------------
						//         getLicense
						// ----------------------------------

						requestMethod = 'GET';

						endpoint = `/repos/${owner}/${repository}/license`;
					} else if (operation === 'getIssues') {
						// ----------------------------------
						//         getIssues
						// ----------------------------------

						requestMethod = 'GET';

						qs = this.getNodeParameter('getRepositoryIssuesFilters', i) as IDataObject;

						endpoint = `/repos/${owner}/${repository}/issues`;

						returnAll = this.getNodeParameter('returnAll', 0) as boolean;

						if (returnAll === false) {
							qs.per_page = this.getNodeParameter('limit', 0) as number;
						}
					}
				} else if (resource === 'review') {
					if (operation === 'get') {
						// ----------------------------------
						//         get
						// ----------------------------------
						requestMethod = 'GET';

						const reviewId = this.getNodeParameter('reviewId', i) as string;

						const pullRequestNumber = this.getNodeParameter('pullRequestNumber', i) as string;

						endpoint = `/repos/${owner}/${repository}/pulls/${pullRequestNumber}/reviews/${reviewId}`;

					} else if (operation === 'getAll') {
						// ----------------------------------
						//         getAll
						// ----------------------------------
						requestMethod = 'GET';

						returnAll = this.getNodeParameter('returnAll', 0) as boolean;

						const pullRequestNumber = this.getNodeParameter('pullRequestNumber', i) as string;

						if (returnAll === false) {
							qs.per_page = this.getNodeParameter('limit', 0) as number;
						}

						endpoint = `/repos/${owner}/${repository}/pulls/${pullRequestNumber}/reviews`;
					} else if (operation === 'create') {
						// ----------------------------------
						//         create
						// ----------------------------------
						requestMethod = 'POST';

						const pullRequestNumber = this.getNodeParameter('pullRequestNumber', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
						Object.assign(body, additionalFields);

						body.event = snakeCase(this.getNodeParameter('event', i) as string).toUpperCase();
						if (body.event === 'REQUEST_CHANGES' || body.event === 'COMMENT') {
							body.body = this.getNodeParameter('body', i) as string;
						}

						endpoint = `/repos/${owner}/${repository}/pulls/${pullRequestNumber}/reviews`;
					} else if (operation === 'update') {
						// ----------------------------------
						//         update
						// ----------------------------------
						requestMethod = 'PUT';

						const pullRequestNumber = this.getNodeParameter('pullRequestNumber', i) as string;
						const reviewId = this.getNodeParameter('reviewId', i) as string;

						body.body = this.getNodeParameter('body', i) as string;

						endpoint = `/repos/${owner}/${repository}/pulls/${pullRequestNumber}/reviews/${reviewId}`;
					}
				} else if (resource === 'user') {
					if (operation === 'getRepositories') {
						// ----------------------------------
						//         getRepositories
						// ----------------------------------

						requestMethod = 'GET';

						endpoint = `/users/${owner}/repos`;

						returnAll = this.getNodeParameter('returnAll', 0) as boolean;

						if (returnAll === false) {
							qs.per_page = this.getNodeParameter('limit', 0) as number;
						}

					} else if (operation === 'invite') {
						// ----------------------------------
						//            invite
						// ----------------------------------

						requestMethod = 'POST';
						const org = this.getNodeParameter('organization', i) as string;
						endpoint = `/orgs/${org}/invitations`;
						body.email = this.getNodeParameter('email', i) as string;

					}

				} else {
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known!`);
				}

				if (returnAll === true) {
					responseData = await githubApiRequestAllItems.call(this, requestMethod, endpoint, body, qs);
				} else {
					responseData = await githubApiRequest.call(this, requestMethod, endpoint, body, qs);
				}

				if (fullOperation === 'file:get') {
					const asBinaryProperty = this.getNodeParameter('asBinaryProperty', i);

					if (asBinaryProperty === true) {
						if (Array.isArray(responseData)) {
							throw new NodeOperationError(this.getNode(), 'File Path is a folder, not a file.');
						}
						// Add the returned data to the item as binary property
						const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

						const newItem: INodeExecutionData = {
							json: items[i].json,
							binary: {},
						};

						if (items[i].binary !== undefined) {
							// Create a shallow copy of the binary data so that the old
							// data references which do not get changed still stay behind
							// but the incoming data does not get changed.
							Object.assign(newItem.binary, items[i].binary);
						}

						newItem.binary![binaryPropertyName] = await this.helpers.prepareBinaryData(Buffer.from(responseData.content, 'base64'), responseData.path);

						items[i] = newItem;

						return this.prepareOutputData(items);
					}
				}
				if (fullOperation === 'release:delete') {
					responseData = { success: true };
				}

				if (overwriteDataOperations.includes(fullOperation)) {
					returnData.push(responseData);
				} else if (overwriteDataOperationsArray.includes(fullOperation)) {
					returnData.push.apply(returnData, responseData);
				}

			} catch (error) {
				if (this.continueOnFail()) {
					if (overwriteDataOperations.includes(fullOperation) || overwriteDataOperationsArray.includes(fullOperation)) {
						returnData.push({ error: error.message });
					} else {
						items[i].json = { error: error.message };
					}
					continue;
				}
				throw error;
			}
		}

		if (overwriteDataOperations.includes(fullOperation) || overwriteDataOperationsArray.includes(fullOperation)) {
			// Return data gets replaced
			return [this.helpers.returnJsonArray(returnData)];
		} else {
			// For all other ones simply return the unchanged items
			return this.prepareOutputData(items);
		}
	}
}
