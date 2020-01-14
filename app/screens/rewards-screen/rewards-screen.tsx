import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, Image } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"

export const presentLogo = require("../welcome-screens/PresentLogo.png")


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

    image: {
        alignSelf: "center",
        padding: 20,
    },
})

export const RewardsScreen = () => {

    const { navigate } = useNavigation()

    const bank = [
        {
            title: 'Backup wallet',
            icon: 'ios-lock'
        },
        {
            title: "Make a payment",
            icon: 'ios-exit'
        },
        {
            title: 'Learn about Bitcoin',
            icon: 'ios-school'
        },
        {
            title: "Open a Galoy bank account",
            icon: 'ios-gift'
        }
      ]

    return (
        <Screen>
            <Image source={presentLogo} style={styles.image} />
            <Text>Complete the task below to earn more bitcoin rewards!</Text>
            {
                bank.map((item, i) => (
                <ListItem
                    titleStyle={styles.text}
                    style={styles.button}
                    key={i}
                    title={item.title}
                    leftIcon={<Icon name={item.icon} style={styles.icon} size={32} color={color.primary} />}
                    onPress={() => Alert.alert('TODO')}
                    chevron
                />
                ))
            }
        </Screen>
    )
}

RewardsScreen.navigationOptions = () => ({
    title: "Rewards"
})