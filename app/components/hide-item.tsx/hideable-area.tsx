import { useHideBalanceQuery } from "@app/graphql/generated"
import React, { ReactNode, useEffect, useState } from "react"
import { Text } from "@rneui/themed"
import { StyleProp, View, ViewStyle } from "react-native"

interface HideableAreaProps {
  children: ReactNode
  isHidden?: boolean
  setIsHidden?: React.Dispatch<React.SetStateAction<boolean>>
  hiddenContent?: ReactNode
  styles?: StyleProp<ViewStyle>
}

const HideableArea: React.FC<HideableAreaProps> = ({
  children,
  isHidden,
  setIsHidden,
  hiddenContent,
  styles,
}) => {
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const [shouldBeHidden, setShouldBeHidden] = useState(isHidden ?? hideBalance)

  useEffect(() => {
    if (hideBalance !== undefined) {
      setShouldBeHidden(hideBalance)
    }
  }, [hideBalance])

  useEffect(() => {
    if (isHidden === undefined) return
    setIsHidden && setIsHidden(isHidden)
    setShouldBeHidden(isHidden)
  }, [isHidden, setIsHidden])

  if (shouldBeHidden) {
    return <View style={styles}>{hiddenContent || <Text>****</Text>}</View>
  }

  return <View style={styles}>{children}</View>
}

export default HideableArea
