import { View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import Icon from "react-native-vector-icons/Ionicons"

import { Screen } from "@app/components/screen"
import { InviteFriendsCard } from "./invite-friends-card"
import { ModalTooltip } from "@app/components/modal-tooltip/modal-tooltip"

export const CirclesDashboardHeaderRight: React.FC = () => {
  const styles = useStyles()

  return <Icon style={styles.shareButton} name="share-social-outline" />
}

type CircleProps = {
  heading: string
  value: number
  minValue?: number
  maxValue?: number
  description: string
  subtitle: string
  subtitleGreen?: boolean
  bubble?: boolean
  tooltip?: string
}

const Circle: React.FC<CircleProps> = ({
  heading,
  value,
  description,
  subtitle,
  subtitleGreen = false,
  bubble = false,
  minValue = 1,
  maxValue = 100,
  tooltip,
}) => {
  let styles
  if (bubble)
    styles = useStyles({
      subtitleGreen,
      circleMinValue: minValue,
      circleMaxValue: maxValue,
      circleValue: value,
    })
  else styles = useStyles({ subtitleGreen })

  return (
    <View style={styles.circleContainer}>
      <Text style={styles.circleHeading} type="p1">
        {heading}
      </Text>
      <View style={styles.circleValueWrapper}>
        <View>
          <Text style={styles.circleValue}>{value}</Text>
          {bubble && <View style={styles.circleBubble} />}
        </View>
        <Text style={styles.circleDescription}>{description}</Text>
        {tooltip && (
          <View style={styles.circleTooltip}>
            <ModalTooltip type="info" text={tooltip} size={20} />
          </View>
        )}
      </View>
      <Text style={styles.circleSubtitle}>{subtitle}</Text>
    </View>
  )
}

export const CirclesDashboardScreen: React.FC = () => {
  const styles = useStyles()

  return (
    <Screen style={styles.screen} preset="scroll">
      <Text style={styles.description} type="p2">
        Your inner circle grows when you send a Blink user their first sats!
      </Text>
      <Circle
        heading="Inner circle"
        value={21}
        minValue={1}
        maxValue={150}
        description="people you onboarded"
        subtitle="+3 this month"
        subtitleGreen
        bubble
      />
      <Circle
        heading="Outer circle"
        value={459}
        minValue={1}
        maxValue={800}
        description="people onboarded by your inner circle"
        subtitle="+34 this month"
        subtitleGreen
        bubble
      />
      <Circle
        heading="Your sphere"
        value={740}
        description="points"
        subtitle="4 degrees of separation achieved"
        tooltip="Total how much of an impact you are making"
      />
      <InviteFriendsCard />
    </Screen>
  )
}

const easeOut = (x: number, minValue: number, maxValue: number) => {
  // Normalize x to 0-1 scale
  const xNorm = (x - minValue) / (maxValue - minValue)

  // Quadratic ease-out formula
  return (-(xNorm - 1)) ** 2 + 1
}

const useStyles = makeStyles(
  (
    { colors },
    {
      subtitleGreen,
      circleMinValue,
      circleMaxValue,
      circleValue,
    }: {
      subtitleGreen?: boolean
      circleMinValue?: number
      circleMaxValue?: number
      circleValue?: number
    },
  ) => {
    let cBackValue = 0

    if (
      typeof circleValue !== "undefined" &&
      typeof circleMinValue !== "undefined" &&
      typeof circleMaxValue !== "undefined"
    ) {
      let mappedValue
      if (circleMinValue <= circleValue && circleValue <= circleMaxValue)
        mappedValue = easeOut(circleValue, circleMinValue, circleMaxValue) * circleValue
      else if (circleMinValue > circleValue) mappedValue = circleMinValue
      else mappedValue = circleMaxValue

      // a to b is the range of pixels for the circle drawn
      const a = 50
      const b = 300

      cBackValue =
        a + ((mappedValue - circleMinValue) / (circleMaxValue - circleMinValue)) * (b - a)
    }

    return {
      shareButton: {
        fontSize: 22,
        color: colors.black,
        paddingRight: 10,
      },
      screen: {
        padding: 20,
        display: "flex",
        flexDirection: "column",
        rowGap: 40,
      },
      description: {
        color: colors.grey3,
      },
      circleContainer: {
        marginLeft: "10%",
      },
      circleHeading: { marginBottom: 8 },
      circleValueWrapper: {
        display: "flex",
        flexDirection: "row",
        columnGap: 10,
        justifyContent: "flex-start",
        alignItems: "flex-end",
        marginBottom: 4,
        position: "relative",
        width: "100%",
      },
      circleValue: {
        fontWeight: "700",
        fontSize: 48,
      },
      circleDescription: {
        maxWidth: "40%",
        marginBottom: 6,
      },
      circleTooltip: {
        marginBottom: 4,
      },
      circleSubtitle: {
        color: subtitleGreen ? colors.green : colors.black,
      },
      circleBubble: {
        position: "absolute",
        backgroundColor: colors.backdropWhiter,
        height: cBackValue,
        width: cBackValue,
        borderRadius: cBackValue / 2,
        top: "50%",
        left: "50%",
        marginLeft: -cBackValue / 2,
        marginTop: -cBackValue / 2,
      },
    }
  },
)
