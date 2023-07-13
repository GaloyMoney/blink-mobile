import { CustomIcon } from "@app/components/custom-icon"
import React from "react"
import { Divider, Icon, ListItem, Text, makeStyles, useTheme } from "@rneui/themed"
import { testProps } from "../../utils/testProps"

const useStyles = makeStyles(({ colors }) => ({
  container: {
    borderColor: colors.grey5,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  styleDivider: {
    height: 18,
  },
}))

export const SettingsRow: React.FC<{ setting: SettingRow }> = ({ setting }) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()

  if (setting.hidden) {
    return null
  }

  let settingColor: string
  let settingStyle: { color: string }

  if (setting?.dangerous) {
    settingColor = setting.greyed ? colors.grey2 : colors.error
    settingStyle = { color: colors.error }
  } else {
    settingColor = setting.greyed ? colors.grey2 : colors.black
    settingStyle = { color: settingColor }
  }

  return (
    <React.Fragment key={`setting-option-${setting.id}`}>
      <ListItem
        onPress={setting.action}
        disabled={!setting.enabled}
        containerStyle={styles.container}
      >
        {!setting.icon?.startsWith("custom") && (
          <Icon name={setting.icon} type="ionicon" color={settingColor} />
        )}
        {setting.icon?.startsWith("custom") && (
          <CustomIcon name={setting.icon} color={settingColor} />
        )}
        <ListItem.Content>
          <ListItem.Title {...testProps(setting.category)} style={settingStyle}>
            <Text style={settingStyle}>{setting.category}</Text>
          </ListItem.Title>
          {setting.subTitleText && (
            <ListItem.Subtitle {...testProps(setting.subTitleText)} style={settingStyle}>
              <Text style={settingStyle}>{setting.subTitleText}</Text>
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        {setting.enabled && setting.chevron !== false && (
          <ListItem.Chevron
            name={setting.chevronLogo ?? "chevron-forward"}
            color={setting.chevronColor}
            size={setting.chevronSize ?? undefined}
            type="ionicon"
          />
        )}
      </ListItem>
      {setting.styleDivider && (
        <Divider style={styles.styleDivider} color={colors.grey4} />
      )}
    </React.Fragment>
  )
}
