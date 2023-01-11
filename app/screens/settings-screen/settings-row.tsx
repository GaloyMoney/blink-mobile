import { CustomIcon } from "@app/components/custom-icon"
import { palette } from "@app/theme"
import React from "react"
import { Divider, Icon, ListItem, Text } from "@rneui/base"
import { testProps } from "../../../utils/testProps"

export const SettingsRow = ({ setting }: { setting: SettingRow }) => {
  if (setting.hidden) {
    return null
  }
  let settingColor
  let settingStyle
  if (setting?.dangerous) {
    settingColor = setting.greyed ? palette.midGrey : palette.red
    settingStyle = { color: palette.red }
  } else {
    settingColor = setting.greyed ? palette.midGrey : palette.darkGrey
    settingStyle = { color: settingColor }
  }

  return (
    <React.Fragment key={`setting-option-${setting.id}`}>
      <ListItem onPress={setting.action} disabled={!setting.enabled}>
        {!setting.icon?.startsWith("custom") && (
          <Icon name={setting.icon} type="ionicon" color={settingColor} />
        )}
        {setting.icon?.startsWith("custom") && (
          <CustomIcon name={setting.icon} color={settingColor} />
        )}
        <ListItem.Content>
          <ListItem.Title {...testProps(setting.category)} style={settingStyle}>
            <Text>{setting.category}</Text>
          </ListItem.Title>
          {setting.subTitleText && (
            <ListItem.Subtitle {...testProps(setting.subTitleText)} style={settingStyle}>
              <Text>{setting.subTitleText}</Text>
            </ListItem.Subtitle>
          )}
        </ListItem.Content>
        {setting.enabled && <ListItem.Chevron />}
      </ListItem>
      <Divider style={setting.styleDivider} />
    </React.Fragment>
  )
}
