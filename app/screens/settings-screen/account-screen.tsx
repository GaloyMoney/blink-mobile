import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import { useAccountScreenQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useLevel } from "@app/graphql/level-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { isIos } from "@app/utils/helper"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Alert, TextInput, View } from "react-native"
import { SettingsRow } from "./settings-row"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { GaloyTertiaryButton } from "@app/components/atomic/galoy-tertiary-button"
import Modal from "react-native-modal"

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "accountScreen">
}

gql`
  query accountScreen {
    me {
      id
      phone
      defaultAccount {
        id
        btcWallet @client {
          id
          balance
        }
        usdWallet @client {
          id
          balance
        }
      }
    }
  }
`

export const AccountScreen = ({ navigation }: Props) => {
  const isAuthed = useIsAuthed()
  const { logout } = useLogout()
  const { LL } = useI18nContext()
  const styles = useStyles()

  const {
    theme: { colors },
  } = useTheme()

  const { isAtLeastLevelZero, currentLevel } = useLevel()

  const [text, setText] = React.useState("")
  const [modalVisible, setModalVisible] = React.useState(false)

  const { data } = useAccountScreenQuery({ fetchPolicy: "cache-first", skip: !isAuthed })
  const phoneNumber = data?.me?.phone || "unknown"

  // TODO
  const deleteAccount = async () => {}

  const usdWalletBalance = toUsdMoneyAmount(data?.me?.defaultAccount?.usdWallet?.balance)
  const btcWalletBalance = toBtcMoneyAmount(data?.me?.defaultAccount?.btcWallet?.balance)

  const { formatMoneyAmount } = useDisplayCurrency()

  let usdBalanceWarning = ""
  let btcBalanceWarning = ""
  let balancePositive = false
  if (usdWalletBalance.amount > 0) {
    const balance =
      formatMoneyAmount && formatMoneyAmount({ moneyAmount: usdWalletBalance })
    usdBalanceWarning = LL.AccountScreen.usdBalanceWarning({ balance })
    balancePositive = true
  }

  if (btcWalletBalance.amount > 0) {
    const balance =
      formatMoneyAmount && formatMoneyAmount({ moneyAmount: btcWalletBalance })
    btcBalanceWarning = LL.AccountScreen.btcBalanceWarning({ balance })
    balancePositive = true
  }

  const logoutAlert = () =>
    Alert.alert(
      LL.AccountScreen.logoutAlertTitle(),
      LL.AccountScreen.logoutAlertContent({ phoneNumber }),
      [
        {
          text: LL.common.cancel(),
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: LL.AccountScreen.IUnderstand(),
          onPress: logoutAction,
        },
      ],
    )

  const logoutAction = async () => {
    try {
      await logout()
      Alert.alert(LL.common.loggedOut(), "", [
        {
          text: LL.common.ok(),
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    } catch (err) {
      // TODO: figure out why ListItem onPress is swallowing errors
      console.error(err)
    }
  }

  const deleteAccountAction = async () => {
    if (balancePositive) {
      const fullMessage =
        usdBalanceWarning +
        "\n" +
        btcBalanceWarning +
        "\n" +
        LL.support.deleteAccountBalanceWarning()

      Alert.alert(LL.common.warning(), fullMessage, [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.yes(),
          onPress: async () => setModalVisible(true),
        },
      ])
    } else {
      setModalVisible(true)
    }
  }

  const deleteUserAccount = async () => {
    try {
      await deleteAccount()
      await logout()
      Alert.alert(LL.support.bye(), LL.support.deleteAccountConfirmation(), [
        {
          text: LL.common.ok(),
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Primary" }],
            }),
        },
      ])
    } catch (err) {
      console.error(err)
    }
  }

  const accountSettingsList: SettingRow[] = [
    {
      category: LL.AccountScreen.accountLevel(),
      id: "level",
      icon: "ios-flash",
      subTitleText: currentLevel,
      enabled: false,
      greyed: false,
    },
    {
      category: LL.common.transactionLimits(),
      id: "limits",
      icon: "custom-info-icon",
      action: () => navigation.navigate("transactionLimitsScreen"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
    },
    {
      category: LL.AccountScreen.logOutAndDeleteLocalData(),
      id: "logout",
      icon: "ios-log-out",
      action: logoutAlert,
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    },
  ]

  if (isIos) {
    accountSettingsList.push({
      category: LL.support.deleteAccount(),
      id: "deleteAccount",
      icon: "close-circle-outline",
      dangerous: true,
      action: deleteAccountAction,
      enabled: isAuthed,
      greyed: !isAuthed,
      hidden: !isAuthed,
    })
  }

  const AccountDeletionModal = (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
    >
      <View style={styles.view}>
        <Text type="h1">{LL.support.typeDelete({ delete: LL.support.delete() })}</Text>
        <TextInput style={styles.textInput} onChangeText={setText} value={text} />
        <GaloyPrimaryButton
          title="Confirm"
          disabled={text.toLowerCase().trim() !== LL.support.delete()}
          onPress={() => {
            setModalVisible(false)
            Alert.alert(
              LL.support.finalConfirmationAccountDeletionTitle(),
              LL.support.finalConfirmationAccountDeletionMessage(),
              [
                { text: LL.common.cancel(), onPress: () => {} },
                { text: LL.common.ok(), onPress: () => deleteUserAccount() },
              ],
            )
          }}
          containerStyle={styles.mainButton}
        />
        <GaloyTertiaryButton
          title="Cancel"
          onPress={() => setModalVisible(false)}
          outline
        />
      </View>
    </Modal>
  )

  return (
    <Screen preset="scroll">
      {accountSettingsList.map((setting) => (
        <SettingsRow setting={setting} key={setting.id} />
      ))}
      {AccountDeletionModal}
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  view: {
    marginTop: 50,
    marginHorizontal: 20,
    backgroundColor: "white",
    padding: 20,
  },

  textInput: { height: 40, borderColor: "gray", borderWidth: 1, paddingVertical: 12 },

  mainButton: { marginVertical: 20 },
}))
