import React, { useCallback, useEffect, useState } from "react"
import { RefreshControl, ScrollView } from "react-native"
import { makeStyles, useTheme } from "@rneui/themed"

// components
import { AppUpdate } from "@app/components/app-update/app-update"
import WalletOverview from "@app/components/wallet-overview/wallet-overview"
import { SetDefaultAccountModal } from "@app/components/set-default-account-modal"
import { UnVerifiedSeedModal } from "@app/components/unverified-seed-modal"
import { Screen } from "../../components/screen"
import {
  AccountCreateModal,
  Buttons,
  Header,
  Info,
  Transactions,
} from "@app/components/home-screen"

// queries
import {
  TransactionEdge,
  useHideBalanceQuery,
  useHomeAuthedQuery,
  useRealtimePriceQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { getDefaultWallet } from "@app/graphql/wallets-utils"

// hooks
import { useBreez } from "@app/hooks"
import useNostrProfile from "@app/hooks/use-nostr-profile"

// store
import { useAppDispatch } from "@app/store/redux"
import { setUserData } from "@app/store/redux/slices/userSlice"
import { usePersistentStateContext } from "@app/store/persistent-state"

export const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch()
  const isAuthed = useIsAuthed()
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { btcWallet } = useBreez()
  const { nostrSecretKey } = useNostrProfile()

  // queries
  const { data: { hideBalance } = {} } = useHideBalanceQuery()
  const {
    data: dataAuthed,
    loading: loadingAuthed,
    error,
    refetch: refetchAuthed,
  } = useHomeAuthedQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    errorPolicy: "all",
    nextFetchPolicy: "cache-and-network", // this enables offline mode use-case
  })
  const { loading: loadingPrice, refetch: refetchRealtimePrice } = useRealtimePriceQuery({
    skip: !isAuthed,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-and-network", // this enables offline mode use-case
  })
  const { persistentState, updateState } = usePersistentStateContext()
  const [defaultAccountModalVisible, setDefaultAccountModalVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [refreshTriggered, setRefreshTriggered] = useState(false)
  const [isUnverifiedSeedModalVisible, setIsUnverifiedSeedModalVisible] = useState(false)

  const isBalanceVisible = hideBalance ?? false

  useEffect(() => {
    if (dataAuthed?.me) {
      dispatch(setUserData(dataAuthed.me))
      saveDefaultWallet()
    }
  }, [dataAuthed?.me?.username])

  useEffect(() => {
    setIsContentVisible(isBalanceVisible)
  }, [isBalanceVisible])

  const saveDefaultWallet = () => {
    if (!persistentState.defaultWallet) {
      const defaultWallet = getDefaultWallet(
        dataAuthed?.me?.defaultAccount?.wallets,
        dataAuthed?.me?.defaultAccount?.defaultWalletId,
      )
      updateState((state: any) => {
        if (state)
          return {
            ...state,
            defaultWallet,
          }
        return undefined
      })
    }
  }

  const refetch = useCallback(() => {
    if (isAuthed) {
      refetchRealtimePrice()
      refetchAuthed()
      setRefreshTriggered(true)
      setTimeout(() => setRefreshTriggered(false), 1000)
    }
  }, [isAuthed, refetchAuthed, refetchRealtimePrice])

  return (
    <Screen>
      <AccountCreateModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
      <UnVerifiedSeedModal
        isVisible={isUnverifiedSeedModalVisible}
        setIsVisible={setIsUnverifiedSeedModalVisible}
      />
      <Header
        isContentVisible={isContentVisible}
        setIsContentVisible={setIsContentVisible}
      />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshTriggered}
            onRefresh={refetch}
            colors={[colors.primary]} // Android refresh indicator colors
            tintColor={colors.primary} // iOS refresh indicator color
          />
        }
      >
        <WalletOverview
          refreshTriggered={refreshTriggered}
          isContentVisible={isContentVisible}
          setIsContentVisible={setIsContentVisible}
          loading={false}
          breezBalance={btcWallet?.balance || 0}
          pendingBalance={null}
          setIsUnverifiedSeedModalVisible={setIsUnverifiedSeedModalVisible}
        />
        <Info error={error} />
        <Buttons
          setModalVisible={setModalVisible}
          setDefaultAccountModalVisible={setDefaultAccountModalVisible}
        />
        <Transactions
          refreshTriggered={refreshTriggered}
          loadingAuthed={loadingAuthed}
          transactionsEdges={
            dataAuthed?.me?.defaultAccount?.transactions?.edges as TransactionEdge[]
          }
        />
        <AppUpdate />
        <SetDefaultAccountModal
          isVisible={defaultAccountModalVisible}
          toggleModal={() => setDefaultAccountModalVisible(!defaultAccountModalVisible)}
        />
      </ScrollView>
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  scrollView: {
    paddingBottom: 12,
    marginHorizontal: 20,
  },
  marginButtonContainer: {
    marginBottom: 20,
  },
}))
