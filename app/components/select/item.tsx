import React from "react"
import { ActivityIndicator, View } from "react-native"

import { ListItem, makeStyles, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"

const useStyles = makeStyles(() => ({
  iconContainer: { width: 18 },
}))

export type ItemProps = {
  children: React.ReactNode
  value: string
  selected: boolean
  onChange: (optionKey: string) => void | Promise<void>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export const Item: React.FC<ItemProps> = ({
  children,
  value,
  selected,
  onChange,
  loading,
  setLoading,
}) => {
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const [showActivityIndicator, setShowActivityIndicator] = React.useState(false)

  const onPress = () => {
    if (selected || loading) return

    const isPromise = onChange(value)
    if (isPromise) {
      isPromise
        .then(() => {
          setLoading(false)
          setShowActivityIndicator(false)
        })
        .catch(() => {
          setLoading(false)
          setShowActivityIndicator(false)
        })
      setLoading(true)
      setShowActivityIndicator(true)
    }
  }

  return (
    <ListItem key={value} bottomDivider onPress={onPress}>
      <View style={styles.iconContainer}>
        {showActivityIndicator && <ActivityIndicator />}
        {selected && <Icon name="ios-checkmark-circle" size={18} color={colors.green} />}
      </View>
      <ListItem.Title>{children}</ListItem.Title>
    </ListItem>
  )
}
