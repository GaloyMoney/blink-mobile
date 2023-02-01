type SettingsScreenProps = {
  isAuthed: boolean
  navigation: StackNavigationProp<RootStackParamList, "settings">
  username: string | undefined
  phone: string | undefined
  language: string
  bankName: string
  csvAction: (options?: QueryLazyOptions<OperationVariables>) => void
  securityAction: () => void
  loadingCsvTransactions: boolean
}

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
  styleDivider?: ViewStyleProp
  dangerous?: boolean
}
