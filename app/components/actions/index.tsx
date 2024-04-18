import React from "react"
import { SetLightningAddressModal } from "../set-lightning-address-modal"
import { SetDefaultAccountModal } from "../set-default-account-modal"
import { UpgradeAccountModal } from "../upgrade-account-modal"

export const Action = {
  SetLnAddress: "SetLnAddress",
  SetDefaultAccount: "SetDefaultAccount",
  UpgradeAccount: "UpgradeAccount",
} as const

export type Action = (typeof Action)[keyof typeof Action]

type ActionsContextType = {
  setActiveAction: (action: Action | null) => void
  activeAction: Action | null
}

const ActionsContext = React.createContext<ActionsContextType>({
  setActiveAction: () => {},
  activeAction: null,
})

export const ActionsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeAction, setActiveAction] = React.useState<Action | null>(null)

  return (
    <ActionsContext.Provider value={{ activeAction, setActiveAction }}>
      {children}
    </ActionsContext.Provider>
  )
}

export const ActionModals: React.FC = () => {
  const { activeAction, setActiveAction } = useActionsContext()
  const closeModal = () => setActiveAction(null)
  return (
    <>
      <SetLightningAddressModal
        isVisible={activeAction === Action.SetLnAddress}
        toggleModal={closeModal}
      />
      <SetDefaultAccountModal
        isVisible={activeAction === Action.SetDefaultAccount}
        toggleModal={closeModal}
      />
      <UpgradeAccountModal
        isVisible={activeAction === Action.UpgradeAccount}
        closeModal={closeModal}
      />
    </>
  )
}

export const useActionsContext = () => React.useContext(ActionsContext)
