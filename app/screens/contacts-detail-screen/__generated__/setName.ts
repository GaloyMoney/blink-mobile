/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: setName
// ====================================================

export interface setName_updateContact {
  __typename: "UpdateContact";
  setName: boolean | null;
}

export interface setName {
  updateContact: setName_updateContact | null;
}

export interface setNameVariables {
  username?: string | null;
  name?: string | null;
}
