import React, { ReactNode } from "react"
import { Text } from "@rneui/themed"

interface HideableAreaProps {
  children: ReactNode
  isContentVisible?: boolean
  hiddenContent?: ReactNode
}

const HideableArea: React.FC<HideableAreaProps> = ({
  children,
  isContentVisible,
  hiddenContent,
}) => {
  if (isContentVisible) {
    return <>{hiddenContent || <Text>****</Text>}</>
  }

  return <>{children}</>
}

export default HideableArea
