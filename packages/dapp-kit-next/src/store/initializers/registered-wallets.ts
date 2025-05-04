// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { getWallets, StandardEvents } from '@mysten/wallet-standard';
import { onMount } from 'nanostores';
import type { DAppKitState } from '../state.js';

import type { Wallet, WalletWithRequiredFeatures } from '@mysten/wallet-standard';
import { getSuiWallets, getWalletFromAccount, isSuiWallet } from '../../utils/wallets.js';
import { getOrCreateUiWalletForStandardWallet_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as getOrCreateUiWalletForStandardWallet } from '@wallet-standard/ui-registry';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui';
import { uiWalletAccountBelongsToUiWallet, uiWalletAccountsAreSame } from '@wallet-standard/ui';

/**
 * Handles updating the store in response to wallets being added, removed, and their properties changing.
 */
export function syncRegisteredWallets({ $state }: DAppKitState) {
	onMount($state, () => {
		const walletsApi = getWallets();
		const unsubscribeCallbacksByWallet = new Map<Wallet, () => void>();

		const onWalletsChanged = () => {
			const suiWallets = getSuiWallets().map(getOrCreateUiWalletForStandardWallet);
			$state.setKey('wallets', suiWallets);
		};

		const subscribeToWalletEvents = (wallet: WalletWithRequiredFeatures) => {
			const unsubscribeFromChange = wallet.features[StandardEvents].on('change', () => {
				onWalletsChanged();

				const { currentAccount, wallets } = $state.get();
				if (!currentAccount) return;

				const resolvedAccount = resolveWalletAccount(currentAccount, wallets);
				if (resolvedAccount) {
					// Update the current account since the properties might have changed or
					// the account was marked as incompatible and we can't fallback to another
					// account in the wallet:
					$state.setKey('currentAccount', resolvedAccount);
				} else {
					// Reset the connection if the connected account was marked as incompatible
					// and there are no other accounts in the wallet to fallback to:
					$state.set({
						...$state.get(),
						connectionStatus: 'disconnected',
						supportedIntents: null,
						currentAccount: null,
					});
				}
			});

			// NOTE: The underlying wallet entities returned from the Wallet Standard are
			// referentially equal even when the properties of a wallet change. Thus, it is
			// safe to use the wallet object itself as the key for the unsubscribe mapping.
			unsubscribeCallbacksByWallet.set(wallet, unsubscribeFromChange);
		};

		const unsubscribeFromRegister = walletsApi.on('register', (...addedWallets) => {
			addedWallets.filter(isSuiWallet).forEach(subscribeToWalletEvents);
			onWalletsChanged();
		});

		const unsubscribeFromUnregister = walletsApi.on('unregister', (...removedWallets) => {
			removedWallets.filter(isSuiWallet).forEach((wallet) => {
				const unsubscribeFromChange = unsubscribeCallbacksByWallet.get(wallet);
				if (unsubscribeFromChange) {
					unsubscribeCallbacksByWallet.delete(wallet);
					unsubscribeFromChange();
				}
			});

			onWalletsChanged();

			// Reset the connection if the connected wallet was unregistered:
			const { currentAccount, wallets } = $state.get();
			if (currentAccount && !getWalletFromAccount(currentAccount, wallets)) {
				$state.set({
					...$state.get(),
					connectionStatus: 'disconnected',
					supportedIntents: null,
					currentAccount: null,
				});
			}
		});

		const suiWallets = getSuiWallets();
		suiWallets.forEach(subscribeToWalletEvents);
		onWalletsChanged();

		return () => {
			unsubscribeFromRegister();
			unsubscribeFromUnregister();

			unsubscribeCallbacksByWallet.forEach((unsubscribe) => unsubscribe());
			unsubscribeCallbacksByWallet.clear();
		};
	});
}

function resolveWalletAccount(currentAccount: UiWalletAccount, wallets: UiWallet[]) {
	for (const wallet of wallets) {
		for (const walletAccount of wallet.accounts) {
			if (uiWalletAccountsAreSame(currentAccount, walletAccount)) {
				return walletAccount;
			}
		}

		if (uiWalletAccountBelongsToUiWallet(currentAccount, wallet) && wallet.accounts[0]) {
			return wallet.accounts[0];
		}
	}

	return null;
}
