import * as React from "react"
import { Text, View, Alert, StyleSheet, ScrollView } from "react-native"
import { Screen } from "../../components/screen"
import { Button } from 'react-native-elements';
import { color } from "../../theme";
import { palette } from "../../theme/palette"


const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        color: palette.darkGrey,
        fontWeight: "bold",
        marginVertical: 10
    },

    subtitle: {
        fontSize: 18,
        color: palette.darkGrey,
        fontWeight: "bold",
        marginVertical: 10
    },

    text: {
        fontSize: 16,
        color: palette.darkGrey,
        marginVertical: 15
    },

    horizontalContainer: {
        flexDirection: "row",
    },

    buttonStyle: {
        backgroundColor: color.primary,
        marginVertical: 10,
    },

    screenMargin: {
        marginHorizontal: 30,
        marginVertical: 30
    }

})



export const DirectDepositScreen: React.FC = () => {

    const Row = ({type, value}) => (
        <View style={styles.horizontalContainer}>
            <Text style={styles.text}>{type}</Text>
            <View style={{flex: 1}}></View>
            <Text style={styles.text}>{value}</Text>
        </View>
    )

    return (
        <Screen>
            <ScrollView>
                <View style={styles.screenMargin}>
                    <Text style={styles.title}>Set up direct deposit</Text>
                    <Text style={styles.text}>Generate a direct deposit form for your employer or payroll provider.</Text>
                    <Text style={styles.subtitle}>Galoy Checking</Text>
                    <Row type="Routing" value="137284391" />
                    <Row type="Account" value="3849120438" />
                    <Row type="Bank name" value="Partner Bank & Trust" />
                    <Button 
                        buttonStyle={styles.buttonStyle}
                        title="Move My Paycheck!" onPress={() => Alert.alert("We're still implementing direct deposit")}
                        />
                </View>
            </ScrollView>
        </Screen>
    )
}

DirectDepositScreen.navigationOptions = () => ({
    title: "Direct Deposit"
})
