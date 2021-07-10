/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: prices
// ====================================================

export interface prices_prices {
  __typename: "Price";
  id: string;
  o: number | null;
}

export interface prices {
  prices: (prices_prices | null)[] | null;
}

export interface pricesVariables {
  length?: number | null;
}
