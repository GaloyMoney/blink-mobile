/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: login
// ====================================================

export interface login_login {
  __typename: "Token";
  token: string | null;
}

export interface login {
  login: login_login | null;
}

export interface loginVariables {
  phone?: string | null;
  code?: number | null;
}
