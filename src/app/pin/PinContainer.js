// @flow

import * as userAccessActions from '@microbusiness/common-react/src/userAccess/Actions';
import { UserAccessStatus } from '@microbusiness/common-react';
import * as googleAnalyticsTrackerActions from '@microbusiness/google-analytics-react-native/src/googleAnalyticsTracker/Actions';
import * as asyncStorageActions from '@microbusiness/common-react/src/asyncStorage/Actions';
import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import { Map } from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import { bindActionCreators } from 'redux';
import RNRestart from 'react-native-restart';
import PinView from './PinView';

class PinContainer extends Component {
  static getDerivedStateFromProps = nextProps => {
    if (nextProps.signOutStatus === UserAccessStatus.SUCCEEDED) {
      RNRestart.Restart();
    }

    return null;
  };

  state = {};

  componentDidMount = () => {
    const {
      restaurant: { id, pin, configurations },
    } = this.props;

    this.props.asyncStorageActions.writeValue(Map({ key: 'restaurantId', value: id }));
    this.props.asyncStorageActions.writeValue(Map({ key: 'pin', value: pin }));
    this.props.asyncStorageActions.writeValue(Map({ key: 'restaurantConfigurations', value: JSON.stringify(configurations) }));
  };

  handleSecretPinMatched = () => {
    AsyncStorage.clear(() => {
      this.props.userAccessActions.signOut();
    });
  };

  handlePinMatched = () => {
    this.props.googleAnalyticsTrackerActions.trackEvent(
      Map({ category: 'ui-waiter', action: 'Pin-navigate', optionalValues: Map({ label: 'Tables', value: 0 }) }),
    );
    this.props.navigateToTables();
  };

  render = () => (
    <PinView
      secretPin="1875"
      matchingPin={this.props.restaurant.pin}
      onSecretPinMatched={this.handleSecretPinMatched}
      onPinMatched={this.handlePinMatched}
    />
  );
}

PinContainer.propTypes = {
  asyncStorageActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  userAccessActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  googleAnalyticsTrackerActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigateToTables: PropTypes.func.isRequired,
  signOutStatus: PropTypes.number.isRequired,
};

function mapStateToProps(state, props) {
  return {
    restaurant: props.user.restaurants.edges[0].node,
    signOutStatus: state.userAccess.get('signOutStatus'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    asyncStorageActions: bindActionCreators(asyncStorageActions, dispatch),
    userAccessActions: bindActionCreators(userAccessActions, dispatch),
    googleAnalyticsTrackerActions: bindActionCreators(googleAnalyticsTrackerActions, dispatch),
    navigateToTables: () => dispatch(NavigationActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'Tables' })] })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PinContainer);
