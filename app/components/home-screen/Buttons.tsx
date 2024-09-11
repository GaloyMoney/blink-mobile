import React from "react"
import { View } from "react-native"
import { makeStyles } from "@rneui/themed"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useNavigation } from "@react-navigation/native"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useHasPromptedSetDefaultAccountQuery } from "@app/graphql/generated"
import { usePersistentStateContext } from "@app/store/persistent-state"

// components
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { icons } from "@app/components/atomic/galoy-icon"

type Target =
  | "scanningQRCode"
  | "sendBitcoinDestination"
  | "receiveBitcoin"
  | "TransactionHistoryTabs"
  | "USDTransactionHistory"

type IconNamesType = keyof typeof icons

type Props = {
  setModalVisible: (val: boolean) => void
  setDefaultAccountModalVisible: (val: boolean) => void
}

const Buttons: React.FC<Props> = ({ setModalVisible, setDefaultAccountModalVisible }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isAuthed = useIsAuthed()
  const styles = useStyles()
  const { LL } = useI18nContext()
  const { persistentState } = usePersistentStateContext()
  const { data: { hasPromptedSetDefaultAccount } = {} } =
    useHasPromptedSetDefaultAccountQuery()

  const onMenuClick = (target: Target) => {
    if (!isAuthed) {
      setModalVisible(true)
    } else {
      if (
        target === "receiveBitcoin" &&
        !hasPromptedSetDefaultAccount &&
        persistentState.isAdvanceMode
      ) {
        setDefaultAccountModalVisible(true)
      } else {
        navigation.navigate(target as any)
      }
    }
  }

  const buttons = [
    {
      title: LL.HomeScreen.receive(),
      target: "receiveBitcoin" as Target,
      icon: "receive" as IconNamesType,
    },
    {
      title: LL.HomeScreen.send(),
      target: "sendBitcoinDestination" as Target,
      icon: "send" as IconNamesType,
    },
    {
      title: LL.HomeScreen.scan(),
      target: "scanningQRCode" as Target,
      icon: "qr-code" as IconNamesType,
    },
  ]

  if (persistentState.isAdvanceMode) {
    buttons.unshift({
      title: LL.ConversionDetailsScreen.title(),
      target: "conversionDetails" as Target,
      icon: "transfer" as IconNamesType,
    })
  }

  return (
    <View style={styles.listItemsContainer}>
      {buttons.map((item) => (
        <View key={item.icon} style={styles.button}>
          <GaloyIconButton
            name={item.icon}
            size="large"
            text={item.title}
            onPress={() => onMenuClick(item.target)}
          />
        </View>
      ))}
    </View>
  )
}

export default Buttons

const useStyles = makeStyles(({ colors }) => ({
  listItemsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: colors.grey5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  button: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 74,
  },
}))
