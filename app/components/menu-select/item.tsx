import React from "react"
import { ActivityIndicator, View } from "react-native"

import { ListItem, ListItemProps, makeStyles, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

export type ItemProps = {
  children: React.ReactNode
  value: string
  selected: boolean
  onChange: (optionKey: string) => Promise<void>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
} & ListItemProps

export const Item: React.FC<ItemProps> = ({
  children,
  value,
  selected,
  onChange,
  loading,
  setLoading,
  ...props
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const [showActivityIndicator, setShowActivityIndicator] = React.useState(false)

  const onPress = async () => {
    if (selected || loading) return

    setLoading(true)
    setShowActivityIndicator(true)

    try {
      await onChange(value)
    } finally {
      setLoading(false)
      setShowActivityIndicator(false)
    }
  }

  return (
    <ListItem {...props} key={value} bottomDivider onPress={onPress}>
      <View style={styles.iconContainer}>
        {showActivityIndicator && <ActivityIndicator />}
        {selected && <Icon name="ios-checkmark-circle" size={18} color={colors.green} />}
      </View>
      <ListItem.Title>{children}</ListItem.Title>
    </ListItem>
  )
}

const useStyles = makeStyles(() => ({
  iconContainer: { width: 18 },
}))
