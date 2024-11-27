import React, { useState } from "react"
import { ActivityIndicator, Button, View } from "react-native"
import { makeStyles, Text, useTheme } from "@rneui/themed"
import { gql } from "@apollo/client"

// components
import { Screen } from "@app/components/screen"
import ContactModal, {
  SupportChannels,
} from "@app/components/contact-modal/contact-modal"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"
import { UpgradeAccountModal } from "@app/components/upgrade-account-modal"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { TransactionLimitsPeriod } from "@app/components/transaction-limits"

// hooks
import { useI18nContext } from "@app/i18n/i18n-react"
import { useAccountLimitsQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useAppConfig } from "@app/hooks"

// gql
import { AccountLevel, useLevel } from "@app/graphql/level-context"

gql`
  query accountLimits {
    me {
      id
      defaultAccount {
        id
        limits {
          withdrawal {
            totalLimit
            remainingLimit
            interval
          }
          internalSend {
            totalLimit
            remainingLimit
            interval
          }
          convert {
            totalLimit
            remainingLimit
            interval
          }
        }
      }
    }
  }
`

export const TransactionLimitsScreen = () => {
  const styles = useStyles()
  const { colors } = useTheme().theme
  const { LL } = useI18nContext()
  const { appConfig } = useAppConfig()
  const { currentLevel } = useLevel()

  const { data, loading, error, refetch } = useAccountLimitsQuery({
    fetchPolicy: "no-cache",
    skip: !useIsAuthed(),
  })

  const { name: bankName } = appConfig.galoyInstance

  const [isContactModalVisible, setIsContactModalVisible] = useState(false)
  const [isUpgradeAccountModalVisible, setIsUpgradeAccountModalVisible] = useState(false)

  const toggleIsContactModalVisible = () => {
    setIsContactModalVisible(!isContactModalVisible)
  }

  const toggleIsUpgradeAccountModalVisible = () => {
    setIsUpgradeAccountModalVisible(!isUpgradeAccountModalVisible)
  }

  const messageBody = LL.TransactionLimitsScreen.contactUsMessageBody({
    bankName,
  })
  const messageSubject = LL.TransactionLimitsScreen.contactUsMessageSubject()

  if (error) {
    return (
      <Screen>
        <View style={styles.errorWrapper}>
          <Text adjustsFontSizeToFit style={styles.errorText}>
            {LL.TransactionLimitsScreen.error()}
          </Text>
          <Button
            title="reload"
            disabled={loading}
            color={colors.error}
            onPress={() => refetch()}
          />
        </View>
      </Screen>
    )
  } else if (loading) {
    return (
      <Screen>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator animating size="large" color={colors.primary} />
        </View>
      </Screen>
    )
  }
  return (
    <Screen preset="scroll">
      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.receive()}
        </Text>
        <View>
          <View style={styles.contentTextBox}>
            <Text adjustsFontSizeToFit style={styles.valueRemaining}>
              {LL.TransactionLimitsScreen.unlimited()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider}></View>

      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.withdraw()}
        </Text>
        {data?.me?.defaultAccount.limits?.withdrawal.map((data, index: number) => (
          <TransactionLimitsPeriod key={index} {...data} />
        ))}
      </View>

      <View style={styles.divider}></View>

      <View style={styles.limitWrapper}>
        <Text adjustsFontSizeToFit style={styles.valueFieldType}>
          {LL.TransactionLimitsScreen.internalSend({ bankName })}
        </Text>
        {data?.me?.defaultAccount.limits?.internalSend.map((data, index: number) => (
          <TransactionLimitsPeriod key={index} {...data} />
        ))}
      </View>

      <View style={styles.divider}></View>

      <View style={styles.infoWrapper}>
        <View style={styles.infoTitleWrapper}>
          <GaloyIcon name={"info"} size={20} color={colors.grey0} />
          <Text style={styles.infoTitle}>
            {LL.TransactionLimitsScreen.spendingLimits()}
          </Text>
        </View>
        <Text style={styles.infoDescription}>
          {LL.TransactionLimitsScreen.spendingLimitsDescription()}
        </Text>
      </View>
      {currentLevel !== AccountLevel.Two && (
        <GaloyPrimaryButton
          title={
            currentLevel === AccountLevel.Zero
              ? LL.TransactionLimitsScreen.increaseLimits()
              : LL.TransactionLimitsScreen.requestBusiness()
          }
          containerStyle={styles.increaseLimitsButtonContainer}
          onPress={
            currentLevel === AccountLevel.Zero
              ? toggleIsUpgradeAccountModalVisible
              : toggleIsContactModalVisible
          }
        />
      )}
      <ContactModal
        isVisible={isContactModalVisible}
        toggleModal={toggleIsContactModalVisible}
        messageBody={messageBody}
        messageSubject={messageSubject}
        supportChannelsToHide={[
          SupportChannels.Mattermost,
          SupportChannels.StatusPage,
          SupportChannels.Telegram,
        ]}
      />
      <UpgradeAccountModal
        isVisible={isUpgradeAccountModalVisible}
        closeModal={toggleIsUpgradeAccountModalVisible}
      />
    </Screen>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  limitWrapper: {
    padding: 20,
    backgroundColor: colors.white,
  },
  increaseLimitsButtonContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  contentTextBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  valueFieldType: {
    fontWeight: "bold",
    fontSize: 15,
    paddingBottom: 8,
  },
  valueRemaining: {
    fontWeight: "bold",
    color: colors.green,
    maxWidth: "50%",
  },
  divider: {
    marginVertical: 0,
    borderWidth: 1,
    borderColor: colors.grey4,
  },
  errorWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
    marginBottom: "50%",
  },
  errorText: {
    color: colors.error,
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 20,
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: "50%",
    marginBottom: "50%",
  },
  infoWrapper: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  infoTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 16,
    marginLeft: 5,
    color: colors.grey0,
  },
  infoDescription: {
    fontSize: 14,
    color: colors.grey1,
  },
}))
