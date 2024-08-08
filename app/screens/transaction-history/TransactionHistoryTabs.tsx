import React, { useEffect, useState } from "react"
import styled from "styled-components/native"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { StackScreenProps } from "@react-navigation/stack"
import { RootStackParamList } from "@app/navigation/stack-param-lists"

// screens
import { USDTransactionHistory } from "./USDTransactionHistory"
import { BTCTransactionHistory } from "./BTCTransactionHistory"

// components
import { BalanceHeader } from "@app/components/balance-header"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import useBreezBalance from "@app/hooks/useBreezBalance"
import { usePersistentStateContext } from "@app/store/persistent-state"

const Tab = createMaterialTopTabNavigator()

type Props = StackScreenProps<RootStackParamList, "TransactionHistoryTabs">

export const TransactionHistoryTabs: React.FC<Props> = ({ navigation, route }) => {
  const initialRouteName = route.params?.initialRouteName
  const { LL } = useI18nContext()
  const [breezBalance] = useBreezBalance()
  const { persistentState } = usePersistentStateContext()
  const [isContentVisible, setIsContentVisible] = React.useState(false)
  const [activeWallet, setActiveWallet] = useState<"btc" | "usd">(
    initialRouteName === "USDTransactionHistory" ? "usd" : "btc",
  )

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight>
          <BalanceHeader
            isContentVisible={isContentVisible}
            setIsContentVisible={setIsContentVisible}
            breezBalance={breezBalance}
            walletType={persistentState.isAdvanceMode ? activeWallet : "usd"}
            smallText
          />
        </HeaderRight>
      ),
    })
  }, [navigation, breezBalance, activeWallet, isContentVisible, setIsContentVisible])

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarLabelStyle: { fontSize: 18, fontWeight: "600" },
        tabBarIndicatorStyle: { backgroundColor: "#60aa55" },
      }}
    >
      {persistentState.isAdvanceMode && (
        <Tab.Screen
          name="BTCTransactionHistory"
          component={BTCTransactionHistory}
          options={{ title: LL.TransactionHistoryTabs.titleBTC() }}
          listeners={({ navigation }) => ({
            swipeEnd: (e) => {
              setActiveWallet("btc")
            },
            tabPress: (e) => {
              setActiveWallet("btc")
            },
          })}
        />
      )}

      <Tab.Screen
        name="USDTransactionHistory"
        component={USDTransactionHistory}
        options={{ title: LL.TransactionHistoryTabs.titleUSD() }}
        listeners={({ navigation }) => ({
          swipeEnd: (e) => {
            setActiveWallet("usd")
          },
          tabPress: (e) => {
            setActiveWallet("usd")
          },
        })}
      />
    </Tab.Navigator>
  )
}

const HeaderRight = styled.View`
  margin-right: 15px;
`
