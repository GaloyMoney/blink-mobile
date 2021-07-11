/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: earnList
// ====================================================

export interface earnList_earnList {
  __typename: "Earn";
  /**
   * the earn reward for the app to display their associated amount
   */
  id: string;
  value: number;
  completed: boolean | null;
}

export interface earnList {
  earnList: (earnList_earnList | null)[] | null;
}

export interface earnListVariables {
  logged: boolean;
}
