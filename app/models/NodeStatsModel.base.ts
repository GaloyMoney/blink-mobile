/* This is a mst-gql generated file, don't modify it manually */
/* eslint-disable */
/* tslint:disable */

import { types } from "mobx-state-tree"
import { QueryBuilder } from "mst-gql"
import { ModelBase } from "./ModelBase"
import { RootStoreType } from "./index"


/**
 * NodeStatsBase
 * auto generated base class for the model NodeStatsModel.
 */
export const NodeStatsModelBase = ModelBase
  .named('NodeStats')
  .props({
    __typename: types.optional(types.literal("NodeStats"), "NodeStats"),
    peersCount: types.union(types.undefined, types.null, types.integer),
    channelsCount: types.union(types.undefined, types.null, types.integer),
  })
  .views(self => ({
    get store() {
      return self.__getStore<RootStoreType>()
    }
  }))

export class NodeStatsModelSelector extends QueryBuilder {
  get peersCount() { return this.__attr(`peersCount`) }
  get channelsCount() { return this.__attr(`channelsCount`) }
}
export function selectFromNodeStats() {
  return new NodeStatsModelSelector()
}

export const nodeStatsModelPrimitives = selectFromNodeStats().peersCount.channelsCount
