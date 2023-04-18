import React, { ReactNode, useEffect, useState } from "react"
import { Text } from "@rneui/themed"
import { StyleProp, View, ViewStyle } from "react-native"

interface HideableAreaProps {
  children: ReactNode
  isHidden?: boolean
  hideBalance: boolean
  hiddenContent?: ReactNode
  styles?: StyleProp<ViewStyle>
}

const HideableArea: React.FC<HideableAreaProps> = ({
  children,
  isHidden,
  hideBalance,
  hiddenContent,
  styles,
}) => {
  const [shouldBeHidden, setShouldBeHidden] = useState(isHidden ?? hideBalance)

  useEffect(() => {
    if (isHidden === undefined) {
      setShouldBeHidden(hideBalance)
    } else {
      setShouldBeHidden(isHidden)
    }
  }, [isHidden, hideBalance])

  if (shouldBeHidden) {
    return <View style={styles}>{hiddenContent || <Text>****</Text>}</View>
  }

  return <View style={styles}>{children}</View>
}

export default HideableArea
