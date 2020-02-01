import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, ScrollView } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem, Card, Button } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding } from "types"

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

    const rewards = 
    [
        // {
        //     title: 'Download the app',
        //     icon: 'ios-exit',
        //     badge: "+1,000 sats",
        //     fullfilled: true,
        //     action: null,
        // },
        {
            title: 'Backup wallet',
            icon: 'ios-lock',
            badge: "+1,000 sats",
            fullfilled: dataStore.onboarding.has(Onboarding.backupWallet),
            action: () => navigate('walletBackup'),
            text: "Now that you have some sats, you need to back up your wallet to iCloud so you never loose access to your bitcoin."
        },
        {
            title: 'Activate notifications',
            icon: 'ios-lock',
            badge: "+1,000 sats",
            fullfilled: dataStore.onboarding.has(Onboarding.activateNotifications),
            action: () => navigate('enableNotifications'),
        },
        {
            title: 'Learn about Bitcoin and Lightning',
            icon: 'ios-school',
            badge: "+1,000 sats",
            fullfilled: dataStore.onboarding.has(Onboarding.rewardsVideo),
            action: () => navigate('rewardsVideo'),
        },
        {
            title: 'Open your first channel',
            icon: 'ios-school',
            badge: "+5,000 sats",
            fullfilled: dataStore.onboarding.has(Onboarding.channelCreated),
            action: () => navigate('welcomeSyncing'),
        },
        {
            title: "Make your first micro payment for a NYT article",
            icon: 'ios-exit',
            badge: "+5,000 sats",
            fullfilled: dataStore.onboarding.has(Onboarding.firstPayment),
            action: () => navigate('sendBitcoin'),
        },
        {
            title: "Open bank account",
            icon: 'ios-gift',
            badge: "+10,000 sats",
            fullfilled: dataStore.onboarding.has(Onboarding.bankOnboarded),
            action: () => navigate('openBankAccount'),
        },
        {
            title: "Buy your first sats",
            icon: 'ios-exit',
            badge: "+10,000 sats",
            fullfilled: false,
            action: () => Alert.alert('TODO'),
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
    
    const index_fullfilled = rewards.findIndex(item => item.fullfilled === false)
    const card = rewards[index_fullfilled]
    const list = rewards.slice(index_fullfilled + 1)

    return (
        <Screen>
            <ScrollView>
                <Card
                    title={card.title}
                    image={trophyLogo}>
                    <Text style={{marginBottom: 10}}>
                        {card.text}
                    </Text>
                    <Button
                        // icon={<Icon name='code' color='#ffffff' />}
                        onPress={card.action}
                        buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: palette.green}}
                        title={card.badge} />
                </Card>
                {
                    list.map((item, i) => (
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
