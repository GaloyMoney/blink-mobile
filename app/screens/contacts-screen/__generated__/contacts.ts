/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: contacts
// ====================================================

export interface contacts_me_contacts {
  __typename: "Contact";
  id: string | null;
  name: string | null;
  prettyName: string;
  transactionsCount: number | null;
}

export interface contacts_me {
  __typename: "User";
  contacts: (contacts_me_contacts | null)[] | null;
}

export interface contacts {
  me: contacts_me | null;
}
