/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updatePendingInvoice
// ====================================================

export interface updatePendingInvoice_invoice {
  __typename: "Invoice";
  updatePendingInvoice: boolean | null;
}

export interface updatePendingInvoice {
  invoice: updatePendingInvoice_invoice | null;
}

export interface updatePendingInvoiceVariables {
  hash: string;
}
