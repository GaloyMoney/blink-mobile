import * as React from "react"
import { Text } from "../../components/text"
import { Screen } from "../../components/screen"
import { NavigationScreenProps } from "react-navigation"
import { Image, View, StyleSheet } from "react-native";
import { ListItem } from 'react-native-elements'

import currency from "currency.js"
import Icon from 'react-native-vector-icons/Ionicons';
import { color } from "../../theme";


export interface TransactionDetailScreenProps extends NavigationScreenProps<{}> {
}

const styles = StyleSheet.create({
  amountView: {
    alignItems: "center",
    marginVertical: 24,
  },

  amountText: {
    fontSize:18,
    marginVertical: 4,
    fontWeight: "bold",
  },

  iconView: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginVertical: 16,
    marginLeft: 24,
    marginRight: 8,
  },

  description: {
    flexDirection: "row",
    margin: 12,
  },

  valueDescription: {
    marginLeft: 'auto'
  }

})


export class TransactionDetailScreen extends React.Component<TransactionDetailScreenProps, {}> {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("name")
    };
  };
  

  list = [
    {
      title: 'See recent transactions',
      icon: 'search'
    },
    {
      title: 'Report an issue',
      icon: 'warning'
    },
  ]
  
  render () {

    const date = this.props.navigation.getParam("date")
    var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', 
      hour: 'numeric', minute: 'numeric'};
    const date_format = date.toLocaleString('en-US', options)

    return (
      <Screen>
        <Image source={require("../../theme/header_example_transaction.jpg")} style={{width: "100%"}} />
        
        <View style={styles.amountView}>
          <Text style={styles.amountText}>You spent {currency(this.props.navigation.getParam("amount"), { formatWithSymbol: true } ).format()}</Text>
          <Text style={styles.amountText}>and earned {currency(this.props.navigation.getParam("cashback"), { precision: 0, separator: ',' } ).format()} sats</Text>
        </View>

        <View style={styles.iconView}>
          <Icon name="ios-calendar" style={styles.icon}
          color={color.primary} size={28} />
          <Text>{date_format}</Text>
        </View>
        
        <View>
          <View style={styles.iconView}>
           <Icon name="ios-pin" style={styles.icon}
           color={color.primary} size={28} />
           <View style={{flexDirection: "column"}}>
            <Text>3198 16th St,</Text>
            <Text>San Francisco,</Text>
            <Text>CA 94103</Text>
            </View>
          </View>
          <View style={styles.iconView}>
            <Icon name="ios-call" style={styles.icon}
            color={color.primary} size={28} />
            <Text>(415) 829-8468</Text>
          </View>
          {/* <map></map> */}
        </View>
        <View style={styles.description}>
          <Text>Description</Text>
          <Text style={styles.valueDescription}>{this.props.navigation.getParam("name")}</Text>
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
          {
            this.list.map((item, i) => (
              <ListItem
                key={i}
                title={item.title}
                leftIcon={{ name: item.icon }}
                bottomDivider
                chevron
              />
            ))
          }
        </View>
      </Screen>
    )
  }
}
