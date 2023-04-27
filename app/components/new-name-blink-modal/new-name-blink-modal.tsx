import { makeVar, useApolloClient } from "@apollo/client"
import { updateNewNameBlink } from "@app/graphql/client-only-query"
import { useNewNameBlinkCounterQuery } from "@app/graphql/generated"
import { useI18nContext } from "@app/i18n/i18n-react"
import { palette } from "@app/theme"
import { Button } from "@rneui/base"
import { makeStyles, useTheme } from "@rneui/themed"
import * as React from "react"
import { Image, Linking, Text, View } from "react-native"
import Modal from "react-native-modal"
import BlinkLight from "../../assets/images/blink_modal_lightmode.png"
import BlinkDark from "../../assets/images/blink_modal_darkmode.png"
import { testProps } from "../../utils/testProps"
import { ScrollView } from "react-native-gesture-handler"

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    height: 150,
    marginBottom: 16,
  },
  image: {
    flex: 1,
    width: "100%",
  },
  modalCard: {
    backgroundColor: theme.colors.white,
    paddingLeft: 18,
    paddingRight: 18,
    maxHeight: "75%",
  },
  cardTitleContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 28,
    color: theme.colors.black,
  },
  cardBodyContainer: {
    marginBottom: 16,
  },
  cardBodyText: {
    lineHeight: 24,
    fontSize: 16,
    color: theme.colors.black,
  },
  okText: {
    textDecorationLine: "underline",
  },
  cardActionsContainer: {
    flexDirection: "column",
    paddingBottom: 20,
  },
  homeButton: {
    backgroundColor: palette.blue,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  learnMoreButton: {
    backgroundColor: theme.colors.white,
  },
  learnMoreButtonText: {
    color: palette.blue,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    maxHeight: "75%",
    borderRadius: 16,
    paddingTop: 10,
  },
}))

const hasBeenValidatedSinceAppLaunch = makeVar(false)

export const NewNameBlinkModal: React.FC = () => {
  const { LL } = useI18nContext()
  const styles = useStyles()
  const {
    theme: { mode },
  } = useTheme()

  const isDarkMode = mode === "dark"

  const query = useNewNameBlinkCounterQuery()
  const newNameBlinkCounter = query.data?.newNameBlinkCounter ?? 0
  const isVisible = newNameBlinkCounter < 3 && !hasBeenValidatedSinceAppLaunch()

  const client = useApolloClient()
  const acknowledgeModal = () => {
    hasBeenValidatedSinceAppLaunch(true)
    updateNewNameBlink(client, newNameBlinkCounter)
  }

  return (
    <Modal isVisible={isVisible} backdropOpacity={0.3}>
      <View style={styles.container}>
        <ScrollView
          style={styles.modalCard}
          indicatorStyle={isDarkMode ? "white" : "black"}
        >
          <View style={styles.imageContainer}>
            <Image
              source={isDarkMode ? BlinkDark : BlinkLight}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitleText}>{LL.NewNameBlinkModal.header()}</Text>
          </View>
          <View style={styles.cardBodyContainer}>
            <Text style={styles.cardBodyText}>{LL.NewNameBlinkModal.body()}</Text>
          </View>
        </ScrollView>
        <View style={styles.cardActionsContainer}>
          <Button
            {...testProps(LL.NewNameBlinkModal.ok())}
            title={LL.NewNameBlinkModal.ok()}
            onPress={acknowledgeModal}
            buttonStyle={styles.homeButton}
          />
          <Button
            title={LL.NewNameBlinkModal.learnMore()}
            buttonStyle={styles.learnMoreButton}
            titleStyle={styles.learnMoreButtonText}
            onPress={() => Linking.openURL("https://www.blink.sv")}
          />
        </View>
      </View>
    </Modal>
  )
}
