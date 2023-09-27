import { View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIcon } from "../atomic/galoy-icon"
import { useEffect, useState } from "react"
import { OctoberChallengeModal } from "./modal"
import { PressableCard } from "../pressable-card"

import { OCT_1_EPOCH, OCT_31_12_PM_UTC_MINUS_6 } from "./dates"

function secondsToDDMMSS(totalSeconds: number) {
  if (totalSeconds < 0) return ""

  const days = Math.floor(totalSeconds / 86400) // There are 86400 seconds in a day
  const hours = Math.floor((totalSeconds - days * 86400) / 3600) // 3600 seconds in an hour
  const minutes = Math.floor((totalSeconds - days * 86400 - hours * 3600) / 60)
  const seconds = Math.floor(totalSeconds - days * 86400 - hours * 3600 - minutes * 60)

  const formattedDays = days.toString().padStart(2, "0")
  const formattedHours = hours.toString().padStart(2, "0")
  const formattedMinutes = minutes.toString().padStart(2, "0")
  const formattedSeconds = seconds.toString().padStart(2, "0")

  return `${formattedDays}:${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}

const getTimeLeft = () => {
  const dateNow = Date.now()
  if (dateNow > OCT_31_12_PM_UTC_MINUS_6 || dateNow < OCT_1_EPOCH) return ""

  const sLeft = (OCT_31_12_PM_UTC_MINUS_6 - dateNow) / 1000
  return secondsToDDMMSS(sLeft)
}

export const OctoberChallengeCard: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const openModal = () => setModalIsOpen(true)

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()

  const [countDown, setCountDown] = useState(getTimeLeft())

  useEffect(() => {
    const dateNow = Date.now()
    if (dateNow > OCT_31_12_PM_UTC_MINUS_6) return

    const t = setInterval(() => {
      setCountDown(getTimeLeft())
    }, 1000)

    return () => clearInterval(t)
  }, [setCountDown])

  if (Date.now() > OCT_31_12_PM_UTC_MINUS_6) return <></>

  return (
    <PressableCard onPress={openModal}>
      <OctoberChallengeModal isVisible={modalIsOpen} setIsVisible={setModalIsOpen} />
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <View style={styles.beside}>
            <Text type="p1" bold>
              {LL.Circles.octoberChallenge.title()}
            </Text>
            <Text color={colors.grey3}>{countDown}</Text>
          </View>
          <Text type="p2">{LL.Circles.octoberChallenge.description()}</Text>
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
