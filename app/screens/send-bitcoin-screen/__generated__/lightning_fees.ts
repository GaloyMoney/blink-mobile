/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: lightning_fees
// ====================================================

export interface lightning_fees_invoice {
  __typename: "Invoice";
  getFee: number | null;
}

export interface lightning_fees {
  invoice: lightning_fees_invoice | null;
}

export interface lightning_feesVariables {
  invoice?: string | null;
  amount?: number | null;
}
