import { Instance } from "mobx-state-tree"
import { PendingOnchainPaymentModelBase } from "./PendingOnchainPaymentModel.base"

/* The TypeScript type of an instance of PendingOnchainPaymentModel */
export interface PendingOnchainPaymentModelType extends Instance<typeof PendingOnchainPaymentModel.Type> {}

/* A graphql query fragment builders for PendingOnchainPaymentModel */
export { selectFromPendingOnchainPayment, pendingOnchainPaymentModelPrimitives, PendingOnchainPaymentModelSelector } from "./PendingOnchainPaymentModel.base"

/**
 * PendingOnchainPaymentModel
 */
export const PendingOnchainPaymentModel = PendingOnchainPaymentModelBase
  .actions(self => ({
    // This is an auto-generated example action.
    log() {
      console.log(JSON.stringify(self))
    }
  }))
