/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import "react-native-get-random-values"
import React, { useEffect, useRef } from "react"
import { View, Text } from "react-native"
import { Icon, makeStyles } from "@rneui/themed"
import { MessageType } from "@flyerhq/react-native-chat-ui"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

type Props = {
  recipientId: string
  message: MessageType.Text
  nextMessage: number
  prevMessage: boolean
}

export const ChatMessage: React.FC<Props> = ({ message, recipientId }) => {
  const styles = useStyles()
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return (
    <View
      style={{
        ...styles.container,
      }}
    >
      <View style={{ display: "flex", flexDirection: "row" }}>
        {message.metadata?.errors ? (
          <GaloyIcon name="warning" size={20} color="yellow" style={styles.errorIcon} />
        ) : null}

        <Text
          style={{
            ...styles.content,
          }}
        >
          {message.text}
        </Text>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    borderRadius: 12,
    padding: 10,
    overflow: "hidden",
  },
  content: {
    color: colors._black,
  },
  errorIcon: {
    marginRight: 10,
  },
}))
