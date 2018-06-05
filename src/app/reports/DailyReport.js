// @flow

import * as googleAnalyticsTrackerActions from '@microbusiness/google-analytics-react-native/src/googleAnalyticsTracker/Actions';
import { ErrorMessageWithRetry, LoadingInProgress } from '@microbusiness/common-react-native';
import { Map } from 'immutable';
import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ChronoUnit, ZonedDateTime } from 'js-joda';
import { environment } from '../../framework/relay';
import { DefaultColor } from '../../style';
import DailyReportRelayContainer from './DailyReportRelayContainer';
import { HeaderContainer } from '../../components/header/';
import * as applicationStateActions from '../../framework/applicationState/Actions';
import { screenNamePrefix } from '../../framework/AnalyticHelper';

class DailyReport extends Component {
  static navigationOptions = () => ({
    title: 'Daily Report',
    headerTitle: <HeaderContainer showOpenDrawerIcon />,
    headerTintColor: DefaultColor.headerIconDefaultColor,
    headerStyle: {
      backgroundColor: DefaultColor.defaultBannerColor,
    },
  });

  state = {
    from: ZonedDateTime.now()
      .truncatedTo(ChronoUnit.DAYS)
      .toString(),
    to: ZonedDateTime.now()
      .plusDays(1)
      .truncatedTo(ChronoUnit.DAYS)
      .plusSeconds(-1)
      .toString(),
  };

  componentDidMount = () => {
    this.props.googleAnalyticsTrackerActions.trackScreenView(Map({ screenName: `${screenNamePrefix}Daily Report` }));
  };

  renderRelayComponent = ({ error, props, retry }) => {
    if (error) {
      return <ErrorMessageWithRetry errorMessage={error.message} onRetryPressed={retry} />;
    }

    if (props) {
      return <DailyReportRelayContainer user={props.user} />;
    }

    return <LoadingInProgress />;
  };

  render = () => {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query DailyReportQuery($restaurantId: ID!, $dateRange: DateRange!) {
            user {
              ...DailyReportRelayContainer_user
            }
          }
        `}
        variables={{
          restaurantId: this.props.restaurantId,
          dateRange: { from: this.state.from, to: this.state.to },
        }}
        render={this.renderRelayComponent}
      />
    );
  };
}

DailyReport.propTypes = {
  applicationStateActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  googleAnalyticsTrackerActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  restaurantId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  restaurantId: state.applicationState.getIn(['activeRestaurant', 'id']),
});

const mapDispatchToProps = dispatch => ({
  applicationStateActions: bindActionCreators(applicationStateActions, dispatch),
  googleAnalyticsTrackerActions: bindActionCreators(googleAnalyticsTrackerActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(translate()(DailyReport));
