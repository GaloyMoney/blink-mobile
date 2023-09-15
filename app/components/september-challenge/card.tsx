import { TouchableOpacity, View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import { useI18nContext } from "@app/i18n/i18n-react"
import { GaloyIcon } from "../atomic/galoy-icon"
import { useEffect, useState } from "react"
import { SeptemberChallengeModal } from "./modal"
import { useCirclesQuery } from "@app/graphql/generated"

import { OCT_1_EPOCH, SEPT_1_EPOCH } from "./dates"

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

export const SeptemberChallengeCard: React.FC = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const openModal = () => setModalIsOpen(true)

  const { data } = useCirclesQuery()

  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()
  const { LL } = useI18nContext()

  const [countDown, setCountDown] = useState("")

  useEffect(() => {
    const dateNow = Date.now()
    if (dateNow > OCT_1_EPOCH) return

    const t = setInterval(() => {
      const dateNow = Date.now()

      if (dateNow > SEPT_1_EPOCH) {
        const sLeft = (OCT_1_EPOCH - dateNow) / 1000
        if (sLeft < 10 * 24 * 60 * 60)
          // display when less than 10 days are left to end
          setCountDown(secondsToDDMMSS(sLeft))
      } else {
        const sLeft = (SEPT_1_EPOCH - dateNow) / 1000
        setCountDown(secondsToDDMMSS(sLeft))
      }
    }, 1000)

    return () => clearInterval(t)
  }, [setCountDown])

  if (Date.now() > OCT_1_EPOCH) return <></>

  return (
    <TouchableOpacity onPress={openModal}>
      <SeptemberChallengeModal isVisible={modalIsOpen} setIsVisible={setModalIsOpen} />
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <View style={styles.beside}>
            <Text type="p1" bold>
              {LL.Circles.septChallenge.title()}
            </Text>
            <Text color={colors.grey3}>{countDown}</Text>
          </View>
          <Text type="p2">
            {LL.Circles.septChallenge.description({
              innerCircle:
                Date.now() < SEPT_1_EPOCH
                  ? 0
                  : data?.me?.defaultAccount.welcomeProfile?.innerCircleThisMonthCount ||
                    0,
            })}
          </Text>
        </View>
        <View>
          <GaloyIcon color={colors.primary} size={28} name="rank" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  card: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderColor: colors.grey4,
    borderWidth: 0.5,
    borderRadius: 10,
    marginBottom: -10,
  },
  textContainer: {
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
