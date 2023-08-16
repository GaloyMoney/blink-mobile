import { View } from "react-native"
import { Text, makeStyles } from "@rneui/themed"

import { ModalTooltip } from "@app/components/modal-tooltip/modal-tooltip"
import { useCountUp } from "use-count-up"

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
  countUpDuration?: number
}

export const Circle: React.FC<CircleProps> = ({
  heading,
  value,
  description,
  subtitle,
  subtitleGreen = false,
  bubble = false,
  minValue = 1,
  maxValue = 100,
  tooltip,
  countUpDuration = 0,
}) => {
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
      <Text style={styles.circleHeading} type="p1">
        {heading}
      </Text>
      <View style={styles.circleValueWrapper}>
        <View>
          <Text style={styles.circleValue}>{countUpValue}</Text>
          {bubble && <View style={[styles.circleBubble, cBackStyles]} />}
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

const useStyles = makeStyles(
  ({ colors }, { subtitleGreen }: { subtitleGreen?: boolean }) => {
    return {
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
        minWidth: 40,
        textAlign: "center",
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

  // Quadratic ease-out formula
  return (-(xNorm - 1)) ** 2 + 1
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

    // a to b is the range of pixels for the circle drawn
    const a = 50
    const b = 1000

    cBackValue =
      a + ((mappedValue - circleMinValue) / (circleMaxValue - circleMinValue)) * (b - a)
  }
  return cBackValue
}