import * as React from "react"
import { useState, useEffect } from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, View, Dimensions, Platform, Animated } from "react-native"
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
import { sleep } from "../../utils/sleep"
import { Notifications, RegistrationError } from "react-native-notifications"
import functions from "@react-native-firebase/functions"
import { YouTubeStandaloneIOS } from "react-native-youtube"


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
        // height: screenWidth - 90,
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
        height: 200,
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
        fontWeight: 'bold',
        marginHorizontal: 40,
        textAlign: 'center',
        color: palette.darkGrey
    },

    text: {
        marginHorizontal: 20,
        textAlign: 'center',
        fontSize: 22,
        color: palette.darkGrey
    },

    titleSats: {
        fontWeight: 'bold',
        fontSize: 32,
        marginHorizontal: 40,
        textAlign: 'center',
        color: color.primary
    },

    textButton: {
        backgroundColor: color.primary,
        marginHorizontal: 60,
        borderRadius: 24,
        bottom: -18,
    },

    textButtonClose: {
        backgroundColor: palette.darkGrey,
        paddingHorizontal: 60,
        marginTop: 10,
    },

    satsButton: {
        fontSize: 18,
        color: palette.darkGrey,
        textAlign: "center",
    },

    itemTitle: {
        fontSize: 20,
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
    const [ openReward, setOpenReward ] = useState(0)
    const [ currReward, setCurrReward ] = useState("")
    const [ loading, setLoading ] = useState(false)
    const [err, setErr] = useState("")

    const [animation] = useState(new Animated.Value(0))

    const open = (index) => {
        setCurrReward(rewards[index].id)
        setOpenReward(openReward === 1 ? 0 : 1)
    }

    const close = (msg = "") => {
        setOpenReward(0)
        setLoading(false)
        if (msg !== "") {
            Alert.alert(msg)
        }
    }

    React.useEffect(() => {
        Animated.timing(animation, {
            toValue: openReward,
            duration: 500,
            useNativeDriver: false,
        }).start()

    }, [openReward])

    useEffect(() => {
        if (err !== "") {
          setErr("")
          Alert.alert("error", err, [
            {
              text: "OK",
              onPress: () => {
                setLoading(false)
              },
            },
          ])
        }
      }, [err])

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
            action: async () => {
                setLoading(true)
                await sleep(2000)
                await dataStore.onboarding.add(Onboarding.backupWallet)
                close("Backup keys saved to iCloud")
            },
            image: safeBank,
            enabled: true,
        },
        {
            id: "activateNotifications",
            icon: 'ios-lock',
            action: () => {

                Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
                    console.tron.log("Registered For Remote Push", `Device Token: ${event.deviceToken}`)
            
                    try {
                        setLoading(true)
                        await functions().httpsCallable("sendDeviceToken")({deviceToken: event.deviceToken})
                        await dataStore.onboarding.add(Onboarding.activateNotifications)
                        close("Notification succesfully activated")
                    } catch (err) {
                        console.tron.log(err.toString())
                        setErr(err.toString())
                    }
                })
                
                Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
                    Alert.alert("Failed To Register For Remote Push", `Error (${event})`)
                })

                Notifications.registerRemoteNotifications()
                
            },
            image: globalCommunications,
            enabled: true,
        },
        {
            id: 'rewardsVideo',
            icon: 'ios-school',
            action: async () => {
                try {
                    await YouTubeStandaloneIOS.playVideo("XNu5ppFZbHo")
                    await dataStore.onboarding.add(Onboarding.rewardsVideo)
                } catch (err) {
                    console.tron.error(err)
                    Alert.alert(err.toString())
                }
            },
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

    const inverse = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    })

    const sats = (id) => `+${I18n.toNumber(OnboardingRewards[id], {precision: 0})} sats`

    const renderItem = ({item, index}, parallaxProps) => {
        return (
            <Animated.View style={styles.item}>
                <ParallaxImage 
                    source={item.image || greenPhone}
                    containerStyle={styles.imageContainer} 
                    {...parallaxProps}
                />
                <View style={styles.bottomItem}>
                    <Text style={styles.itemTitle}>
                        { translate(`RewardsScreen\.${item.id}.title`) }
                    </Text>
                    <Animated.ScrollView
                        style={[{
                            height: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 140],
                        }),
                            opacity: animation,
                        }]}>
                        <Animated.Text 
                            style={[ styles.text, ]}>
                            { translate(`RewardsScreen\.${item.id}.text`) }
                        </Animated.Text>
                    </Animated.ScrollView>
                    <Animated.Text style={[styles.satsButton, {opacity: inverse}]}>
                        { item.rewards 
                        || OnboardingRewards[item.id] && 
                          sats(item.id)
                        }
                    </Animated.Text>
                    <Button 
                        onPress={ () => {
                            openReward ?
                                item.action() :
                                open(index)
                        }} 
                        disabled={item.fullfilled || !item.enabled}
                        buttonStyle={styles.textButton}
                        // containerStyle={styles.}
                        title={item.fullfilled ? 
                            'Rewards received' :
                            item.enabled ? 
                                openReward ?
                                    'Get Rewards Now!' :
                                    'Learn More' :
                                item.enabledMessage
                            }
                        loading={loading}
                        />
                </View>
            </Animated.View>
        )
    }

    return (
        <Screen style={{
            justifyContent: 'flex-end', flex: 1,
            }}>
                <Animated.View 
                    style={[styles.header]}
                    >
                    <Animated.Image source={rewardsHeader} 
                        style={[
                            {
                                height: animation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [120, 0],
                                }),
                            }
                        ]
                        } />
                    <Animated.Text style={[styles.title,
                        {
                            fontSize: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [28, 0.1],
                            }),
                        }]}>
                        {translate('RewardsScreen.header')}
                    </Animated.Text>
                    <Animated.Text style={[
                        styles.titleSats,
                    ]}>
                        {openReward ? 
                            `${sats(currReward)}` :
                            I18n.toNumber(dataStore.balances({ 
                                currency: CurrencyType.BTC, 
                                account: AccountType.BitcoinRealOrVirtual
                            }), {precision: 0})
                        }
                    </Animated.Text>
                    { openReward === 1 &&
                        <Button 
                            title="Close" 
                            buttonStyle={styles.textButtonClose}
                            onPress={() => close()}
                        />
                    }
                </Animated.View>
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
        </Screen>
    )
}))

RewardsScreen.navigationOptions = () => ({
    title: translate("RewardsScreen.title")
})
