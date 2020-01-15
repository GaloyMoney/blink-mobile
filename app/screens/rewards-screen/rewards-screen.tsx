import * as React from "react"
import { Screen } from "../../components/screen"
import { StyleSheet, Alert, Image, ScrollView } from "react-native"
import { Text } from "../../components/text"
import { color } from "../../theme"
import { ListItem, Badge } from 'react-native-elements'
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "react-navigation-hooks"
import { palette } from "../../theme/palette"

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
        // borderColor: color.primary,
        // borderWidth: 1,
        // borderRadius: 6,
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
})

export const RewardsScreen = () => {

    const { navigate } = useNavigation()

    const bank = [
        {
            title: 'Backup wallet',
            icon: 'ios-lock',
            badge: "+1,000 sats",
        },
        {
            title: "Make a payment",
            icon: 'ios-exit',
            badge: "+1,000 sats",
        },
        {
            title: 'Learn about Bitcoin',
            icon: 'ios-school',
            badge: "+1,000 sats",
        },
        {
            title: "Open a Galoy bank account",
            icon: 'ios-gift',
            badge: "+100,000 sats",
        }
      ]

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
                        onPress={() => Alert.alert('TODO')}
                        badge={{value:item.badge, badgeStyle: {backgroundColor: color.primary}}}
                        chevron
                    />
                    ))
                }
            </ScrollView>
        </Screen>
    )
}

RewardsScreen.navigationOptions = () => ({
    title: "Rewards"
})