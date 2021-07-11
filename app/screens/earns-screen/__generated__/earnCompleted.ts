/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: earnCompleted
// ====================================================

export interface earnCompleted_earnCompleted {
  __typename: "Earn";
  /**
   * the earn reward for the app to display their associated amount
   */
  id: string;
  value: number;
  completed: boolean | null;
}

export interface earnCompleted {
  earnCompleted: (earnCompleted_earnCompleted | null)[] | null;
}

export interface earnCompletedVariables {
  ids?: (string | null)[] | null;
}
