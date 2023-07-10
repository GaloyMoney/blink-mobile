import { gql } from "@apollo/client"
import { Screen } from "@app/components/screen"
import {
  useAccountDeleteMutation,
  useAccountScreenQuery,
  useUserEmailDeleteMutation,
  useUserPhoneDeleteMutation,
} from "@app/graphql/generated"
import { AccountLevel, useLevel } from "@app/graphql/level-context"
import { useDisplayCurrency } from "@app/hooks/use-display-currency"
import useLogout from "@app/hooks/use-logout"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { toBtcMoneyAmount, toUsdMoneyAmount } from "@app/types/amounts"
import { StackNavigationProp } from "@react-navigation/stack"
import React from "react"
import { Alert, TextInput, View } from "react-native"
import { SettingsRow } from "./settings-row"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import Modal from "react-native-modal"
import { CONTACT_EMAIL_ADDRESS } from "@app/config"
import { UpgradeAccountModal } from "@app/components/upgrade-account-modal"
import { GaloySecondaryButton } from "@app/components/atomic/galoy-secondary-button"
import { useShowWarningSecureAccount } from "./show-warning-secure-account"
import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"
import { useNavigation } from "@react-navigation/native"

gql`
  query accountScreen {
    me {
      id
      phone
      email {
        address
        verified
      }
      defaultAccount {
        id
        level
        wallets {
          id
          balance
          walletCurrency
        }
      }
    }
  }

  mutation accountDelete {
    accountDelete {
      errors {
        message
      }
      success
    }
  }

  mutation userEmailDelete {
    userEmailDelete {
      errors {
        message
      }
      me {
        id
        email {
          address
          verified
        }
      }
    }
  }

  mutation userPhoneDelete {
    userPhoneDelete {
      errors {
        message
      }
      me {
        id
        email {
          address
          verified
        }
      }
    }
  }
`

