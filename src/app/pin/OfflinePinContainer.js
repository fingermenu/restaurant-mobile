// @flow

import * as userAccessActions from '@microbusiness/common-react/src/userAccess/Actions';
import { UserAccessStatus } from '@microbusiness/common-react';
import * as googleAnalyticsTrackerActions from '@microbusiness/google-analytics-react-native/src/googleAnalyticsTracker/Actions';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AsyncStorage } from 'react-native';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationActions } from 'react-navigation';
import RNRestart from 'react-native-restart';
import PinView from './PinView';

class OfflinePinContainer extends Component {
  static getDerivedStateFromProps = nextProps => {
    if (nextProps.signOutStatus === UserAccessStatus.SUCCEEDED) {
      RNRestart.Restart();
    }

    return null;
  };

  state = {};

  handleSecretPinMatched = () => {
    AsyncStorage.clear(() => {
      this.props.userAccessActions.signOut();
    });
  };

  handlePinMatched = () => {
    this.props.googleAnalyticsTrackerActions.trackEvent(
      Map({ category: 'ui-waiter', action: 'OfflinePin-navigate', optionalValues: Map({ label: 'Tables', value: 0 }) }),
    );
    this.props.navigateToTables();
  };

  render = () => (
    <PinView secretPin="1875" matchingPin={this.props.pin} onSecretPinMatched={this.handleSecretPinMatched} onPinMatched={this.handlePinMatched} />
  );
}

OfflinePinContainer.propTypes = {
  googleAnalyticsTrackerActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  userAccessActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigateToTables: PropTypes.func.isRequired,
  pin: PropTypes.string.isRequired,
  signOutStatus: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    signOutStatus: state.userAccess.get('signOutStatus'),
    pin: state.applicationState.getIn(['activeRestaurant', 'pin']),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    googleAnalyticsTrackerActions: bindActionCreators(googleAnalyticsTrackerActions, dispatch),
    userAccessActions: bindActionCreators(userAccessActions, dispatch),
    navigateToTables: () => dispatch(NavigationActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'Tables' })] })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OfflinePinContainer);
