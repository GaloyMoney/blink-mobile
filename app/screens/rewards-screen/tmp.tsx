
export const WelcomeBackCompletedScreen = withNavigation(inject("dataStore")(observer(
    ({ dataStore, navigation }) => {
  
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
  
    const onGetReward = async () => {
  
      try {
        setLoading(true)
        await GetReward({
          value: 5000,
          memo: "App install reward",
          lnd: dataStore.lnd,
          setErr,
        })
        await dataStore.onboarding.set(Onboarding.walletOnboarded)
        navigation.navigate("firstReward")
        setLoading(false)
      } catch (err) {
        console.tron.error(err)
        setErr(err.toString())
      }
    }
  
    useEffect(() => {
      if (err !== "") {
        Alert.alert("error", err, [
          {
            text: "OK",
            onPress: () => {
              setLoading(false)
            },
          },
        ])
        setErr("")
      }
    }, [err])
  
    return (
      <Screen>
        <OnboardingScreen 
          action={onGetReward}
          header="Welcome back!"
          image={partyPopperLogo}
          loading={loading}
        >
          <Text style={styles.text}>
            Your wallet is ready.{"\n"}
            Now send us a payment request so we can send your sats.
          </Text>
        </OnboardingScreen>
      </Screen>
    )
  })))
  
  export const FirstRewardScreen = inject("dataStore")(
    observer(({ dataStore }) => {
  
      const [balance, setBalance] = useState(0)
  
      useEffect(() => {
        const updateBalance = async () => {
          await dataStore.lnd.updateBalance()
          const result = dataStore.balances({
            currency: CurrencyType.BTC,
            account: AccountType.Bitcoin,
          })
          setBalance(result)
        }
        
        updateBalance()
        const timer = setInterval(updateBalance, 1000)
        return () => clearTimeout(timer)
      }, [])
  
      return (
        <Screen>
          <OnboardingScreen next="allDone" header={`+ ${balance} sats`} image={lightningLogo}>
            <Text style={styles.text}>
              Success!{"\n"}
              {"\n"}
              You’ve been paid{"\n"}your first reward.
            </Text>
          </OnboardingScreen>
        </Screen>
      )
  }))
  