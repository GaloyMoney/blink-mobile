/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateLanguage
// ====================================================

export interface updateLanguage_updateUser_updateLanguage {
  __typename: "User";
  id: string | null;
  language: string | null;
}

export interface updateLanguage_updateUser {
  __typename: "UpdateUser";
  updateLanguage: updateLanguage_updateUser_updateLanguage | null;
}

export interface updateLanguage {
  updateUser: updateLanguage_updateUser | null;
}

export interface updateLanguageVariables {
  language: string;
}
