// @flow

import { StyleSheet } from 'react-native';
import { DefaultColor } from '../../style';

export default StyleSheet.create({
  container: {
    // flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'stretch',
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  touchableContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#EFF0F1',
  },
  selectedNumberContainer: {
    backgroundColor: DefaultColor.defaultThemeColor,
    borderColor: DefaultColor.defaultButtonColor,
    borderWidth: 2,
    padding: 5,
  },
  defaultNumberContainer: {
    backgroundColor: 'grey',
    borderColor: DefaultColor.defaultButtonColor,
    borderWidth: 2,
    padding: 5,
  },
});
