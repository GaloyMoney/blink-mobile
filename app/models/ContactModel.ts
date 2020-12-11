import { Instance } from "mobx-state-tree"
import { ContactModelBase } from "./ContactModel.base"

/* The TypeScript type of an instance of ContactModel */
export interface ContactModelType extends Instance<typeof ContactModel.Type> {}

/* A graphql query fragment builders for ContactModel */
export { selectFromContact, contactModelPrimitives, ContactModelSelector } from "./ContactModel.base"

/**
 * ContactModel
 */
export const ContactModel = ContactModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
