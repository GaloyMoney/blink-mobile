import * as React from "react"
import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  View,
  SafeAreaView,
} from "react-native"

import { ScreenProps } from "./screen.props"
import { isNonScrolling, offsets, presets } from "./screen.presets"
import { isIos } from "../../utils/helper"
import { makeStyles, useTheme } from "@rneui/themed"
import { light } from "@app/rne-theme/colors"

const useStyles = makeStyles(({ colors }) => ({
  background: {
    color: colors.white,
  },
}))

function ScreenWithoutScrolling(props: ScreenProps) {
  const styles = useStyles()
  const {
    theme: { mode },
  } = useTheme()

  const statusBarContent = mode === "light" ? "dark-content" : "light-content"

  const preset = presets.fixed
  const style = props.style || {}
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : { backgroundColor: styles.background.color }
  const Wrapper = props.unsafe ? View : SafeAreaView

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? "padding" : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
    >
      <StatusBar
        barStyle={props.statusBar || statusBarContent}
        backgroundColor={styles.background.color}
      />
      <Wrapper style={[preset.inner, style]}>{props.children}</Wrapper>
    </KeyboardAvoidingView>
  )
}

function ScreenWithScrolling(props: ScreenProps) {
  const styles = useStyles()
  const {
    theme: { mode },
  } = useTheme()

  const statusBarContent = mode === "light" ? "dark-content" : "light-content"

  const preset = presets.scroll
  const style = props.style || {}
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : { backgroundColor: styles.background.color }
  const Wrapper = props.unsafe ? View : SafeAreaView

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle]}
      behavior={isIos ? "padding" : undefined}
      keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
    >
      <StatusBar
        barStyle={props.statusBar || statusBarContent}
        backgroundColor={styles.background.color}
      />
      <Wrapper style={[preset.outer, backgroundStyle]}>
        <ScrollView
          style={[preset.outer, backgroundStyle]}
          contentContainerStyle={[preset.inner, style]}
          keyboardShouldPersistTaps={props.keyboardShouldPersistTaps}
        >
          {props.children}
        </ScrollView>
      </Wrapper>
    </KeyboardAvoidingView>
  )
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export const Screen: React.FC<ScreenProps> = (props) => {
  if (isNonScrolling(props.preset)) {
    return <ScreenWithoutScrolling {...props} />
  }
  return <ScreenWithScrolling {...props} />
}
