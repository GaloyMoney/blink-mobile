import React from "react"
import { storiesOf } from "@storybook/react-native"
import { Story, StoryScreen, UseCase } from "../../../../storybook/views"
import { GaloyIcon, IconNames, IconNamesType } from "."
import { StyleSheet, Text, View } from "react-native"

const styles = StyleSheet.create({
  iconContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  iconDisplayContainer: {
    width: 100,
    margin: 10,
    alignItems: "center",
  },
})

const IconDisplay = ({
  name,
  size,
  color,
}: {
  name: IconNamesType
  size: number
  color?: string
}) => {
  return (
    <View style={styles.iconDisplayContainer}>
      <GaloyIcon name={name as IconNamesType} size={size} color={color} />
      <Text style={{ fontSize: 12 }}>{name}</Text>
    </View>
  )
}

storiesOf("Galoy Icon", module)
  .addDecorator((fn) => <StoryScreen>{fn()}</StoryScreen>)
  .add("Default", () => (
    <Story>
      <UseCase text="Size 16">
        <View style={styles.iconContainer}>
          {IconNames.map((name) => (
            <IconDisplay name={name as IconNamesType} size={16} />
          ))}
        </View>
      </UseCase>
      <UseCase text="Size 20">
        <View style={styles.iconContainer}>
          {IconNames.map((name) => (
            <IconDisplay name={name as IconNamesType} size={20} />
          ))}
        </View>
      </UseCase>
      <UseCase text="Size 24">
        <View style={styles.iconContainer}>
          {IconNames.map((name) => (
            <IconDisplay name={name as IconNamesType} size={24} />
          ))}
        </View>
      </UseCase>
      <UseCase text="Size 32">
        <View style={styles.iconContainer}>
          {IconNames.map((name) => (
            <IconDisplay name={name as IconNamesType} size={32} />
          ))}
        </View>
      </UseCase>
      <UseCase text="Different Color">
        <View style={styles.iconContainer}>
          {IconNames.map((name) => (
            <IconDisplay name={name as IconNamesType} size={32} color={"red"} />
          ))}
        </View>
      </UseCase>
    </Story>
  ))
