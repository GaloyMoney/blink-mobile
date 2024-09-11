import React from "react"
import { View } from "react-native"

// components
import WalletBottomSheet from "./WalletBottomSheet"
import ReceiveTypeBottomSheet from "./ReceiveTypeBottomSheet"

// store
import { usePersistentStateContext } from "@app/store/persistent-state"

// types
import {
  InvoiceType,
  PaymentRequestState,
} from "@app/screens/receive-bitcoin-screen/payment/index.types"
import { WalletCurrency } from "@app/graphql/generated"

type Props = {
  request: any
}

const WalletReceiveTypeTabs: React.FC<Props> = ({ request }) => {
  const { persistentState } = usePersistentStateContext()

  const onChangeWallet = (id: WalletCurrency) => {
    if (id === "BTC" && request.type === "PayCode") {
      request.setType("Lightning")
    }
    request.setReceivingWallet(id)
  }

  const onChangeReceiveType = (id: InvoiceType) => {
    request.setType(id)
  }

  if (persistentState.isAdvanceMode) {
    return (
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <WalletBottomSheet
          currency={request.receivingWalletDescriptor.currency}
          disabled={request.state === PaymentRequestState.Loading}
          onChange={onChangeWallet}
        />
        <View style={{ width: 10 }} />
        <ReceiveTypeBottomSheet
          currency={request.receivingWalletDescriptor.currency}
          type={request.type}
          disabled={request.state === PaymentRequestState.Loading}
          onChange={onChangeReceiveType}
        />
      </View>
    )
  } else {
    return null
  }
}

export default WalletReceiveTypeTabs
