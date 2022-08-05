import { StyleProp } from 'react-native';
import { TextInputProps, TextStyle, ViewStyle } from 'react-native';

export interface Props extends TextInputProps {
  title?: string;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  isError?: boolean;
  icon?: any;
  placeholderColor?: string
  textField?:boolean
  disabled?:boolean
}
