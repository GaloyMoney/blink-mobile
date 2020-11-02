import { Instance } from "mobx-state-tree"
import { NodeStatsModelBase } from "./NodeStatsModel.base"

/* The TypeScript type of an instance of NodeStatsModel */
export interface NodeStatsModelType extends Instance<typeof NodeStatsModel.Type> {}

/* A graphql query fragment builders for NodeStatsModel */
export { selectFromNodeStats, nodeStatsModelPrimitives, NodeStatsModelSelector } from "./NodeStatsModel.base"

/**
 * NodeStatsModel
 */
export const NodeStatsModel = NodeStatsModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
