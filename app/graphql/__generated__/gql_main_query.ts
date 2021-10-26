/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: gql_main_query
// ====================================================

export interface gql_main_query_prices {
  __typename: "Price";
  id: string;
  o: number | null;
}

export interface gql_main_query_maps_coordinate {
  __typename: "Coordinate";
  latitude: number | null;
  longitude: number | null;
}

export interface gql_main_query_maps {
  __typename: "Marker";
  id: string | null;
  title: string | null;
  username: string | null;
  coordinate: gql_main_query_maps_coordinate | null;
}

export interface gql_main_query_earnList {
  __typename: "Earn";
  /**
   * the earn reward for the app to display their associated amount
   */
  id: string;
  value: number;
  completed: boolean | null;
}

export interface gql_main_query_buildParameters {
  __typename: "BuildParameter";
  id: string | null;
  minBuildNumberAndroid: number | null;
  minBuildNumberIos: number | null;
  lastBuildNumberAndroid: number | null;
  lastBuildNumberIos: number | null;
}

export interface gql_main_query_getLastOnChainAddress {
  __typename: "LastOnChainAddress";
  id: string | null;
}

export interface gql_main_query_me_contacts {
  __typename: "Contact";
  id: string | null;
  name: string | null;
  transactionsCount: number | null;
}

export interface gql_main_query_me {
  __typename: "User";
  id: string | null;
  level: number;
  username: string | null;
  phone: string | null;
  language: string | null;
  contacts: (gql_main_query_me_contacts | null)[] | null;
}

export interface gql_main_query {
  earnList: (gql_main_query_earnList | null)[] | null;
  buildParameters: gql_main_query_buildParameters | null;
  getLastOnChainAddress: gql_main_query_getLastOnChainAddress | null;
  me: gql_main_query_me | null;
}

export interface gql_main_queryVariables {
  logged: boolean;
}
