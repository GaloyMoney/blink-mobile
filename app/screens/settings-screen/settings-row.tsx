import { CustomIcon } from "@app/components/custom-icon"
import { palette } from "@app/theme"
import React from "react"
import { Divider, Icon, ListItem, Text } from "@rneui/base"
import { testProps } from "../../utils/testProps"
import { useDarkMode } from "@app/hooks/use-darkmode"
import { makeStyles } from "@rneui/themed"

const useStyles = makeStyles((theme) => ({
  container: {
    borderColor: theme.colors.grey10,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
  },
  styleDivider: { backgroundColor: theme.colors.lighterGreyOrBlack, height: 18 },
}))

export const SettingsRow: React.FC<{ setting: SettingRow }> = ({ setting }) => {
  const darkMode = useDarkMode()
  const styles = useStyles()

  if (setting.hidden) {
    return null
  }

  let settingColor: string
  let settingStyle: { color: string }

  if (setting?.dangerous) {
    settingColor = setting.greyed ? palette.midGrey : palette.red
    settingStyle = { color: palette.red }
  } else {
    const settingColorLight = setting.greyed ? palette.midGrey : palette.darkGrey
    const settingColorDark = setting.greyed ? palette.midGrey : palette.white
    settingColor = darkMode ? settingColorDark : settingColorLight
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
        {setting.enabled && <ListItem.Chevron name="chevron-forward" type="ionicon" />}
      </ListItem>
      {setting.styleDivider && <Divider style={styles.styleDivider} />}
    </React.Fragment>
  )
}
