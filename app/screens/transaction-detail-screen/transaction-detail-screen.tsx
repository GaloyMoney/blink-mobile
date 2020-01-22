import * as React from "react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { Image, View, StyleSheet } from "react-native"
import { ListItem } from "react-native-elements"

import currency from "currency.js"
import Icon from "react-native-vector-icons/Ionicons"
import { color } from "../../theme"

import MapView from "react-native-maps"
import { useNavigationParam } from "react-navigation-hooks"
import { TextCurrency } from "../../components/text-currency"
import { CurrencyType } from "../../utils/enum"

const styles = StyleSheet.create({
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },

  amountView: {
    alignItems: "center",
    marginVertical: 24,
  },

  description: {
    flexDirection: "row",
    marginHorizontal: 30,
    marginVertical: 12,
  },

  icon: {
    marginLeft: 24,
    marginRight: 8,
    marginVertical: 16,
  },

  iconView: {
    alignItems: "center",
    flexDirection: "row",
  },

  map: {
    height: 150,
    marginBottom: 12,
    marginLeft: "auto",
    marginRight: 30,
    width: 150,
  },

  valueDescription: {
    marginLeft: "auto",
  },
})

export const TransactionDetailScreen: React.FC<> = () => {
  const list = [
    {
      title: "See recent transactions",
      icon: "search",
    },
    {
      title: "Report an issue",
      icon: "warning",
    },
  ]

  
  const date = useNavigationParam("date")
  console.tron.log('date', date)
  const amount = useNavigationParam("amount")
  const cashback = useNavigationParam("cashback")
  const name = useNavigationParam("name")

  const spendOrReceive = amount < 0 ? "spent" : "receive"

  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }
  const date_format = date.toLocaleString("en-US", options)

  return (
    <Screen>
      <Image
        source={require("../../theme/header_example_transaction.jpg")}
        style={{ width: "100%" }}
      />

      <View style={styles.amountView}>
        <Text style={styles.amountText}>You {spendOrReceive}</Text>
        <TextCurrency amount={amount} currencyUsed={CurrencyType.USD} fontSize={18} />
        
        {cashback !== undefined && 
          <Text style={styles.amountText}>
            and earned{" "}
            {currency(cashback, {
              precision: 0,
              separator: ",",
            }).format()}{" "}
            sats
          </Text>
        }
      </View>

      <View style={styles.iconView}>
        <Icon name="ios-calendar" style={styles.icon} color={color.primary} size={28} />
        <Text>{date_format}</Text>
      </View>

      <View>
        <View style={{ flexDirection: "row" }}>
          <View>
            <View style={styles.iconView}>
              <Icon name="ios-pin" style={styles.icon} color={color.primary} size={28} />
              <View style={{ flexDirection: "column" }}>
                <Text>3198 16th St,</Text>
                <Text>San Francisco,</Text>
                <Text>CA 94103</Text>
              </View>
            </View>
            <View style={styles.iconView}>
              <Icon name="ios-call" style={styles.icon} color={color.primary} size={28} />
              <Text>(415) 829-8468</Text>
            </View>
          </View>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      </View>
      <View style={styles.description}>
        <Text>Description</Text>
        <Text style={styles.valueDescription}>{name}</Text>
      </View>
      <View style={styles.description}>
        <Text>Method</Text>
        <Text style={styles.valueDescription}>In person</Text>
      </View>
      <View style={styles.description}>
        <Text>Category</Text>
        <Text style={styles.valueDescription}>Food & drinks</Text>
      </View>

      <View>
        {list.map((item, i) => (
          <ListItem
            key={i}
            title={item.title}
            leftIcon={{ name: item.icon }}
            bottomDivider
            chevron
          />
        ))}
      </View>
    </Screen>
  )
}

TransactionDetailScreen.navigationOptions = screenProps => ({
  title: screenProps.navigation.getParam("name")
})
