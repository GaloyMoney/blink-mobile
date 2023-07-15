import React from "react"

import { makeStyles, useTheme } from "@rneui/themed"
import { View, TextInput, StyleProp, ViewStyle } from "react-native"

import NoteIcon from "@app/assets/icons/note.svg"

export type NoteInputProps = {
  onBlur?: (() => void) | undefined
  onChangeText?: ((text: string) => void) | undefined
  value?: string | undefined
  editable?: boolean | undefined
  style?: StyleProp<ViewStyle>
}

export const NoteInput: React.FC<NoteInputProps> = ({
  onChangeText,
  value,
  editable,
  onBlur,
  style,
}) => {
  const styles = useStyles(Boolean(editable))
  const {
    theme: { colors },
  } = useTheme()

  return (
    <View style={[styles.fieldBackground, style]}>
      <View style={styles.noteContainer}>
        <TextInput
          style={styles.noteInput}
          placeholder={"Add Note"}
          placeholderTextColor={colors.black}
          onChangeText={onChangeText}
          onBlur={onBlur}
          value={value}
          editable={editable}
          selectTextOnFocus
          maxLength={500}
        />
        <View style={styles.noteIconContainer}>
          <NoteIcon style={styles.noteIcon} />
        </View>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }, editable: boolean) => ({
  fieldBackground: {
    flexDirection: "row",
    borderStyle: "solid",
    overflow: "hidden",
    backgroundColor: colors.grey5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    height: 60,
    opacity: editable ? 1 : 0.5,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  noteContainer: {
    flex: 1,
    flexDirection: "row",
  },
  noteIconContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  noteIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  noteInput: {
    flex: 1,
    color: colors.black,
    fontSize: 16,
  },
}))
