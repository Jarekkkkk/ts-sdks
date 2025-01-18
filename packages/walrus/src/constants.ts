// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WalrusPackageConfig } from './client.js';

export const TESTNET_WALRUS_PACKAGE_CONFIG: WalrusPackageConfig = {
	packageId: '0x795ddbc26b8cfff2551f45e198b87fc19473f2df50f995376b924ac80e56f88b',
	systemObjectId: '0x98ebc47370603fe81d9e15491b2f1443d619d1dab720d586e429ed233e1255c1',
	stakingPoolId: '0x20266a17b4f1a216727f3eef5772f8d486a9e3b5e319af80a5b75809c035561d',
	exchangeIds: [
		'0x59ab926eb0d94d0d6d6139f11094ea7861914ad2ecffc7411529c60019133997',
		'0x89127f53890840ab6c52fca96b4a5cf853d7de52318d236807ad733f976eef7b',
		'0x9f9b4f113862e8b1a3591d7955fadd7c52ecc07cf24be9e3492ce56eb8087805',
		'0xb60118f86ecb38ec79e74586f1bb184939640911ee1d63a84138d080632ee28a',
	],
};
