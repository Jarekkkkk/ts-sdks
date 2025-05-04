// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { StandardDisconnectFeature, StandardDisconnectMethod } from '@mysten/wallet-standard';
import { StandardDisconnect } from '@mysten/wallet-standard';
import type { DAppKitState } from '../state.js';
import { task } from 'nanostores';
import { getWalletFeature } from '@wallet-standard/ui';
import { WalletNotConnectedError } from '../../utils/errors.js';

export type DisconnectWalletArgs = Parameters<StandardDisconnectMethod>;

export function disconnectWalletCreator({ $state }: DAppKitState) {
	/**
	 * Disconnects the current wallet from the application and prompts the current wallet
	 * to deauthorize accounts from the current domain depending on the wallet's implemetation
	 * of `standard:disconnect`.
	 */
	return async function disconnectWallet(...standardDisconnectArgs: DisconnectWalletArgs) {
		return await task(async () => {
			const { currentAccount } = $state.get();
			if (!currentAccount) {
				throw new WalletNotConnectedError('No wallet is connected.');
			}

			try {
				const { disconnect } = getWalletFeature(
					currentAccount,
					StandardDisconnect,
				) as StandardDisconnectFeature[typeof StandardDisconnect];

				await disconnect(...standardDisconnectArgs);
			} finally {
				$state.set({
					...$state.get(),
					connectionStatus: 'disconnected',
					supportedIntents: null,
					currentAccount: null,
				});
			}
		});
	};
}
