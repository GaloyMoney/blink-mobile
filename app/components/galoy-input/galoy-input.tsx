import { Input } from "react-native-elements"
import { IconNode } from "react-native-elements/dist/icons/Icon"
import { ComponentType } from "../../types/jsx"

type GaloyInputProps = {
  placeholder?: string
  leftIcon?: IconNode
  rightIcon?: IconNode
  price: number
  editable: boolean
  onUpdateAmount(number): void
  onBlur?(): void
  forceKeyboard: boolean
  initAmount?: number
  prefCurrency: string
  nextPrefCurrency: () => void
  sub?: boolean
}


export const GaloyInput: ComponentType = ({

  return (
    <Input
      
    />
  )
})
