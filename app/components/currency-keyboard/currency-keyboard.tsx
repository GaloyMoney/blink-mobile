import React from "react"
import { Pressable, StyleProp, View, ViewStyle } from "react-native"
import { Text } from "@rneui/base"
import { makeStyles, useTheme } from "@rneui/themed"
import { Key as KeyType } from "../amount-input-screen/number-pad-reducer"
import { testProps } from "@app/utils/testProps"

const useStyles = makeStyles((theme) => ({
  container: {},
  keyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  lastKeyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlignVertical: "center",
    color: theme.colors.grey5,
  },
  pressedKeyText: {
    color: theme.colors.primary5,
    fontSize: 24,
    fontWeight: "bold",
    textAlignVertical: "center",
  },
}))

type CurrencyKeyboardProps = {
  onPress: (pressed: KeyType) => void
}

export const CurrencyKeyboard: React.FC<CurrencyKeyboardProps> = ({ onPress }) => {
  const { theme } = useTheme()
  const styles = useStyles(theme)
  return (
    <View style={styles.container}>
      <View style={styles.keyRow}>
        <Key numberPadKey={KeyType[1]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[2]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[3]} handleKeyPress={onPress} />
      </View>
      <View style={styles.keyRow}>
        <Key numberPadKey={KeyType[4]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[5]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[6]} handleKeyPress={onPress} />
      </View>
      <View style={styles.keyRow}>
        <Key numberPadKey={KeyType[7]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[8]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[9]} handleKeyPress={onPress} />
      </View>
      <View style={styles.lastKeyRow}>
        <Key numberPadKey={KeyType.Decimal} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType[0]} handleKeyPress={onPress} />
        <Key numberPadKey={KeyType.Backspace} handleKeyPress={onPress} />
      </View>
    </View>
  )
}

const Key = ({
  handleKeyPress,
  numberPadKey,
}: {
  numberPadKey: KeyType
  handleKeyPress: (key: KeyType) => void
}) => {
  const { theme } = useTheme()
  const styles = useStyles(theme)
  const pressableStyle = ({ pressed }: { pressed: boolean }): StyleProp<ViewStyle> => {
    const baseStyle: StyleProp<ViewStyle> = {
      height: 40,
      width: 40,
      borderRadius: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }

    if (pressed) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary9,
      }
    }
    return baseStyle
  }

  return (
    <Pressable
      style={pressableStyle}
      hitSlop={20}
      onPress={() => handleKeyPress(numberPadKey)}
      {...testProps(`Key ${numberPadKey}`)}
    >
      {({ pressed }) => {
        return (
          <Text style={pressed ? styles.pressedKeyText : styles.keyText}>
            {numberPadKey}
          </Text>
        )
      }}
    </Pressable>
  )
}
