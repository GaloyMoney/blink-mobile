import { useState } from "react"
import { ActivityIndicator, TouchableWithoutFeedback, View } from "react-native"
import { makeStyles, Icon, Text, Skeleton } from "@rneui/themed"

type Props = {
  title: string
  subtitle?: string
  subtitleShorter?: boolean
  leftIcon: string
  rightIcon?: string | null
  extraComponentBesideTitle?: React.ReactElement
  action: () => void | Promise<void>
  rightIconAction?: () => void | Promise<void>
  loading?: boolean
  spinner?: boolean
}

export const SettingsRow: React.FC<Props> = ({
  title,
  subtitle,
  subtitleShorter,
  leftIcon,
  rightIcon,
  action,
  rightIconAction = () => {},
  extraComponentBesideTitle = <></>,
  loading,
  spinner,
}) => {
  const [hovering, setHovering] = useState(false)
  const styles = useStyles({ hovering })

  if (loading) return <Skeleton style={styles.container} animation="pulse" />
  if (spinner)
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator />
      </View>
    )

  const RightIcon = rightIcon !== null && (
    <Icon name={rightIcon ? rightIcon : "chevron-forward"} type="ionicon" />
  )

  return (
    <TouchableWithoutFeedback
      onPressIn={() => setHovering(true)}
      onPressOut={() => setHovering(false)}
      onPress={action}
    >
      <View style={[styles.container, styles.spacing]}>
        <View style={[styles.container, styles.spacing]}>
          <Icon name={leftIcon} type="ionicon" />
          <View>
            <Text type="p2">
              {title}
              {extraComponentBesideTitle}
            </Text>
            {subtitle && (
              <Text type={subtitleShorter ? "p4" : "p3"} ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightIconAction ? (
          <TouchableWithoutFeedback onPress={rightIconAction}>
            <View style={styles.rightActionTouchArea}>{RightIcon}</View>
          </TouchableWithoutFeedback>
        ) : (
          RightIcon
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const useStyles = makeStyles(({ colors }, { hovering }: { hovering: boolean }) => ({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
    backgroundColor: hovering ? colors.grey4 : undefined,
    height: 64,
  },
  spacing: {
    paddingHorizontal: 8,
    paddingRight: 12,
    paddingVertical: 6,
  },
  center: {
    justifyContent: "space-around",
  },
  rightActionTouchArea: {
    padding: 12,
    marginRight: -12,
    position: "relative",
  },
}))
