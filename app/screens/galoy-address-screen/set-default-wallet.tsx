import { CustomIcon } from "@app/components/custom-icon"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import React, { useEffect, useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { CheckBox, Text } from "@rneui/themed"
import EStyleSheet from "react-native-extended-stylesheet"
import { toastShow } from "@app/utils/toast"
import { DefaultWalletExplainerModal } from "./default-wallet-explainer-modal"
import {
  useAccountUpdateDefaultWalletIdMutation,
  useSetDefaultWalletScreenQuery,
} from "@app/graphql/generated"
import { gql } from "@apollo/client"
import { useIsAuthed } from "@app/graphql/is-authed-context"

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
        message
      }
      account {
        id
        defaultWalletId
      }
    }
  }

  query setDefaultWalletScreen {
    me {
      id
      defaultAccount {
        id
        defaultWalletId
        btcWallet @client {
          id
        }
        usdWallet @client {
          id
        }
      }
    }
  }
`

export const SetDefaultWalletScreen = () => {
  const { LL } = useI18nContext()
  const isAuthed = useIsAuthed()

  const { data } = useSetDefaultWalletScreenQuery({
    fetchPolicy: "cache-first",
    skip: !isAuthed,
  })

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
    if (accountId) {
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
            errors: [],
            account: {
              defaultWalletId: newDefaultWalletId,
              id: accountId,
              __typename: "ConsumerAccount",
            },
          },
        },
      })
    }
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
          iconType="ionicon"
          title="BTC"
          checkedIcon="radio-button-on"
          uncheckedIcon="radio-button-off"
          checked={defaultWalletId === btcWalletId}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => btcWalletId && updateDefaultWallet(btcWalletId)}
          checkedColor={palette.lapisLazuli}
          textStyle={{ color: palette.lapisLazuli }}
        />
        <CheckBox
          iconType="ionicon"
          title="USD"
          checkedIcon="radio-button-on"
          uncheckedIcon="radio-button-off"
          checked={defaultWalletId === usdWalletId}
          containerStyle={{ backgroundColor: palette.lighterGrey }}
          onPress={() => usdWalletId && updateDefaultWallet(usdWalletId)}
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
