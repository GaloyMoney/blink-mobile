import * as React from "react"
import { makeStyles } from "@rneui/themed"

import { Screen } from "../../components/screen"
import { CirclesCardPeopleHome } from "./circles/circles-card-people-home"
import { ContactsCard } from "./contacts/contacts-card"
import { InviteFriendsCard } from "./circles/invite-friends-card"

export const PeopleScreen: React.FC = () => {
  const styles = useStyles()

  return (
    <Screen style={styles.screen} preset="scroll">
      <CirclesCardPeopleHome />
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
