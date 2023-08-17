import * as React from "react"
import { makeStyles } from "@rneui/themed"

import { Screen } from "../../components/screen"
import { CirclesCard } from "./circles/circles-card"
import { ContactsCard } from "./contacts/contacts-card"
import { InviteFriendsCard } from "./circles/invite-friends-card"

export const PeopleScreen: React.FC = () => {
  const styles = useStyles()

  return (
    <Screen style={styles.screen} preset="scroll">
      <CirclesCard />
      <ContactsCard />
      <InviteFriendsCard />
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  screen: {
    padding: 24,
  },
}))