export const AccountScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "accountScreen">>()

  const { logout } = useLogout()
  const { LL } = useI18nContext()
  const styles = useStyles()

  const {
    theme: { colors },
  } = useTheme()

  const { isAtLeastLevelZero, currentLevel, isAtLeastLevelOne } = useLevel()

  const [deleteAccount] = useAccountDeleteMutation()
  const [emailDeleteMutation] = useUserEmailDeleteMutation()
  const [phoneDeleteMutation] = useUserPhoneDeleteMutation()

  const [text, setText] = React.useState("")
  const [modalVisible, setModalVisible] = React.useState(false)
  const [upgradeAccountModalVisible, setUpgradeAccountModalVisible] =
    React.useState(false)
  const closeUpgradeAccountModal = () => setUpgradeAccountModalVisible(false)
  const openUpgradeAccountModal = () => setUpgradeAccountModalVisible(true)

  const { data } = useAccountScreenQuery({
    fetchPolicy: "cache-and-network",
    skip: !isAtLeastLevelZero,
  })

  const phoneNumber = data?.me?.phone || "unknown"
  const email = data?.me?.email?.address || undefined

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)

  const usdWalletBalance = toUsdMoneyAmount(usdWallet?.balance)
  const btcWalletBalance = toBtcMoneyAmount(btcWallet?.balance)

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

  const deletePhonePrompt = async () => {
    Alert.alert(
      LL.AccountScreen.deletePhonePromptTitle(),
      LL.AccountScreen.deletePhonePromptContent(),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.yes(),
          onPress: async () => {
            deletePhone()
          },
        },
      ],
    )
  }

  const deleteEmailPrompt = async () => {
    Alert.alert(
      LL.AccountScreen.deleteEmailPromptTitle(),
      LL.AccountScreen.deleteEmailPromptContent(),
      [
        { text: LL.common.cancel(), onPress: () => {} },
        {
          text: LL.common.yes(),
          onPress: async () => {
            deleteEmail()
          },
        },
      ],
    )
  }

  const deletePhone = async () => {
    try {
      await phoneDeleteMutation()
    } catch (err) {
      let message = ""
      if (err instanceof Error) {
        message = err?.message
      }
      Alert.alert(LL.common.error(), message)
    }
  }

  const deleteEmail = async () => {
    try {
      await emailDeleteMutation()
    } catch (err) {
      let message = ""
      if (err instanceof Error) {
        message = err?.message
      }
      Alert.alert(LL.common.error(), message)
    }
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
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Primary" }],
            }),
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
      const res = await deleteAccount()

      if (res.data?.accountDelete?.success) {
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
      } else {
        Alert.alert(
          LL.common.error(),
          LL.support.deleteAccountError({ email: CONTACT_EMAIL_ADDRESS }) +
            "\n\n" +
            res.data?.accountDelete?.errors[0].message,
        )
      }
    } catch (err) {
      console.error(err)
      Alert.alert(
        LL.common.error(),
        LL.support.deleteAccountError({ email: CONTACT_EMAIL_ADDRESS }),
      )
    }
  }

  const emailAndPhoneActivated = Boolean(phoneNumber) && Boolean(email)
  const showWarningSecureAccount = useShowWarningSecureAccount()

  const accountSettingsList: SettingRow[] = [
    {
      category: LL.common.backupAccount(),
      id: "upgrade-to-level-one",
      icon: "person-outline",
      subTitleText: showWarningSecureAccount ? LL.AccountScreen.secureYourAccount() : "",
      chevronLogo: showWarningSecureAccount ? "alert-circle-outline" : undefined,
      chevronColor: showWarningSecureAccount ? colors.primary : undefined,
      chevronSize: showWarningSecureAccount ? 24 : undefined,
      action: openUpgradeAccountModal,
      hidden: currentLevel !== AccountLevel.Zero,
    },
    {
      category: LL.AccountScreen.accountLevel(),
      id: "level",
      icon: "ios-flash",
      subTitleText: currentLevel,
      enabled: false,
      greyed: true,
    },
    {
      category: LL.common.phoneNumber(),
      id: "phone",
      icon: "call-outline",
      subTitleText: phoneNumber,
      action: () => {},
      enabled: false,
      greyed: true,
      // hidden: !isAtLeastLevelOne,
    },
    {
      category: "Email",
      id: "email",
      icon: "mail-outline",
      subTitleText: email ?? LL.AccountScreen.tapToAdd(),
      action: () => navigation.navigate("emailSetInput"),
      enabled: isAtLeastLevelOne && !email,
      greyed: !isAtLeastLevelOne || Boolean(email),
    },
    {
      category: "Remove phone",
      id: "remove-phone",
      icon: "trash-outline",
      subTitleText: emailAndPhoneActivated ? undefined : LL.AccountScreen.addEmailFirst(),
      action: deletePhonePrompt,
      enabled: emailAndPhoneActivated,
      greyed: !emailAndPhoneActivated,
      chevronSize: 0,
    },
    {
      category: "Remove email",
      id: "remove-email",
      icon: "trash-outline",
      subTitleText: emailAndPhoneActivated ? undefined : LL.AccountScreen.addPhoneFirst(),
      action: deleteEmailPrompt,
      enabled: emailAndPhoneActivated,
      greyed: !emailAndPhoneActivated,
      chevronSize: 0,
      styleDivider: true,
    },
    {
      category: LL.common.transactionLimits(),
      id: "limits",
      icon: "custom-info-icon",
      action: () => navigation.navigate("transactionLimitsScreen"),
      enabled: isAtLeastLevelZero,
      greyed: !isAtLeastLevelZero,
      styleDivider: true,
    },
  ]

  if (isAtLeastLevelOne) {
    accountSettingsList.push({
      category: LL.AccountScreen.logOutAndDeleteLocalData(),
      id: "logout",
      icon: "ios-log-out",
      action: logoutAlert,
      enabled: true,
      greyed: false,
      chevronSize: 0,
    })
  }

  if (currentLevel !== AccountLevel.NonAuth) {
    accountSettingsList.push({
      category: LL.support.deleteAccount(),
      id: "deleteAccount",
      icon: "close-circle-outline",
      dangerous: true,
      action: deleteAccountAction,
      enabled: true,
      greyed: false,
      styleDivider: true,
    })
  }

  const AccountDeletionModal = (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      backdropOpacity={0.3}
      backdropColor={colors.grey3}
      avoidKeyboard={true}
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
        <GaloySecondaryButton title="Cancel" onPress={() => setModalVisible(false)} />
      </View>
    </Modal>
  )

  return (
    <Screen
      preset="scroll"
      keyboardShouldPersistTaps="handled"
      keyboardOffset="navigationHeader"
    >
      {accountSettingsList.map((setting) => (
        <SettingsRow setting={setting} key={setting.id} />
      ))}
      {AccountDeletionModal}
      <UpgradeAccountModal
        isVisible={upgradeAccountModalVisible}
        closeModal={closeUpgradeAccountModal}
      />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  view: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
  },

  textInput: {
    height: 40,
    borderColor: colors.grey3,
    borderWidth: 1,
    paddingVertical: 12,
    color: colors.black,
  },

  mainButton: { marginVertical: 20 },
}))
