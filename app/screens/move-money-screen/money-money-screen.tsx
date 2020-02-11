import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, ScrollView } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { inject } from "mobx-react"
import { Onboarding } from "types"
import { translate } from "../../i18n"

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

export const MoveMoneyScreen = inject("dataStore")(
    ({ dataStore }) => {

    const { navigate } = useNavigation()

    const bank = [
        {
            icon: 'ios-exit',
            target: 'bankTransfer',
        },
        {
            icon: 'ios-download',
            target: 'directDeposit',
        },
        {
            icon: 'ios-pin',
            target: 'findATM',
        },
        {
            icon: 'ios-cash',
            target: 'depositCash',
        }
      ]
    const bitcoin = [
        {
            icon: 'ios-exit',
            target: 'sendBitcoin',
        },
        {
            icon: 'ios-download',
            target: 'receiveBitcoin',
        }
      ]

    const onBankClick = ({target, title}) => {
        if (!dataStore.onboarding.has(Onboarding.bankOnboarded)) {
            navigate('openBankAccount') 
        } else {
            navigate(target, {title})
        }
    }

    return (
        <Screen>
            <ScrollView>
                <Text style={styles.headerSection}>Bank</Text>
                {
                    bank.map((item, i) => (
                    <ListItem
                        titleStyle={styles.text}
                        style={styles.button}
                        key={i}
                        title={translate(`MoneyMoneyScreen\.${item.target}`)}
                        leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                        onPress={() => onBankClick(item)}
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
                        title={translate(`MoneyMoneyScreen\.${item.target}`)}
                        leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                        onPress={() => navigate(item.target)}
                        chevron
                    />
                    ))
                }
            </ScrollView>
        </Screen>
    )
})

MoveMoneyScreen.navigationOptions = () => ({
    title: translate("MoneyMoneyScreen.title")
})