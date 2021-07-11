/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: onchain_fees
// ====================================================

export interface onchain_fees_onchain {
  __typename: "OnChain";
  getFee: number | null;
}

export interface onchain_fees {
  onchain: onchain_fees_onchain | null;
}

export interface onchain_feesVariables {
  address: string;
  amount?: number | null;
}
