import React from "react"
import { View, Text } from "react-native"
import { makeStyles } from "@rneui/themed"

type Props = {
  id: string
  sender: string
  timestamp: string
  content: string
}

export const ChatMessage: React.FC<Props> = ({ sender, timestamp, content }) => {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <Text style={styles.sender}>{sender}</Text>
      <Text style={styles.content}>{content}</Text>
      <Text style={styles.timestamp}>{timestamp}</Text>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  container: {
    backgroundColor: colors.grey5,
    borderColor: colors.grey4,
    borderWidth: 1,
    borderRadius: 12,
    padding: 9,
    overflow: "hidden",
  },
  sender: {
    color: colors.grey0,
  },
  content: {
    color: colors.grey1,
  },
  timestamp: {
    color: colors.grey2,
  },
}))
