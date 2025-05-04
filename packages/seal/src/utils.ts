// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { fromHex, toHex } from '@mysten/bcs';
import { isValidSuiObjectId } from '@mysten/sui/utils';

import { UserError } from './error.js';

export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
	if (a.length !== b.length) {
		throw new Error('Invalid input');
	}
	return xorUnchecked(a, b);
}

export function xorUnchecked(a: Uint8Array, b: Uint8Array): Uint8Array {
	return a.map((ai, i) => ai ^ b[i]);
}

/**
 * Create a full ID concatenating DST || package ID || inner ID.
 * @param dst - The domain separation tag.
 * @param packageId - The package ID.
 * @param innerId - The inner ID.
 * @returns The full ID.
 */
export function createFullId(dst: Uint8Array, packageId: string, innerId: string): string {
	if (!isValidSuiObjectId(packageId)) {
		throw new UserError(`Invalid package ID ${packageId}`);
	}
	const packageIdBytes = fromHex(packageId);
	const innerIdBytes = fromHex(innerId);
	const fullId = new Uint8Array(1 + dst.length + packageIdBytes.length + innerIdBytes.length);
	fullId.set([dst.length], 0);
	fullId.set(dst, 1);
	fullId.set(packageIdBytes, 1 + dst.length);
	fullId.set(innerIdBytes, 1 + dst.length + packageIdBytes.length);
	return toHex(fullId);
}

/**
 * A simple class to represent a version number of the form x.y.z.
 */
export class Version {
	major: number;
	minor: number;
	patch: number;

	constructor(version: string) {
		// Very basic version parsing. Assumes version is in the format x.y.z where x, y, and z are non-negative integers.
		const parts = version.split('.').map(Number);
		if (parts.length !== 3 || parts.some((part) => isNaN(part) || part < 0)) {
			throw new UserError(`Invalid version format: ${version}`);
		}
		this.major = parts[0];
		this.minor = parts[1];
		this.patch = parts[2];
	}

	// Compare this version with another version. True if this version is older than the other version.
	older_than(other: Version): boolean {
		if (this.major !== other.major) {
			return this.major < other.major;
		} else if (this.minor !== other.minor) {
			return this.minor < other.minor;
		}
		return this.patch < other.patch;
	}
}
