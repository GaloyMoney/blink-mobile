import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Image } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding, OnboardingRewards } from "types"
import Carousel from 'react-native-snap-carousel';
import { TouchableHighlight } from "react-native-gesture-handler"
import { translate } from "../../i18n"


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

    const { navigate } = useNavigation()

    const rewards = 
    [
        {
            id: "walletDownloaded",
            icon: 'ios-exit',
            action: null,
        },
        {
            id: "backupWallet",
            icon: 'ios-lock',
            action: () => navigate('walletBackup'),
        },
        {
            id: "activateNotifications",
            icon: 'ios-lock',
            action: () => navigate('enableNotifications'),
        },
        {
            id: 'rewardsVideo',
            icon: 'ios-school',
            action: () => navigate('rewardsVideo'),
        },
        {
            id: 'channelCreated',
            icon: 'ios-school',
            action: () => navigate('welcomeSyncing'),
        },
        {
            id: 'firstLightningPayment',
            icon: 'ios-exit',
            action: () => navigate('sendBitcoin'),
        },
        {
            id: 'bankOnboarded',
            icon: 'ios-gift',
            action: () => navigate('openBankAccount'),
        },
        {
            id: "debitCardActivation",
            icon: 'ios-exit',
            action: () => Alert.alert('TODO'),
        },
        {
            id: "firstCardSpending",
            icon: 'ios-power',
            action: () => Alert.alert('TODO'),
        },
        {
            id: "activateDirectDeposit",
            icon: 'ios-cart',
            rewards: "0.25% rewards!",
            action: () => Alert.alert('TODO'),
        },
        {
            id: "inviteAFriend",
            icon: 'ios-download',
            rewards: "1% card rewards!",
            action: () => Alert.alert('TODO'),
        }
    ]
    
    rewards.forEach(item => item['fullfilled'] = dataStore.onboarding.has(Onboarding[item.id]))

    const first_non_fullfilled_item = rewards.findIndex(item => !item.fullfilled)

    const total_rewards = rewards.length
    const rewards_unlocked = rewards.reduce((acc, item) => (
        item.fullfilled ? acc + 1 : acc
    ), 0)

    const renderItem = ({item, index}) => {
        return (
            <View style={styles.textButton}>
                <Image source={trophyLogo} />
                <TouchableHighlight onPress={ item.action } disabled={item.fullfilled}>
                    <View>
                        <Text style={styles.textButton}>
                            { translate(`RewardsScreen\.${item.id}.title`) }
                        </Text>
                        <Text style={styles.textButton}>
                            { translate(`RewardsScreen\.${item.id}.text`) }
                        </Text>
                        <Text style={styles.textButton}>
                            { item.rewards 
                            || OnboardingRewards[item.id] && 
                                `+${OnboardingRewards[item.id]} sats`
                            }
                        </Text>
                        <Text>fullfilled: { item.fullfilled ? 'true' : 'false' }</Text>
                    </View>
                </TouchableHighlight>
            </View>
        )
    }

    return (
        <Screen>
            <Text>{translate('RewardsScreen.header')} {rewards_unlocked} / {total_rewards}</Text>
            <Carousel
            //   ref={(c) => { this._carousel = c; }}
              data={rewards}
              renderItem={renderItem}
              sliderWidth={500}
              itemWidth={250}
              firstItem={first_non_fullfilled_item}
            />
        </Screen>
    )
}))

RewardsScreen.navigationOptions = () => ({
    title: "Rewards"
})
