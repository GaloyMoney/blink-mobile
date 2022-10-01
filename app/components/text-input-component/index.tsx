import { color, fontSize, palette, typography } from "@app/theme"
import React, { useLayoutEffect, useRef, useState, useEffect } from "react"
import {
  TextInput,
  StyleSheet,
  Text,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native"
import { Props } from "./model"
const { width } = Dimensions.get("window")
const measureHeightAsync = async (component: React.RefObject<Text>): Promise<number> => {
  return new Promise((resolve) => {
    if (component.current) {
      if (Platform.OS === "android") {
        component.current.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            resolve(height)
          },
        )
      } else {
        component.current.measure(
          (x: number, y: number, width: number, height: number) => {
            resolve(height)
          },
        )
      }
    } else {
      resolve(0)
    }
  })
}

const useIsMounted = () => {
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true

    return () => (isMounted.current = false)
  }, [])

  return isMounted
}

const nextFrameAsync = async () => {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

const TextInputComponent = (props: Props, ref) => {
  const {
    title,
    containerStyle,
    titleStyle,
    isError,
    icon,
    placeholderColor,
    textField,
    disabled,
    keyboardType,
  } = props
  let titleRef = useRef(null)
  let inputRef = useRef(null)
  const [padding, setPadding] = useState(9.6)

  const isMounted = useIsMounted()

  useLayoutEffect(() => {
    const measure = async () => {
      await nextFrameAsync()

      if (!isMounted.current) {
        return
      }

      // Get the height of the text with no restriction on number of lines
      const fullHeight = await measureHeightAsync(titleRef)
      setPadding(fullHeight / 2)
    }

    measure()
  }, [])

  return (
    <TouchableOpacity
      onPress={() => {
        if (ref) {
          ref?.current?.focus()
        } else {
          inputRef?.current?.focus()
        }
      }}
      activeOpacity={1}
      style={[
        styles.container,
        isError && { borderColor: color.darkPink },
        containerStyle,
      ]}
    >
      <TextInput
        editable={!disabled}
        keyboardType={keyboardType}
        placeholderTextColor={placeholderColor || color.gray}
        multiline={textField}
        ref={ref || inputRef}
        {...props}
        style={[styles.input, props?.style, textField ? { height: 120 } : {}]}
      />
      {icon}
      {title && (
        <Text ref={titleRef} style={[styles.title, { top: -padding }, titleStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

export default React.forwardRef(TextInputComponent)

const styles = StyleSheet.create({
  container: {
    backgroundColor:'white',
    flexDirection: "row",
    width: width - 50,
    borderRadius: 4,
    borderColor: "#EBEBEB",
    borderWidth: 1,
    paddingHorizontal: 23,
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    paddingVertical: Platform.OS === "ios" ? 15 : 0,
  },
  title: {
    color: color.black,
    position: "absolute",
    lineHeight: 18.8,
    top: -9.6,
    left: 18,
    fontFamily: typography.regular,
    fontSize: fontSize.font16,
    backgroundColor: palette.lighterGrey,
    paddingHorizontal: 4,
  },
  input: {
    textAlignVertical: "top",
    fontFamily: typography.regular,
    fontSize: fontSize.font16,
    color: color.black,
    width: "90%",
  },
})
