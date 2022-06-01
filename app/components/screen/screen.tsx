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
import { ModalClipboard } from "../modal-clipboard"
import { isIos } from "../../utils/helper"
import { Background } from "../screen-background/index"

function ScreenWithoutScrolling(props: ScreenProps) {
  const preset = presets.fixed
  const style = props.style || {}
  const backgroundStyle = props.backgroundColor
    ? { backgroundColor: props.backgroundColor }
    : {}
  const Wrapper = props.unsafe ? View : SafeAreaView

  return (
    <Background>
      <KeyboardAvoidingView
        style={[preset.outer]}
        behavior={isIos ? "padding" : null}
        keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
      >
        <StatusBar
          barStyle={props.statusBar || "dark-content"}
          backgroundColor={props.backgroundColor}
        />
        {/* modalClipboard requires StoreContext which requiere being inside a navigator */}
        <ModalClipboard />
        <Wrapper style={[preset.inner, style]}>{props.children}</Wrapper>
      </KeyboardAvoidingView>
    </Background>
  )
}

function ScreenWithScrolling(props: ScreenProps) {
  const preset = presets.scroll
  const style = props.style || {}
  const backgroundStyle = 
  {}
  const Wrapper = props.unsafe ? View : SafeAreaView
  return (
    <Background>
      <KeyboardAvoidingView
        style={[preset.outer]}
        behavior={isIos ? "padding" : null}
        keyboardVerticalOffset={offsets[props.keyboardOffset || "none"]}
      >
        <StatusBar
          barStyle={props.statusBar || "dark-content"}
          backgroundColor={props.backgroundColor}
        />
        <ModalClipboard />
        <Wrapper style={[preset.outer, backgroundStyle]}>
          <ScrollView
            style={[preset.outer, backgroundStyle]}
            contentContainerStyle={[preset.inner, style]}
          >
            {props.children}
          </ScrollView>
        </Wrapper>
      </KeyboardAvoidingView>
    </Background>
  )
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export function Screen(props: ScreenProps): JSX.Element {
  if (isNonScrolling(props.preset)) {
    return <ScreenWithoutScrolling {...props} />
  }
  return <ScreenWithScrolling {...props} />
}
