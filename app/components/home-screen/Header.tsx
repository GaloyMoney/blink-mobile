import React, { useEffect, useRef } from "react"
import { Animated, Easing, TouchableOpacity, View } from "react-native"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { StackNavigationProp } from "@react-navigation/stack"
import Icon from "react-native-vector-icons/Ionicons"
import messaging from "@react-native-firebase/messaging"

// hooks
import { usePersistentStateContext } from "@app/store/persistent-state"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { useApolloClient } from "@apollo/client"
import { useBreez } from "@app/hooks"

// components
import { GaloyIconButton } from "@app/components/atomic/galoy-icon-button"
import { BalanceHeader } from "../../components/balance-header"
import { makeStyles, useTheme } from "@rneui/themed"
import { addDeviceToken, requestNotificationPermission } from "@app/utils/notifications"

type Props = {
  isContentVisible: boolean
  setIsContentVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const Header: React.FC<Props> = ({ isContentVisible, setIsContentVisible }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isAuthed = useIsAuthed()
  const isFocused = useIsFocused()
  const client = useApolloClient()
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { btcWallet } = useBreez()
  const { persistentState, updateState } = usePersistentStateContext()
  const pulseAnim = useRef(new Animated.Value(1)).current // Initial scale value

  const helpTriggered = persistentState?.helpTriggered ?? false

  // notification permission
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isAuthed && isFocused && client) {
      const WAIT_TIME_TO_PROMPT_USER = 5000
      timeout = setTimeout(
        async () => {
          const result = await requestNotificationPermission()
          if (
            result === messaging.AuthorizationStatus.PROVISIONAL ||
            result === messaging.AuthorizationStatus.AUTHORIZED
          ) {
            await addDeviceToken(client)
          }
        }, // no op if already requested
        WAIT_TIME_TO_PROMPT_USER,
      )
    }
    return () => timeout && clearTimeout(timeout)
  }, [isAuthed, isFocused, client])

  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1, // Scale up
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1, // Scale down
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }

    pulse()
  }, [pulseAnim])

  const handleHelpPress = () => {
    updateState((state: any) => {
      if (state)
        return {
          ...state,
          helpTriggered: true,
        }
      return undefined
    })
    navigation.navigate("welcomeFirst")
  }

  return (
    <View style={[styles.header, styles.container]}>
      <GaloyIconButton
        onPress={() => navigation.navigate("priceHistory")}
        size={"medium"}
        name="graph"
        iconOnly={true}
      />
      <BalanceHeader
        isContentVisible={isContentVisible}
        setIsContentVisible={setIsContentVisible}
        loading={false}
        breezBalance={btcWallet?.balance || 0}
      />
      {/* Help Icon */}
      {!helpTriggered && (
        <View style={styles.helpIconContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity onPress={handleHelpPress}>
              <Icon name="help-circle-outline" size={30} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      <GaloyIconButton
        onPress={() => navigation.navigate("settings")}
        size={"medium"}
        name="menu"
        iconOnly={true}
      />
    </View>
  )
}

export default Header

const useStyles = makeStyles(({ colors }) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  container: {
    marginHorizontal: 20,
  },
  helpIconContainer: {
    marginRight: 15,
  },
}))
