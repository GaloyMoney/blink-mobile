import React from "react"
import { View } from "react-native"

import { SelectItemProps } from "./select-item"
import { Item } from "./item"

export type SelectProps = {
  value: string
  onChange: (optionKey: string) => void | Promise<void>
  children: React.ReactElement<SelectItemProps> | React.ReactElement<SelectItemProps>[]
}

export const Select: React.FC<SelectProps> = ({ value, onChange, children }) => {
  const [loading, setLoading] = React.useState(false)

  const childrenArray: React.ReactElement<SelectItemProps>[] = React.Children.toArray(
    children,
  ) as React.ReactElement<SelectItemProps>[]

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
