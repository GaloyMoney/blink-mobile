/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: updateUsername
// ====================================================

export interface updateUsername_updateUser_updateUsername {
  __typename: "User";
  id: string | null;
  username: string | null;
}

export interface updateUsername_updateUser {
  __typename: "UpdateUser";
  updateUsername: updateUsername_updateUser_updateUsername | null;
}

export interface updateUsername {
  updateUser: updateUsername_updateUser | null;
}

export interface updateUsernameVariables {
  username: string;
}
