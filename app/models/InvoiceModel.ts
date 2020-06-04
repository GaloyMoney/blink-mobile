import { Instance } from "mobx-state-tree"
import { InvoiceModelBase } from "./InvoiceModel.base"

/* The TypeScript type of an instance of InvoiceModel */
export interface InvoiceModelType extends Instance<typeof InvoiceModel.Type> {}

/* A graphql query fragment builders for InvoiceModel */
export { selectFromInvoice, invoiceModelPrimitives, InvoiceModelSelector } from "./InvoiceModel.base"

/**
 * InvoiceModel
 */
export const InvoiceModel = InvoiceModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
