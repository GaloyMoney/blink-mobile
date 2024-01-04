import React, { useState, createContext, useContext, useCallback, useMemo } from "react"
import { Text, makeStyles, useTheme } from "@rneui/themed"
import CustomModal from "../custom-modal/custom-modal"
import { GaloyIcon, IconNamesType } from "../atomic/galoy-icon"

type NotifyModalArgs = {
  title: string
  text: string
  icon?: IconNamesType
  primaryButtonTitle: string
  primaryButtonAction?: () => Promise<void>
  secondaryButtonTitle?: string
  secondaryButtonAction?: () => Promise<void>
  dismissAction?: () => void
}

type NotificationModalContextType = {
  notify: (args: NotifyModalArgs) => void
}

export const NotificationModalContext = createContext<NotificationModalContextType>({
  notify: () => {},
})

export const NotificationModalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotifyModalArgs[]>([])
  const [primaryIsLoading, setPrimaryIsLoading] = useState(false)
  const [secondaryIsLoading, setSecondaryIsLoading] = useState(false)
  const {
    theme: { colors },
  } = useTheme()
  const styles = useStyles()

  const notify = useCallback(
    (args: NotifyModalArgs) => {
      setNotifications((notifications) => [...notifications, args])
    },
    [setNotifications],
  )

  const dismiss = useCallback(() => {
    setNotifications((notifications) => notifications.slice(1))
  }, [setNotifications])

  const activeNotification = notifications[0]

  const modalInfo = useMemo(() => {
    if (!activeNotification) {
      return null
    }

    const toggleModal = () => {
      dismiss()
      if (activeNotification.dismissAction) {
        activeNotification.dismissAction()
      }
    }

    const primaryButtonAction = async () => {
      if (activeNotification.primaryButtonAction) {
        setPrimaryIsLoading(true)
        await activeNotification.primaryButtonAction()
        setPrimaryIsLoading(false)
      }
      dismiss()
    }

    const secondaryButtonAction = async () => {
      if (activeNotification.secondaryButtonAction) {
        setSecondaryIsLoading(true)
        await activeNotification.secondaryButtonAction()
        setSecondaryIsLoading(false)
      }
      dismiss()
    }

    return {
      title: activeNotification.title,
      isVisible: Boolean(activeNotification),
      toggleModal,
      showCloseIcon: Boolean(activeNotification.dismissAction),
      primaryButtonTitle: activeNotification.primaryButtonTitle,
      primaryButtonAction,
      secondaryButtonTitle: activeNotification.secondaryButtonTitle,
      secondaryButtonAction,
      text: activeNotification.text,
      icon: activeNotification.icon,
    }
  }, [activeNotification, dismiss, setPrimaryIsLoading, setSecondaryIsLoading])

  return (
    <NotificationModalContext.Provider
      value={{
        notify,
      }}
    >
      {children}

      {modalInfo && (
        <CustomModal
          isVisible={modalInfo.isVisible}
          toggleModal={modalInfo.toggleModal}
          title={modalInfo.title}
          showCloseIconButton={modalInfo.showCloseIcon}
          primaryButtonTitle={modalInfo.primaryButtonTitle}
          primaryButtonOnPress={modalInfo.primaryButtonAction}
          primaryButtonLoading={primaryIsLoading}
          secondaryButtonOnPress={modalInfo.secondaryButtonAction}
          secondaryButtonTitle={modalInfo.secondaryButtonTitle}
          secondaryButtonLoading={secondaryIsLoading}
          image={
            modalInfo.icon && (
              <GaloyIcon
                name={modalInfo.icon as IconNamesType}
                size={100}
                color={colors.primary3}
              />
            )
          }
          body={
            <Text type="h2" style={styles.bodyText}>
              {modalInfo.text}
            </Text>
          }
        />
      )}
    </NotificationModalContext.Provider>
  )
}

const useStyles = makeStyles(() => ({
  bodyText: {
    textAlign: "center",
  },
}))

export const useNotificationModal = () => useContext(NotificationModalContext)
