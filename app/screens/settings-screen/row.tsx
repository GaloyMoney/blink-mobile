import { useState } from "react"
import { TouchableWithoutFeedback, View } from "react-native"
import { makeStyles, Icon, Text, Skeleton } from "@rneui/themed"

type Props = {
  title: string
  subtitle?: string
  leftIcon: string
  rightIcon?: string
  action: () => void
  loading?: boolean
}

export const SettingsRow: React.FC<Props> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  action,
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
            <Text type="p2">{title}</Text>
            {subtitle && <Text type="p3">{subtitle}</Text>}
          </View>
        </View>
        <Icon name={rightIcon ? rightIcon : "chevron-forward"} type="ionicon" />
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
    paddingVertical: 6,
    backgroundColor: hovering ? colors.grey4 : undefined,
    height: 64,
  },
}))
