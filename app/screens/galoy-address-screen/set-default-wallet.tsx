import { CustomIcon } from "@app/components/custom-icon"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import React, { useEffect, useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { CheckBox, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import useMainQuery from "@app/hooks/use-main-query"
import { useMutation } from "@galoymoney/client"
import { toastShow } from "@app/utils/toast"
import { DefaultWalletExplainerModal } from "./default-wallet-explainer-modal"

const styles = EStyleSheet.create({
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  fieldNameContainer: {
    flex: 4,
    flexDirection: "row",
  },
  fieldNameComponent: {
    justifyContent: "center",
  },
  fieldText: {
    color: palette.lapisLazuli,
    fontSize: 14,
    fontFamily: "Roboto",
    fontWeight: "500",
    verticalTextAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  // For some reason the first TouchableWithoutFeedback requires a height otherwise the Text component doesn't show
  visualBugFix: {
    height: 30,
  },
})

export const SetDefaultWallet = () => {
  const { LL } = useI18nContext()
  const { defaultWallet, accountId, btcWalletId, usdWalletId } = useMainQuery()
  const [isDefaultWalletExplainerModalOpen, setIsDefaultWalletExplainerModalOpen] =
    useState(false)
  const [accountUpdateDefaultWallet, { error }] =
    useMutation.accountUpdateDefaultWalletId()

  useEffect(() => {
    if (error) {
      toastShow({ message: error.message, type: "error" })
    }
  }, [error])

  const toggleDefaultWalletExplainerModal = () => {
    setIsDefaultWalletExplainerModalOpen(!isDefaultWalletExplainerModalOpen)
  }

  const updateDefaultWallet = async (newDefaultWalletId: string) => {
    await accountUpdateDefaultWallet({
      variables: {
        input: {
          walletId: newDefaultWalletId,
        },
      },
      optimisticResponse: {
        accountUpdateDefaultWalletId: {
          errors: null,
          account: {
            defaultWalletId: newDefaultWalletId,
            id: accountId,
            __typename: "ConsumerAccount",
          },
        },
      },
    })
  }

  return (
    <>
      <View style={styles.fieldContainer}>
        <TouchableWithoutFeedback
          style={styles.visualBugFix}
          onPress={() => toggleDefaultWalletExplainerModal()}
        >
          <View style={styles.fieldNameContainer}>
            <View style={styles.fieldNameComponent}>
              <View style={styles.fieldText}>
                <CustomIcon name="custom-info-icon" color={palette.lapisLazuli} />
              </View>
            </View>
            <View style={styles.fieldNameComponent}>
              <Text style={styles.fieldText}>
                {" " + LL.GaloyAddressScreen.defaultWallet()}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox
          title="BTC"
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={defaultWallet?.walletCurrency === "BTC"}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => updateDefaultWallet(btcWalletId)}
          checkedColor={palette.lapisLazuli}
          textStyle={{ color: palette.lapisLazuli }}
        />
        <CheckBox
          title="USD"
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={defaultWallet?.walletCurrency === "USD"}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => updateDefaultWallet(usdWalletId)}
          checkedColor={palette.lapisLazuli}
          textStyle={{ color: palette.lapisLazuli }}
        />
      </View>
      <DefaultWalletExplainerModal
        modalVisible={isDefaultWalletExplainerModalOpen}
        toggleModal={toggleDefaultWalletExplainerModal}
      />
    </>
  )
}
