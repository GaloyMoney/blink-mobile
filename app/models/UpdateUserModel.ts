import { Instance } from "mobx-state-tree"
import { UpdateUserModelBase } from "./UpdateUserModel.base"

/* The TypeScript type of an instance of UpdateUserModel */
export interface UpdateUserModelType extends Instance<typeof UpdateUserModel.Type> {}

/* A graphql query fragment builders for UpdateUserModel */
export { selectFromUpdateUser, updateUserModelPrimitives, UpdateUserModelSelector } from "./UpdateUserModel.base"

/**
 * UpdateUserModel
 */
export const UpdateUserModel = UpdateUserModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
