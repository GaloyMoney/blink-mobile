/* eslint-disable camelcase */
/* eslint-disable react-hooks/exhaustive-deps */
import "react-native-get-random-values"
import React, { useEffect, useCallback, useRef } from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"
import { MessageType } from "@flyerhq/react-native-chat-ui"
import useNostrProfile from "@app/hooks/use-nostr-profile"

type Props = {
  recipientId: `npub1${string}`
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
    <View style={styles.container}>
      <Text style={styles.content}>{message.text}</Text>
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
    color: colors.grey5,
  },
}))
