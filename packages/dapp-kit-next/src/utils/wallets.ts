// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { Wallet, WalletWithRequiredFeatures } from '@mysten/wallet-standard';
import { getWallets, isSuiChain, isWalletWithRequiredFeatureSet } from '@mysten/wallet-standard';
import type { UiWallet, UiWalletAccount } from '@wallet-standard/ui';
import { uiWalletAccountBelongsToUiWallet } from '@wallet-standard/ui';

export function getSuiWallets() {
	const { get } = getWallets();
	return get().filter(isSuiWallet);
}

export function isSuiWallet(wallet: Wallet): wallet is WalletWithRequiredFeatures {
	return wallet.chains.some(isSuiChain) && isWalletWithRequiredFeatureSet(wallet);
}

export function getWalletFromAccount(account: UiWalletAccount, wallets: UiWallet[]) {
	return wallets.find((wallet) => uiWalletAccountBelongsToUiWallet(account, wallet)) ?? null;
}
