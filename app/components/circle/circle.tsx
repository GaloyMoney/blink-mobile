import { View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"

import { useCountUp } from "use-count-up"
import Icon from "react-native-vector-icons/Ionicons"
import { testProps } from "@app/utils/testProps"

type CircleProps = {
  heading: string
  value: number
  minValue?: number
  maxValue?: number
  description: string
  subtitle: string
  subtitleGreen?: boolean
  extraSubtitleLine?: string
  bubble?: boolean
  helpBtnModal?: React.ReactElement
  helpBtnModalEnable?: () => void
  countUpDuration?: number
}

export const Circle: React.FC<CircleProps> = ({
  heading,
  value,
  description,
  subtitle,
  subtitleGreen = false,
  extraSubtitleLine,
  bubble = false,
  minValue,
  maxValue,
  helpBtnModal,
  helpBtnModalEnable,
  countUpDuration = 0,
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles({
    subtitleGreen,
  })

  const { value: countUpValue } = useCountUp({
    isCounting: true,
    end: value,
    duration: countUpDuration,
  })

  const cBackValue = getcBackValue(Number(countUpValue), minValue, maxValue)

  const cBackStyles = {
    height: cBackValue,
    width: cBackValue,
    borderRadius: cBackValue / 2,
    marginLeft: -cBackValue / 2,
    marginTop: -cBackValue / 2,
  }

  return (
    <View style={styles.circleContainer}>
      <View style={styles.circleHeading}>
        <Text type="p1">{heading}</Text>
        {helpBtnModal && (
          <View style={styles.helpBtn}>
            {helpBtnModal}
            <Icon
              color={colors.primary}
              name="help-circle-outline"
              size={23}
              onPress={helpBtnModalEnable}
            />
          </View>
        )}
      </View>
      <View style={styles.circleValueWrapper}>
        <View>
          <Text {...testProps(`${heading}-value`)} style={styles.circleValue}>
            {countUpValue}
          </Text>
          {bubble && <View style={[styles.circleBubble, cBackStyles]} />}
        </View>
        <Text style={styles.circleDescription}>{description}</Text>
      </View>
      {subtitle && <Text style={styles.circleSubtitle}>{subtitle}</Text>}
      {extraSubtitleLine && (
        <Text style={styles.circleSubtitleExtra}>{extraSubtitleLine}</Text>
      )}
    </View>
  )
}

const useStyles = makeStyles(
  ({ colors }, { subtitleGreen }: { subtitleGreen?: boolean }) => {
    return {
      circleContainer: {
        marginLeft: "10%",
      },
      circleHeading: {
        marginBottom: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        columnGap: 8,
      },
      circleValueWrapper: {
        display: "flex",
        flexDirection: "row",
        columnGap: 10,
        justifyContent: "flex-start",
        alignItems: "center",
        marginBottom: 4,
        position: "relative",
        width: "100%",
      },
      circleValue: {
        fontWeight: "700",
        fontSize: 48,
        minWidth: 40,
        textAlign: "center",
      },
      circleDescription: {
        maxWidth: "35%",
        marginBottom: 6,
        lineHeight: 20,
        color: colors.grey2,
      },
      helpBtn: {
        alignSelf: "center",
      },
      circleSubtitle: {
        textAlign: "left",
        backgroundColor: subtitleGreen ? colors.green : colors.black,
        borderRadius: 10,
        paddingHorizontal: 10,
        alignSelf: "flex-start",
      },
      circleSubtitleExtra: { color: colors.black, marginTop: 4 },
      circleBubble: {
        position: "absolute",
        backgroundColor: colors.backdropWhiter,
        top: "50%",
        left: "50%",
      },
    }
  },
)

// ---------- HELPERS ----------
const easeOut = (x: number, minValue: number, maxValue: number) => {
  // Normalize x to 0-1 scale
  const xNorm = (x - minValue) / (maxValue - minValue)

  // ease-out formula
  return (-(xNorm - 1)) ** 4 + 1
}

const getcBackValue = (
  circleValue?: number,
  circleMinValue?: number,
  circleMaxValue?: number,
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

    const circleMinSizePx = 50
    const circleMaxSizePx = 1000

    cBackValue =
      circleMinSizePx +
      ((mappedValue - circleMinValue) / (circleMaxValue - circleMinValue)) *
        (circleMaxSizePx - circleMinSizePx)
  }
  return cBackValue
}
