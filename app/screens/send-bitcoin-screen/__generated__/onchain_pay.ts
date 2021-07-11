/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: onchain_pay
// ====================================================

export interface onchain_pay_onchain_pay {
  __typename: "Success";
  success: boolean | null;
}

export interface onchain_pay_onchain {
  __typename: "OnChain";
  pay: onchain_pay_onchain_pay | null;
}

export interface onchain_pay {
  onchain: onchain_pay_onchain | null;
}

export interface onchain_payVariables {
  address: string;
  amount: number;
  memo?: string | null;
}
