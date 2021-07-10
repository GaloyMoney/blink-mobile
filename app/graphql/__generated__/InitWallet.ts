/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: InitWallet
// ====================================================

export interface InitWallet_wallet_transactions {
  __typename: "Transaction";
  id: string;
}

export interface InitWallet_wallet {
  __typename: "Wallet";
  id: string | null;
  balance: number | null;
  currency: string | null;
  transactions: (InitWallet_wallet_transactions | null)[] | null;
}

export interface InitWallet_buildParameters {
  __typename: "BuildParameter";
  id: string | null;
  minBuildNumberAndroid: number | null;
  minBuildNumberIos: number | null;
  lastBuildNumberAndroid: number | null;
  lastBuildNumberIos: number | null;
}

export interface InitWallet {
  wallet: (InitWallet_wallet | null)[] | null;
  buildParameters: InitWallet_buildParameters | null;
}
