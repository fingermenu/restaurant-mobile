// @flow

import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationActions } from 'react-navigation';
import PropTypes from 'prop-types';
import int from 'int';
import MenuActionButtonView from './MenuActionButtonView';
import * as applicationStateActions from '../../framework/applicationState/Actions';
import { MenusProp } from './PropTypes';

class MenuActionButtonContainer extends Component {
  onMenuActionButtonPressed = id => {
    const { applicationStateActions, navigateToMenu } = this.props;

    applicationStateActions.setActiveMenu(Map({ id }));
    navigateToMenu();
  };

  render = () => {
    const { menus } = this.props;

    return (
      <MenuActionButtonView
        menus={menus
          .slice() // Reason to call slice here is Javascript sort function does not work on immutable array
          .sort((menu1, menu2) => int(menu1.sortOrderIndex).cmp(menu2.sortOrderIndex))}
        onMenuActionButtonPressed={this.onMenuActionButtonPressed}
      />
    );
  };
}

MenuActionButtonContainer.propTypes = {
  applicationStateActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigateToMenu: PropTypes.func.isRequired,
  menus: MenusProp.isRequired,
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  applicationStateActions: bindActionCreators(applicationStateActions, dispatch),
  navigateToMenu: () => dispatch(NavigationActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'Home' })] })),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MenuActionButtonContainer);
