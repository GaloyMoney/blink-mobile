import { Instance } from "mobx-state-tree"
import { UpdateContactModelBase } from "./UpdateContactModel.base"

/* The TypeScript type of an instance of UpdateContactModel */
export interface UpdateContactModelType extends Instance<typeof UpdateContactModel.Type> {}

/* A graphql query fragment builders for UpdateContactModel */
export { selectFromUpdateContact, updateContactModelPrimitives, UpdateContactModelSelector } from "./UpdateContactModel.base"

/**
 * UpdateContactModel
 */
export const UpdateContactModel = UpdateContactModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
