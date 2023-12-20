import Share from "react-native-share"

import { SettingsRow } from "../row"

import { useI18nContext } from "@app/i18n/i18n-react"

import { gql } from "@apollo/client"
import { useExportCsvSettingLazyQuery } from "@app/graphql/generated"
import { useSettingsContext } from "../settings-context"

import { getBtcWallet, getUsdWallet } from "@app/graphql/wallets-utils"

import crashlytics from "@react-native-firebase/crashlytics"

gql`
  query ExportCsvSetting($walletIds: [WalletId!]!) {
    me {
      id
      defaultAccount {
        id
        csvTransactions(walletIds: $walletIds)
      }
    }
  }
`

export const ExportCsvSetting: React.FC = () => {
  const { LL } = useI18nContext()

  const { data, loading } = useSettingsContext()

  const btcWallet = getBtcWallet(data?.me?.defaultAccount?.wallets)
  const usdWallet = getUsdWallet(data?.me?.defaultAccount?.wallets)
  const btcWalletId = btcWallet?.id
  const usdWalletId = usdWallet?.id

  const [fetchCsvTransactionsQuery, { loading: spinner }] = useExportCsvSettingLazyQuery({
    fetchPolicy: "network-only",
  })

  const fetchCsvTransactions = async () => {
    const walletIds: string[] = []
    if (btcWalletId) walletIds.push(btcWalletId)
    if (usdWalletId) walletIds.push(usdWalletId)

    const { data } = await fetchCsvTransactionsQuery({
      variables: { walletIds },
    })

    const csvEncoded = data?.me?.defaultAccount?.csvTransactions
    try {
      await Share.open({
        title: "export-wallet.csv", // what is used for android
        filename: "export-wallet.csv", // what is used for ios
        url: `data:text/comma-separated-values;base64,${csvEncoded}`,
        type: "text/comma-separated-values",
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
      console.error(err)
    }
  }

  return (
    <SettingsRow
      loading={loading}
      spinner={spinner}
      title={LL.common.csvExport()}
      leftIcon="download-outline"
      rightIcon={null}
      action={fetchCsvTransactions}
    />
  )
}
