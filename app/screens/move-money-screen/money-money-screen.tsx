import * as React from "react"
import { useState } from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, ScrollView, View } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem, Button } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"
import { inject } from "mobx-react"
import { Onboarding } from "types"
import { translate } from "../../i18n"
import Modal from "react-native-modal"
import { AccountType, FirstChannelStatus } from "../../utils/enum"


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
        marginLeft: 20,
        backgroundColor: color.primary
    },

    icon: {
        marginRight: 12,
        textAlign: "center",
        width: 32,
    },
    
    flex: {
        flex: 1,
    },

    viewModal: {
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        height: 200,
        backgroundColor: palette.white,
        alignItems: "center",
    },

    buttonContainer: {
        marginTop: 24,
        paddingHorizontal: 15,
        flex: 1
    },

})

export const MoveMoneyScreen = inject("dataStore")(
    ({ dataStore }) => {

    const { navigate } = useNavigation()

    const [ modalVisible, setModalVisible ] = useState(false);
    const [ feature, setFeature ] = useState(["", ""])

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
            target: 'scanningQRCode',
        },
        {
            icon: 'ios-download',
            target: 'receiveBitcoin',
        }
      ]

    const onBankClick = ({target, title}) => {
        if (dataStore.onboarding.has(Onboarding.bankOnboarded)) {
            navigate(target, {title})
        } else {
            setFeature([AccountType.Bank, target])
            setModalVisible(true)
        }
    }

    const onBitcoinClick = ({target}) => {
        if (dataStore.lnd.statusFirstChannel === FirstChannelStatus.opened) {
            navigate(target)
        } else {
            setFeature([AccountType.Bitcoin, target])
            setModalVisible(true)
        }
    }

    // FIXME refactor to utils
    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    return (
        <Screen>
            <Modal 
                style={{marginHorizontal: 0, marginBottom: 0}}
                isVisible={modalVisible} 
                swipeDirection={modalVisible ? ['down'] : ['up']}
                onSwipeComplete={() => setModalVisible(false)}
                swipeThreshold={50}
            >
                {/* <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.flex} /> 
                </TouchableWithoutFeedback> */}
                <View style={styles.flex} />
                <View style={styles.viewModal}>
                <Icon name={"ios-remove"} size={64} color={palette.lightGrey} style={{height: 34, top: -22}} />
                { feature[0] == AccountType.Bank &&
                <>
                    <Text style={styles.text}>{translate("MoveMoneyScreen.needBankAccount", {feature: feature[1]})}</Text>
                    <Button title={translate("MoveMoneyScreen.openAccount")} onPress={() => {setModalVisible(false); navigate('openBankAccount')}}
                        buttonStyle={styles.button}
                        containerStyle={[styles.buttonContainer, {width: "100%"}]}
                    />
                </>
                }
                { feature[0] == AccountType.Bitcoin &&
                <>
                    <Text style={styles.text}>{translate("MoveMoneyScreen.needWallet", {feature: feature[1]})}</Text>
                    <Button title={translate("MoveMoneyScreen.openWallet")} onPress={() => {setModalVisible(false); navigate('rewards')}}
                        buttonStyle={styles.button}
                        containerStyle={[styles.buttonContainer, {width: "100%"}]}
                    />
                </>
                }
                </View>
            </Modal>
            <ScrollView>
                <Text style={styles.headerSection}>{translate('common.bank')}</Text>
                {
                    bank.map((item, i) => (
                    <ListItem
                        titleStyle={styles.text}
                        style={styles.button}
                        key={i}
                        title={translate(`${capitalize(item.target)}Screen.title`)}
                        leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                        onPress={() => onBankClick(item)}
                        chevron
                    />
                    ))
                }
                <Text style={styles.headerSection}>{translate('common.bitcoin')}</Text>
                {
                    bitcoin.map((item, i) => (
                    <ListItem
                        titleStyle={styles.text}
                        style={styles.button}
                        key={i}
                        title={translate(`${capitalize(item.target)}Screen.title`)}
                        leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                        onPress={() => onBitcoinClick(item)}
                        chevron
                    />
                    ))
                }
            </ScrollView>
        </Screen>
    )
})

MoveMoneyScreen.navigationOptions = () => ({
    title: translate("MoveMoneyScreen.title")
})