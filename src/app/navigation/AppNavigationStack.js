// @flow

import { StackNavigator } from 'react-navigation';
import HomeNavigationTab, { WrappedHomeNavigationTabWithI18NOrders } from './HomeNavigationTab';
import { DefaultColor } from '../../style';
import { MenuItem } from '../menuItem';
import { Tables } from '../tables';
import { TableSetupContainer } from '../tableSetup';
import { LandingContainer } from '../landing';
import { TableDetail } from '../tableDetail';
import { OrderConfirmedContainer } from '../orderConfirmed';
import { Pin } from '../pin/';

export default StackNavigator(
  {
    Pin: {
      screen: Pin,
    },
    Tables: {
      screen: Tables,
    },
    TableSetup: {
      screen: TableSetupContainer,
    },
    TableDetail: {
      screen: TableDetail,
    },
    Landing: {
      screen: LandingContainer,
    },
    Home: {
      screen: HomeNavigationTab,
    },
    HomeOrders: {
      screen: WrappedHomeNavigationTabWithI18NOrders,
    },
    MenuItem: {
      screen: MenuItem,
    },
    OrderConfirmed: {
      screen: OrderConfirmedContainer,
    },
  },
  {
    cardStyle: {
      backgroundColor: DefaultColor.defaultBackgroundColor,
    },
  },
);
