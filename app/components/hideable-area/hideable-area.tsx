import React, { ReactNode, useEffect, useState } from "react"
import { Text } from "@rneui/themed"

interface HideableAreaProps {
  children: ReactNode
  isContentHidden?: boolean
  hideBalance: boolean
  hiddenContent?: ReactNode
}

const HideableArea: React.FC<HideableAreaProps> = ({
  children,
  isContentHidden,
  hideBalance,
  hiddenContent,
}) => {
  const [shouldBeHidden, setShouldBeHidden] = useState(isContentHidden ?? hideBalance)

  useEffect(() => {
    if (isContentHidden === undefined) {
      setShouldBeHidden(hideBalance)
    } else {
      setShouldBeHidden(isContentHidden)
    }
  }, [isContentHidden, hideBalance])

  if (shouldBeHidden) {
    return <>{hiddenContent || <Text>****</Text>}</>
  }

  return <>{children}</>
}

export default HideableArea
