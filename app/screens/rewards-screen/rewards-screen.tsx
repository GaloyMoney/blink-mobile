import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Dimensions, Platform } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding, OnboardingRewards } from "types"
import Carousel, { ParallaxImage } from 'react-native-snap-carousel'
import { TouchableHighlight } from "react-native-gesture-handler"
import { translate } from "../../i18n"


export const safeBank = require("./SafeBank.jpg")
export const globalCommunications = require("./GlobalCommunications.jpg")
export const greenPhone = require("./GreenPhone.jpg")

const { width: screenWidth } = Dimensions.get('window')

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 60,
        height: screenWidth - 60,
    },
    
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderRadius: 8,
    },

    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 40,
        textAlign: 'center',
        marginTop: 100,
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
            image: safeBank,
        },
        {
            id: "activateNotifications",
            icon: 'ios-lock',
            action: () => navigate('enableNotifications'),
            image: globalCommunications,
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

    const total_rewards = rewards.length
    const rewards_unlocked = rewards.reduce((acc, item) => (
        item.fullfilled ? acc + 1 : acc
    ), 0)

    const renderItem = ({item, index}, parallaxProps) => {
        return (
            <View style={styles.item}>
                <ParallaxImage 
                    source={item.image || greenPhone}
                    containerStyle={styles.imageContainer} 
                    {...parallaxProps}
                />
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
            <Text style={styles.title}>
                {translate('RewardsScreen.header')} {rewards_unlocked} / {total_rewards}
            </Text>
            <View style={{flex: 1}} />
            <Carousel
            //   ref={(c) => { this._carousel = c; }}
              data={rewards}
              renderItem={renderItem}
              sliderWidth={screenWidth}
              sliderHeight={screenWidth}
              itemWidth={screenWidth - 60}
              hasParallaxImages={true}
              firstItem={rewards.findIndex(item => !item.fullfilled)}
            />
        </Screen>
    )
}))

RewardsScreen.navigationOptions = () => ({
    title: "Rewards"
})
