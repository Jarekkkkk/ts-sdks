// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
	projects: {
		tsSDK: {
			schema: './packages/typescript/src/graphql/generated/latest/schema.graphql',
			documents: [
				'./packages/graphql-transport/src/**/*.ts',
				'./packages/graphql-transport/src/**/*.graphql',
				'./packages/typescript/src/graphql/queries/**/*.graphql',
			],
			include: [
				'./packages/graphql-transport/src/**/*.ts',
				'./packages/graphql-transport/src/**/*.graphql',
				'./packages/typescript/src/graphql/queries/**/*.graphql',
			],
		},
	},
};

export default config;
