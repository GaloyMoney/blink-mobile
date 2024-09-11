import React, { useState } from "react"
import {
  Platform,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import Modal from "react-native-modal"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { GaloyIcon } from "../atomic/galoy-icon"
import { GaloyCurrencyBubble } from "../atomic/galoy-currency-bubble"
import { WalletCurrency, useSetDefaultAccountModalQuery } from "@app/graphql/generated"
import { getUsdWallet } from "@app/graphql/wallets-utils"
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { useBreez } from "@app/hooks"
import { usePersistentStateContext } from "@app/store/persistent-state"
import { setHasPromptedSetDefaultAccount } from "@app/graphql/client-only-query"
import { useApolloClient } from "@apollo/client"

export type SetDefaultAccountModalProps = {
  isVisible: boolean
  toggleModal: () => void
}

export const SetDefaultAccountModal = ({
  isVisible,
  toggleModal,
}: SetDefaultAccountModalProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Primary">>()
  const client = useApolloClient()
  const { updateState } = usePersistentStateContext()
  const { btcWallet } = useBreez()

  const [loading, setLoading] = useState(false)

  const { data } = useSetDefaultAccountModalQuery({
    fetchPolicy: "cache-only",
  })

  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const onPressHandler = (currency: string) => {
    setLoading(true)
    let defaultWallet = usdWallet
    if (currency === "BTC") {
      defaultWallet = btcWallet
    }
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          defaultWallet,
        }
      return undefined
    })
    setHasPromptedSetDefaultAccount(client)
    setLoading(false)
    toggleModal()
    navigation.navigate("receiveBitcoin")
  }

  return (
    <SetDefaultAccountModalUI
      loadingUsdAccount={loading}
      loadingBtcAccount={loading}
      isVisible={isVisible}
      toggleModal={toggleModal}
      onPressBtcAccount={() => onPressHandler("BTC")}
      onPressUsdAccount={() => onPressHandler("USD")}
    />
  )
}

export type SetDefaultAccountModalUIProps = {
  isVisible: boolean
  toggleModal: () => void
  onPressUsdAccount?: () => void
  loadingUsdAccount?: boolean
  loadingBtcAccount?: boolean
  onPressBtcAccount?: () => void
}

export const SetDefaultAccountModalUI: React.FC<SetDefaultAccountModalUIProps> = ({
  isVisible,
  toggleModal,
  onPressUsdAccount,
  onPressBtcAccount,
  loadingBtcAccount,
  loadingUsdAccount,
}) => {
  const styles = useStyles()
  const {
    theme: { mode, colors },
  } = useTheme()
  const { LL } = useI18nContext()

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.7}
      backdropColor={colors.grey3}
      backdropTransitionOutTiming={0}
      avoidKeyboard={true}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
          <GaloyIcon name="close" size={30} color={colors.grey0} />
        </TouchableOpacity>
        <ScrollView
          style={styles.modalCard}
          persistentScrollbar={true}
          indicatorStyle={mode === "dark" ? "white" : "black"}
          bounces={false}
          contentContainerStyle={styles.scrollViewContainer}
        >
          <View style={styles.modalTitleContainer}>
            <Text style={styles.modalTitleText}>{LL.SetAccountModal.title()}</Text>
          </View>
          <View style={styles.modalBodyContainer}>
            <Text type={"p1"} style={styles.modalBodyText}>
              {LL.SetAccountModal.description()}
            </Text>
          </View>
        </ScrollView>
        <View style={styles.modalActionsContainer}>
          <TouchableOpacity onPress={onPressUsdAccount}>
            <View style={styles.currencyButtonContainer}>
              {loadingUsdAccount ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <GaloyCurrencyBubble iconSize={32} currency={WalletCurrency.Usd} />
                  <View style={styles.currencyButtonTextContainer}>
                    <Text type={"h1"}>{LL.common.stablesatsUsd()}</Text>
                    <Text type={"p3"}>{LL.SetAccountModal.stablesatsTag()}</Text>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressBtcAccount}>
            <View style={styles.currencyButtonContainer}>
              {loadingBtcAccount ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <GaloyCurrencyBubble iconSize={32} currency={WalletCurrency.Btc} />
                  <View style={styles.currencyButtonTextContainer}>
                    <Text type={"h1"}>{LL.common.bitcoin()}</Text>
                    <Text type={"p3"}>{LL.SetAccountModal.bitcoinTag()}</Text>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  currencyButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.grey4,
    minHeight: 90,
    borderRadius: 12,
    columnGap: 12,
    justifyContent: "center",
  },
  currencyButtonTextContainer: {
    flex: 1,
    flexDirection: "column",
  },
  container: {
    backgroundColor: colors.white,
    maxHeight: "80%",
    minHeight: "auto",
    borderRadius: 16,
    padding: 20,
  },
  modalCard: {
    width: "100%",
  },
  modalTitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    lineHeight: 32,
    maxWidth: "80%",
    textAlign: "center",
    color: colors.black,
    marginBottom: 10,
  },
  modalBodyContainer: {
    flex: 1,
    flexGrow: 1,
  },
  scrollViewContainer: { flexGrow: 1 },
  modalBodyText: {
    textAlign: "center",
  },
  modalActionsContainer: {
    width: "100%",
    height: "auto",
    flexDirection: "column",
    rowGap: 12,
    marginTop: 20,
  },
  closeIcon: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
}))
