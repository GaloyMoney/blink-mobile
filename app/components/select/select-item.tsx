// This is a dummy item for better DX while writing the select component
// See ./item.ts for the correct item

import React from "react"

import { ListItemProps } from "@rneui/base"

export type SelectItemProps = {
  children: React.ReactNode
  value: string
} & ListItemProps

export const SelectItem: React.FC<SelectItemProps> = () => {
  return <></>
}
