/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: csv
// ====================================================

export interface csv_wallet {
  __typename: "Wallet";
  id: string | null;
  csv: string | null;
}

export interface csv {
  wallet: (csv_wallet | null)[] | null;
}
