/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: payInvoice
// ====================================================

export interface payInvoice_invoice {
  __typename: "Invoice";
  payInvoice: string | null;
}

export interface payInvoice {
  invoice: payInvoice_invoice | null;
}

export interface payInvoiceVariables {
  invoice: string;
  amount?: number | null;
  memo?: string | null;
}
