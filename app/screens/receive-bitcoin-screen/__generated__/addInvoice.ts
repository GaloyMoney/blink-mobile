/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: addInvoice
// ====================================================

export interface addInvoice_invoice {
  __typename: "Invoice";
  addInvoice: string | null;
}

export interface addInvoice {
  invoice: addInvoice_invoice | null;
}

export interface addInvoiceVariables {
  value?: number | null;
  memo?: string | null;
}
