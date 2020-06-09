/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */
import { types } from "mobx-state-tree"

/**
 * Typescript enum
 */

export enum Network {
  testnet="testnet",
mainnet="mainnet"
}

/**
* Network
*/
export const NetworkEnum = types.enumeration("Network", [
        "testnet",
  "mainnet",
      ])
