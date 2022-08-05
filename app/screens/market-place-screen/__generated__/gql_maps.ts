/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: gql_maps
// ====================================================

export interface gql_maps_maps_coordinate {
  __typename: "Coordinate";
  latitude: number | null;
  longitude: number | null;
}

export interface gql_maps_maps {
  __typename: "Marker";
  id: string | null;
  title: string | null;
  username: string | null;
  coordinate: gql_maps_maps_coordinate | null;
}

export interface gql_maps {
  maps: (gql_maps_maps | null)[] | null;
}
