import { CustomIcon } from "@app/components/custom-icon"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import React, { useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { CheckBox, Text } from "react-native-elements"
import EStyleSheet from "react-native-extended-stylesheet"
import useMainQuery from "@app/hooks/use-main-query"
import { useMutation } from "@galoymoney/client"

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
  const { defaultWallet } = useMainQuery()
  const [isDefaultWalletExplainerModalOpen, setIsDefaultWalletExplainerModalOpen] =
    useState(false)
  const [accountUpdateDefaultWallet] = useMutation.accountUpdateDefaultWalletId()

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
          checked={defaultWallet.walletCurrency === "BTC"}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => updateDefaultWallet("BTC")}
          checkedColor={palette.lapisLazuli}
          textStyle={{ color: palette.lapisLazuli }}
        />
        <CheckBox
          title="USD"
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={defaultWallet.walletCurrency === "USD"}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => updateDefaultWallet("USD")}
          checkedColor={palette.lapisLazuli}
          textStyle={{ color: palette.lapisLazuli }}
        />
      </View>
    </>
  )
}
