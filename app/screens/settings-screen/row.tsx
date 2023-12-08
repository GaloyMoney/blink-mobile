import { useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { makeStyles, Icon, Text, Skeleton } from "@rneui/themed"

type Props = {
  title: string
  subtitle?: string
  subtitleShorter?: boolean
  leftIcon: string
  rightIcon?: string
  extraComponentBesideTitle?: React.ReactElement
  action: () => void
  rightIconAction?: () => void
  loading?: boolean
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
}) => {
  const [hovering, setHovering] = useState(false)
  const styles = useStyles({ hovering })

  if (loading) return <Skeleton style={styles.container} animation="pulse" />

  return (
    <TouchableWithoutFeedback
      onPressIn={() => setHovering(true)}
      onPressOut={() => setHovering(false)}
      onPress={action}
    >
      <View style={styles.container}>
        <View style={styles.container}>
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
        <Icon
          onPress={rightIconAction}
          name={rightIcon ? rightIcon : "chevron-forward"}
          type="ionicon"
        />
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
    paddingHorizontal: 8,
    paddingRight: 12,
    paddingVertical: 6,
    backgroundColor: hovering ? colors.grey4 : undefined,
    height: 64,
  },
}))
