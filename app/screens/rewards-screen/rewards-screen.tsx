import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, Image, ScrollView } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding } from "../../utils/enum"

export const trophyLogo = require("./TrophyLogo.png")


const styles = StyleSheet.create({
    headerSection: {
        fontWeight: 'bold',
        fontSize: 20,
        margin: 22,
    },

    textButton: {
        fontSize: 18,
        color: palette.darkGrey
    },

    smallText: {
        fontSize: 18,
        color: palette.darkGrey,
        marginHorizontal: 40,
        marginBottom: 40,
        textAlign: 'center',
    },

    button: {
        marginHorizontal: 20,
        paddingVertical: 6,
    },

    icon: {
        marginRight: 12,
        textAlign: "center",
        width: 32,
    },

    image: {
        alignSelf: "center",
        marginVertical: 50,
    },

    badgeDefault: {
        backgroundColor: color.primary
    },

    badgeFullfilled: {
        backgroundColor: color.secondary
    }
})

export const RewardsScreen = inject("dataStore")(
    observer(({ dataStore }) => {

    const bank = 
    [
        {
            title: 'Backup wallet',
            icon: 'ios-lock',
            badge: "+1,000 sats",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        },
        {
            title: 'Activate notifications',
            icon: 'ios-lock',
            badge: "+1,000 sats",
            fullfilled: false,
            action: () => navigate('enableNotifications'),
        },
        {
            title: "Make a payment",
            icon: 'ios-exit',
            badge: "+1,000 sats",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        },
        {
            title: "Buy your first sats",
            icon: 'ios-exit',
            badge: "+1,000 sats",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        },
        {
            title: 'Learn about Bitcoin',
            icon: 'ios-school',
            badge: "+1,000 sats",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        },
        {
            title: "Open bank account",
            icon: 'ios-gift',
            badge: "+50,000 sats",
            fullfilled: dataStore.onboarding.stage === Onboarding.bankOnboarded,
            action: () => navigate('bankRewards'),
        },
        {
            title: "Activate debit card",
            icon: 'ios-power',
            badge: "+50,000 sats",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        },
        {
            title: "Use your card",
            icon: 'ios-cart',
            badge: "0.25% rewards!",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        },
        {
            title: "Direct deposit",
            icon: 'ios-download',
            badge: "1% card rewards!",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
        }
    ]

    const { navigate } = useNavigation()

    return (
        <Screen>
            <ScrollView>
                <Image source={trophyLogo} style={styles.image} />
                <Text style={styles.smallText}>Complete the task below to earn more bitcoin rewards!</Text>
                {
                    bank.map((item, i) => (
                    <ListItem
                        titleStyle={styles.textButton}
                        style={styles.button}
                        key={i}
                        title={item.title}
                        leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                        onPress={item.action}
                        badge={{value:item.badge, 
                                badgeStyle: item.fullfilled? 
                                    styles.badgeFullfilled :
                                    styles.badgeDefault
                                }}
                        disabled={item.fullfilled}
                        chevron
                    />
                    ))
                }
            </ScrollView>
        </Screen>
    )
}))

RewardsScreen.navigationOptions = () => ({
    title: "Rewards"
})
