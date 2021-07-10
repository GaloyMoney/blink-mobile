/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: payKeysendUsername
// ====================================================

export interface payKeysendUsername_invoice {
  __typename: "Invoice";
  payKeysendUsername: string | null;
}

export interface payKeysendUsername {
  invoice: payKeysendUsername_invoice | null;
}

export interface payKeysendUsernameVariables {
  amount: number;
  destination: string;
  username: string;
  memo?: string | null;
}
