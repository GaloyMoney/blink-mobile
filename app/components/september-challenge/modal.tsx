import * as React from "react"
import { Linking, View } from "react-native"
import Modal from "react-native-modal"

import { useI18nContext } from "@app/i18n/i18n-react"
import { makeStyles, useTheme, Text } from "@rneui/themed"

import { GaloyIconButton } from "../atomic/galoy-icon-button"
import { GaloyToast } from "../galoy-toast"
import { GaloyIcon } from "../atomic/galoy-icon"
import { useCirclesQuery } from "@app/graphql/generated"

import { OCT_1_EPOCH, SEPT_1_EPOCH } from "./dates"

const CHALLENGE_PAGE = "blink.sv/circles"
const CHALLENGE_PAGE_URL = "https://www.blink.sv/circles"

type Props = {
  isVisible: boolean
  setIsVisible: (isVisible: boolean) => void
}

export const SeptemberChallengeModal: React.FC<Props> = ({ isVisible, setIsVisible }) => {
  const { LL } = useI18nContext()

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const { data } = useCirclesQuery({
    fetchPolicy: "cache-first",
  })

  const isLonely =
    data?.me?.defaultAccount.welcomeProfile === null ||
    data?.me?.defaultAccount.welcomeProfile?.innerCircleAllTimeCount === 0

  const isSept = Date.now() > SEPT_1_EPOCH && Date.now() < OCT_1_EPOCH

  const innerCircle = isSept
    ? (data?.me?.defaultAccount.welcomeProfile?.innerCircleThisMonthCount || 0) + "/21"
    : "0/21"
  const rank = isSept
    ? data?.me?.defaultAccount.welcomeProfile?.thisMonthRank
      ? `#${data?.me?.defaultAccount.welcomeProfile?.thisMonthRank}`
      : "-"
    : "-"

  const acknowledgeModal = () => {
    setIsVisible(false)
  }

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.8}
      backdropTransitionOutTiming={0}
      backdropColor={colors.white}
      onBackdropPress={acknowledgeModal}
    >
      <View style={styles.modalCard}>
        <View style={styles.container}>
          <GaloyIconButton
            style={styles.cross}
            name="close"
            size="medium"
            onPress={acknowledgeModal}
          />
          <GaloyIcon style={styles.top} name="rank" size={40} color={colors.primary} />
          <Text type="h1" bold>
            {LL.Circles.septChallenge.title()}
          </Text>
          <Text type="p1" style={styles.details}>
            {LL.Circles.septChallenge.details()}
          </Text>
          {!isLonely && (
            <>
              <View style={styles.containerData}>
                <Text type="h1">{innerCircle}</Text>
                <Text type="p3" color={colors.grey3}>
                  {LL.Circles.septChallenge.peopleWelcomedSoFar()}
                </Text>
              </View>
              <View style={styles.containerData}>
                <Text type="h1">{rank}</Text>
                <Text type="p3" color={colors.grey3}>
                  {LL.Circles.septChallenge.yourRank()}
                </Text>
              </View>
            </>
          )}
          <Text style={styles.reminder} type="p3" color={colors.grey3}>
            {LL.Circles.septChallenge.reminder()}
          </Text>
          <Text style={styles.reminder} type="p3">
            {LL.Circles.septChallenge.fullDetails()}{" "}
            <Text
              style={styles.underline}
              color={colors.grey3}
              onPress={() => Linking.openURL(CHALLENGE_PAGE_URL)}
            >
              {CHALLENGE_PAGE}
            </Text>
          </Text>
        </View>
      </View>
      <GaloyToast />
    </Modal>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    paddingHorizontal: 12,
    display: "flex",
    flexDirection: "column",
    rowGap: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cross: {
    position: "absolute",
    right: 20,
    top: -10,
  },
  top: { marginTop: 40 },
  modalCard: {
    backgroundColor: colors.grey5,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  details: {
    textAlign: "center",
    paddingHorizontal: 20,
  },
  reminder: {
    textAlign: "center",
    paddingHorizontal: 20,
    color: colors.grey3,
  },
  underline: {
    textDecorationLine: "underline",
  },
  containerData: {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
    justifyContent: "center",
    alignItems: "center",
  },
}))
