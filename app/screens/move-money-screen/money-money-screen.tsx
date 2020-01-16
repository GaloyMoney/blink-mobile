import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"

const styles = StyleSheet.create({
    headerSection: {
        fontWeight: 'bold',
        fontSize: 20,
        margin: 22,
    },

    text: {
        fontSize: 22,
        color: palette.darkGrey
    },

    button: {
        marginLeft: 20
    },

    icon: {
        marginRight: 12,
        textAlign: "center",
        width: 32,
    },
})

export const MoveMoneyScreen = () => {

    const { navigate } = useNavigation()

    const bank = [
        {
            title: 'Bank Transfer',
            icon: 'ios-exit'
        },
        {
            title: "Direct Deposit",
            icon: 'ios-download'
        },
        {
            title: 'Find an ATM',
            icon: 'ios-pin'
        },
        {
            title: "Deposit Cash",
            icon: 'ios-cash'
        }
      ]
    const bitcoin = [
        {
            title: 'Send Bitcoin',
            icon: 'ios-exit',
            target: 'sendBitcoin',
        },
        {
            title: "Receive Bitcoin",
            icon: 'ios-download',
            target: 'receiveBitcoin',
        }
      ]

    return (
        <Screen>
            <Text style={styles.headerSection}>Bank</Text>
            {
                bank.map((item, i) => (
                <ListItem
                    titleStyle={styles.text}
                    style={styles.button}
                    key={i}
                    title={item.title}
                    leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                    onPress={() => navigate('openBankAccount')}
                    chevron
                />
                ))
            }
            <Text style={styles.headerSection}>Bitcoin</Text>
            {
                bitcoin.map((item, i) => (
                <ListItem
                    titleStyle={styles.text}
                    style={styles.button}
                    key={i}
                    title={item.title}
                    leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                    onPress={() => navigate(item.target)}
                    chevron
                />
                ))
            }
        </Screen>
    )
}

MoveMoneyScreen.navigationOptions = () => ({
    title: "Move Money"
})