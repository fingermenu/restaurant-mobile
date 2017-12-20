// @flow

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  rowContainer: {
    // flex: 1,
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextContainer: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
  },
  image: {
    width: 50,
    height: 50,
  },
  title: {
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
  },
  price: {
    fontSize: 14,
  },
});