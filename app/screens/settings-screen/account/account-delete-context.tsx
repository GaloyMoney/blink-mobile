import { PropsWithChildren, createContext, useContext, useState } from "react"
import { ActivityIndicator, View } from "react-native"
import { Text, makeStyles, useTheme } from "@rneui/themed"

type AccountDeleteContextType = {
  setAccountIsBeingDeleted: React.Dispatch<React.SetStateAction<boolean>>
}

const AccountDeleteContext = createContext<AccountDeleteContextType>({
  setAccountIsBeingDeleted: () => {},
})

export const AccountDeleteContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const [accountIsBeingDeleted, setAccountIsBeingDeleted] = useState(false)

  const Loading = (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text type="p2" color={colors.grey2}>
        Your account is being deleted, please wait...
      </Text>
    </View>
  )

  return (
    <AccountDeleteContext.Provider value={{ setAccountIsBeingDeleted }}>
      {accountIsBeingDeleted ? Loading : children}
    </AccountDeleteContext.Provider>
  )
}

export const useAccountDeleteContext = () => useContext(AccountDeleteContext)

const useStyles = makeStyles(() => ({
  center: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    rowGap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
}))
