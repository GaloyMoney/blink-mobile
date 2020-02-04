import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Dimensions, Platform, Image } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { observer, inject } from "mobx-react"
import { Onboarding, OnboardingRewards } from "types"
import Carousel, { ParallaxImage } from 'react-native-snap-carousel'
import { translate } from "../../i18n"
import I18n from 'i18n-js'
import { AccountType, CurrencyType } from "../../utils/enum"
import { Button } from "react-native-elements"


export const safeBank = require("./SafeBank.jpg")
export const globalCommunications = require("./GlobalCommunications.jpg")
export const greenPhone = require("./GreenPhone.jpg")
export const rewardsHeader = require("./RewardsHeader.png")
export const asterix = require("./Asterix.jpeg")
export const littleDipper = require("./LittleDipper.jpg")
export const bankAccount = require("./BankAccount.jpg")
export const password1234 = require("./Password1234.jpg")
export const pointOfSale = require("./PointOfSale.jpg")
export const inviteFriends = require("./InviteFriends.jpg")
export const lightningPayment = require("./LightningPayment.jpg")

const { width: screenWidth } = Dimensions.get('window')

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 60,
        height: screenWidth - 90,
        borderRadius: 32,
    },

    bottomItem: {
        backgroundColor: palette.white,
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderColor: palette.lightGrey,
        borderWidth: .25,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },

    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
    },

    header: {
        marginVertical: 20,
        alignItems: "center"
    },

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 40,
        textAlign: 'center',
    },

    titleSats: {
        fontSize: 48,
        fontWeight: 'bold',
        marginHorizontal: 40,
        textAlign: 'center',
        color: color.primary
    },

    textButton: {
        fontSize: 18,
        color: palette.darkGrey,
        backgroundColor: color.primary,
        marginHorizontal: 60,
        borderRadius: 24,
        bottom: -18,
    },

    satsButton: {
        fontSize: 18,
        color: palette.darkGrey,
        textAlign: "center",
    },

    itemTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 12,
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
            enabled: true,
        },
        {
            id: "activateNotifications",
            icon: 'ios-lock',
            action: () => navigate('enableNotifications'),
            image: globalCommunications,
            enabled: true,
        },
        {
            id: 'rewardsVideo',
            icon: 'ios-school',
            action: () => navigate('rewardsVideo'),
            image: asterix,
            enabled: true,
        },
        {
            id: 'channelCreated',
            icon: 'ios-school',
            action: () => navigate('welcomeSyncing'),
            image: littleDipper,
            enabled: true,
        },
        {
            id: 'firstLightningPayment',
            icon: 'ios-exit',
            action: () => navigate('sendBitcoin'),
            image: lightningPayment,
            enabled: dataStore.onboarding.has(Onboarding["channelCreated"]),
            enabledMessage: 'Open your channel first'
        },
        {
            id: "inviteAFriend",
            icon: 'ios-download',
            action: () => Alert.alert('TODO'),
            image: inviteFriends,
            enabled: dataStore.onboarding.has(Onboarding["channelCreated"]),
            enabledMessage: 'Open your channel first'
        },
        {
            id: 'bankOnboarded',
            icon: 'ios-gift',
            action: () => navigate('openBankAccount'),
            image: bankAccount,
            enabled: true,
        },
        {
            id: "debitCardActivation",
            icon: 'ios-exit',
            action: () => Alert.alert('TODO'),
            image: password1234,
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: 'Banking is needed'
        },
        {
            id: "firstCardSpending",
            icon: 'ios-power',
            action: () => Alert.alert('TODO'),
            image: pointOfSale,
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: 'Banking is needed'
        },
        {
            id: "activateDirectDeposit",
            icon: 'ios-cart',
            rewards: "1% card rewards!",
            action: () => Alert.alert('TODO'),
            enabled: dataStore.onboarding.has(Onboarding["bankOnboarded"]),
            enabledMessage: 'Banking is needed'
        },
    ]
    
    rewards.forEach(item => item['fullfilled'] = dataStore.onboarding.has(Onboarding[item.id]))

    const renderItem = ({item, index}, parallaxProps) => {
        return (
            <View style={styles.item}>
                <ParallaxImage 
                    source={item.image || greenPhone}
                    containerStyle={styles.imageContainer} 
                    {...parallaxProps}
                />
                <View style={styles.bottomItem}>
                    <Text style={styles.itemTitle}>
                        { translate(`RewardsScreen\.${item.id}.title`) }
                    </Text>
                    {/* <Text>
                        { translate(`RewardsScreen\.${item.id}.text`) }
                    </Text> */}
                    <Text style={styles.satsButton}>
                        { item.rewards 
                        || OnboardingRewards[item.id] && 
                        `+${I18n.toNumber(OnboardingRewards[item.id], {precision: 0})} sats`
                        }
                    </Text>
                    <Button 
                        onPress={ item.action } disabled={item.fullfilled || !item.enabled}
                        buttonStyle={styles.textButton}
                        // containerStyle={styles.}
                        title={item.fullfilled ? 
                            'Rewards received' :
                            item.enabled ? 'Get Rewards now!' : item.enabledMessage}
                        />
                </View>
            </View>
        )
    }

    return (
        <Screen>
            <View style={styles.header}>
                <Image source={rewardsHeader} style={{width: 120, height: 120, resizeMode: "contain"}} />
                <Text style={styles.title}>
                    {translate('RewardsScreen.header')}
                </Text>
                <Text style={styles.titleSats}>
                    {I18n.toNumber(dataStore.balances({ 
                        currency: CurrencyType.BTC, 
                        account: AccountType.BitcoinRealOrVirtual
                    }), {precision: 0})}
                </Text>
            </View>
            <View style={{flex: 1}} />
            <Carousel
            //   ref={(c) => { this._carousel = c; }}
              data={rewards}
              renderItem={renderItem}
              sliderWidth={screenWidth}
            //   sliderHeight={screenWidth}
              itemWidth={screenWidth - 60}
              hasParallaxImages={true}
              firstItem={rewards.findIndex(item => !item.fullfilled)}
            />
            <View style={{flex: 1}} />
        </Screen>
    )
}))

RewardsScreen.navigationOptions = () => ({
    title: translate("RewardsScreen.title")
})
