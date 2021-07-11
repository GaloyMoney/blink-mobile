/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: me_settings
// ====================================================

export interface me_settings_me {
  __typename: "User";
  username: string | null;
  phone: string | null;
  language: string | null;
}

export interface me_settings {
  me: me_settings_me | null;
}
