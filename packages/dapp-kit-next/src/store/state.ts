// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui';
import { computed, map } from 'nanostores';
import { getWalletFromAccount } from '../utils/wallets.js';

export type DAppKitStateValues = {
	wallets: UiWallet[];
} & (
	| {
			connectionStatus: 'disconnected' | 'connecting';
			supportedIntents: null;
			currentAccount: null;
	  }
	| {
			connectionStatus: 'connected';
			supportedIntents: string[];
			currentAccount: UiWalletAccount;
	  }
);

export type DAppKitState = ReturnType<typeof createState>;

export function createState() {
	const $state = map<DAppKitStateValues>({
		wallets: [],
		connectionStatus: 'disconnected',
		currentAccount: null,
		supportedIntents: null,
	});

	const $currentWallet = computed($state, (state) => {
		if (!state.currentAccount) return null;
		return getWalletFromAccount(state.currentAccount, state.wallets);
	});

	return { $state, $currentWallet };
}
