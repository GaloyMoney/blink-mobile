import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from "mobx-react";
import * as React from "react";
import { BalanceHeader } from "../../components/balance-header";
import { PriceGraphDataInjected } from "../../components/price-graph";
import { Screen } from "../../components/screen";
import { translate } from "../../i18n";
import { StoreContext } from "../../models";
import { RootStore } from "../../models/root-store";
import { palette } from "../../theme/palette";
import { AccountType } from "../../utils/enum";

export interface PriceScreenProps {
  account: AccountType
  store: RootStore
  navigation: StackNavigationProp<any,any>
}

const BalanceHeaderDataInjection = observer(({ currency, account }) => {
  const store = React.useContext(StoreContext)

  return <BalanceHeader currency={currency} 
    amount={store.balances({currency: "BTC", account})} /> // FIXME
})

export const AccountToWallet = ({account, store}) => {
  // FIXME should have a generic mapping here, could use mst for it?
  switch (account) {
    case AccountType.Bank:
      return store.wallet("USD")
    case AccountType.Bitcoin:
      return store.wallet("BTC")
  }
}

export const PriceScreen: React.FC<PriceScreenProps> = observer(({ route, navigation }) => {
  
  const store = React.useContext(StoreContext)

  const account = route.params.account
  let wallet = AccountToWallet({account, store})

  return (
    <Screen backgroundColor={palette.white} preset="scroll" style={{flex: 1}}>
      <BalanceHeaderDataInjection 
        // currency={wallet.currency} // FIXME
        currency={"BTC"} 
        account={account}
      />
      <PriceGraphDataInjected /> 
    </Screen>
  )
})