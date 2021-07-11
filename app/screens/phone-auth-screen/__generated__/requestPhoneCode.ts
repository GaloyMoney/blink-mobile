/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: requestPhoneCode
// ====================================================

export interface requestPhoneCode_requestPhoneCode {
  __typename: "Success";
  success: boolean | null;
}

export interface requestPhoneCode {
  requestPhoneCode: requestPhoneCode_requestPhoneCode | null;
}

export interface requestPhoneCodeVariables {
  phone?: string | null;
}
