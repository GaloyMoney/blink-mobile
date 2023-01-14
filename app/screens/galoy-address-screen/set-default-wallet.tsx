import { CustomIcon } from "@app/components/custom-icon"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import React, { useEffect, useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { CheckBox, Text } from "@rneui/base"
import EStyleSheet from "react-native-extended-stylesheet"
import { toastShow } from "@app/utils/toast"
import { DefaultWalletExplainerModal } from "./default-wallet-explainer-modal"
import {
  useAccountUpdateDefaultWalletIdMutation,
  useSetDefaultWalletQuery,
} from "@app/graphql/generated"
import { gql } from "@apollo/client"

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

gql`
  mutation accountUpdateDefaultWalletId($input: AccountUpdateDefaultWalletIdInput!) {
    accountUpdateDefaultWalletId(input: $input) {
      errors {
        __typename
        message
      }
      account {
        __typename
        id
        defaultWalletId
      }
    }
  }

  query setDefaultWallet {
    me {
      defaultAccount {
        id
        defaultWalletId
        btcWallet {
          id
        }
        usdWallet {
          id
        }
      }
    }
  }
`

export const SetDefaultWallet = () => {
  const { LL } = useI18nContext()

  const { data } = useSetDefaultWalletQuery({ fetchPolicy: "cache-only" })

  const accountId = data?.me?.defaultAccount?.id
  const btcWalletId = data?.me?.defaultAccount?.btcWallet?.id
  const usdWalletId = data?.me?.defaultAccount?.usdWallet?.id
  const defaultWalletId = data?.me?.defaultAccount?.defaultWalletId

  const [isDefaultWalletExplainerModalOpen, setIsDefaultWalletExplainerModalOpen] =
    useState(false)
  const [accountUpdateDefaultWallet, { error }] =
    useAccountUpdateDefaultWalletIdMutation()

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
        __typename: "Mutation",
        accountUpdateDefaultWalletId: {
          __typename: "AccountUpdateDefaultWalletIdPayload",
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
          checked={defaultWalletId === btcWalletId}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => updateDefaultWallet(btcWalletId)}
          checkedColor={palette.lapisLazuli}
          textStyle={{ color: palette.lapisLazuli }}
        />
        <CheckBox
          title="USD"
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={defaultWalletId === usdWalletId}
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
