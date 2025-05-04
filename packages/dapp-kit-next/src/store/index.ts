// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { computed, readonlyType } from 'nanostores';
import { createState } from './state.js';
import { syncRegisteredWallets } from './initializers/registered-wallets.js';
import { createActions } from './actions/index.js';

export type DAppKitStore = ReturnType<typeof createDAppKitStore>;

type CreateDAppKitStoreOptions = void;
export function createDAppKitStore(_: CreateDAppKitStoreOptions) {
	const state = createState();
	const actions = createActions(state);

	syncRegisteredWallets(state);

	return {
		...actions,
		$state: readonlyType(state.$state),
		$wallets: computed(state.$state, (state) => state.wallets),
		$currentWallet: state.$currentWallet,
		$currentAccount: computed([state.$state], (state) => {
			switch (state.connectionStatus) {
				case 'connected':
					return {
						account: state.currentAccount,
						supportedIntents: state.supportedIntents,
						connectionStatus: state.connectionStatus,
						isConnected: true,
						isConnecting: false,
						isDisconnected: false,
					} as const;
				case 'connecting':
					return {
						account: state.currentAccount,
						supportedIntents: state.supportedIntents,
						connectionStatus: state.connectionStatus,
						isConnected: false,
						isConnecting: true,
						isDisconnected: false,
					} as const;
				case 'disconnected':
					return {
						account: state.currentAccount,
						supportedIntents: state.supportedIntents,
						connectionStatus: state.connectionStatus,
						isConnected: false,
						isConnecting: false,
						isDisconnected: true,
					} as const;
				default:
					throw new Error(`Encountered unknown connection status: ${state}`);
			}
		}),
	};
}

let defaultStore: DAppKitStore | undefined;

export function getDefaultStore() {
	if (!defaultStore) {
		defaultStore = createDAppKitStore();

		(globalThis as any).__DAPP_KIT_DEFAULT_STORE__ ||= defaultStore;
		if ((globalThis as any).__DAPP_KIT_DEFAULT_STORE__ !== defaultStore) {
			console.warn(
				'Detected multiple dApp-kit store instances. This may cause un-expected behavior.',
			);
		}
	}

	return defaultStore;
}
