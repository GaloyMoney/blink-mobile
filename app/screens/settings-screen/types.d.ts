type SettingsScreenProps = {
  hasToken: boolean
  navigation: StackNavigationProp<RootStackParamList, "settings">
  username: string
  phone: string
  language: string
  bankName: string
  notificationsEnabled: boolean
  csvAction: (options?: QueryLazyOptions<OperationVariables>) => void
  securityAction: () => void
  logoutAction: () => Promise<void>
  loadingCsvTransactions: boolean
  deleteAccountAction: () => void
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
