import { useEffect, useState } from "react"
import { View } from "react-native"

import { useI18nContext } from "@app/i18n/i18n-react"
import {
  APR_1_2024_12_AM_UTC_MINUS_6,
  MAR_1_2024_12_AM_UTC_MINUS_6,
  getTimeLeft,
} from "@app/utils/date"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import { GaloyIcon } from "../atomic/galoy-icon"
import { PressableCard } from "../pressable-card"
import { MarchChallengeModal } from "./modal"

export const MarchChallengeCard: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const openModal = () => setModalIsOpen(true)

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()

  const [countDown, setCountDown] = useState(
    getTimeLeft({
      after: MAR_1_2024_12_AM_UTC_MINUS_6,
      until: APR_1_2024_12_AM_UTC_MINUS_6,
    }),
  )

  useEffect(() => {
    const dateNow = Date.now()
    if (dateNow > APR_1_2024_12_AM_UTC_MINUS_6) return

    const t = setInterval(() => {
      setCountDown(
        getTimeLeft({
          after: MAR_1_2024_12_AM_UTC_MINUS_6,
          until: APR_1_2024_12_AM_UTC_MINUS_6,
        }),
      )
    }, 1000)

    return () => clearInterval(t)
  }, [setCountDown])

  const currentTime = Date.now()
  if (
    currentTime > APR_1_2024_12_AM_UTC_MINUS_6 ||
    currentTime < MAR_1_2024_12_AM_UTC_MINUS_6
  )
    return <></>

  return (
    <PressableCard onPress={openModal}>
      <MarchChallengeModal isVisible={modalIsOpen} setIsVisible={setModalIsOpen} />
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <View style={styles.beside}>
            <Text type="p1" bold>
              {LL.Circles.marchChallenge.title()}
            </Text>
            <Text color={colors.grey3}>{countDown}</Text>
          </View>
          <Text type="p2">{LL.Circles.marchChallenge.description()}</Text>
        </View>
        <View>
          <GaloyIcon color={colors.primary} size={28} name="rank" />
        </View>
      </View>
    </PressableCard>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  card: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 10,
    backgroundColor: colors.grey5,
  },
  textContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    rowGap: 6,
  },
  beside: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
}))
