// @flow

import * as asyncStorageActions from '@microbusiness/common-react/src/asyncStorage/Actions';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { NavigationActions } from 'react-navigation';
import { bindActionCreators } from 'redux';
import PinView from './PinView';

class PinContainer extends Component {
  componentDidMount = () => {
    const { restaurant: { id, pin, configurations } } = this.props;

    this.props.asyncStorageActions.writeValue(Map({ key: 'restaurantId', value: id }));
    this.props.asyncStorageActions.writeValue(Map({ key: 'pin', value: pin }));
    this.props.asyncStorageActions.writeValue(Map({ key: 'restaurantConfigurations', value: JSON.stringify(configurations) }));
  };

  render = () => <PinView onPinMatched={this.props.navigateToTables} matchingPin={this.props.restaurant.pin} />;
}

function mapStateToProps(state, props) {
  return {
    restaurant: props.user.restaurants.edges[0].node,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    asyncStorageActions: bindActionCreators(asyncStorageActions, dispatch),
    navigateToTables: () => dispatch(NavigationActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'Tables' })] })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PinContainer);
