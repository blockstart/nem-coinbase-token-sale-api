import { Account, Address, MosaicId } from 'nem-library';

export interface TokenTransfer {
	toAddress: Address;
	signer: Account;
	tokenAmount: number;
	mosaicId: MosaicId;
}