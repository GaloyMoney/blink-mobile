type SettingRow = {
  id: string
  icon: string
  category: string
  hidden?: boolean
  enabled?: boolean
  subTitleText?: string
  subTitleDefaultValue?: string
  action?: () => void
  greyed?: boolean
  styleDivider?: boolean
  dangerous?: boolean
  chevronLogo?: string
  chevronColor?: string
  chevronSize?: number
}
