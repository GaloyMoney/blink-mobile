import React from "react"
import { View } from "react-native"

import { MenuSelectItemProps } from "./menu-select-item"
import { Item } from "./item"

export type MenuSelectProps = {
  value: string
  onChange: (optionKey: string) => Promise<void>
  children:
    | React.ReactElement<MenuSelectItemProps>
    | React.ReactElement<MenuSelectItemProps>[]
}

export const MenuSelect: React.FC<MenuSelectProps> = ({ value, onChange, children }) => {
  const [loading, setLoading] = React.useState(false)

  const childrenArray: React.ReactElement<MenuSelectItemProps>[] = React.Children.toArray(
    children,
  ) as React.ReactElement<MenuSelectItemProps>[]

  return (
    <View>
      {childrenArray.map((child) => (
        <Item
          key={child.key}
          {...child.props}
          selected={child.props.value === value}
          onChange={onChange}
          loading={loading}
          setLoading={setLoading}
        />
      ))}
    </View>
  )
}
