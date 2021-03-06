// @flow

import React, { Component } from 'react';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { FlatList, Text, View } from 'react-native';
import { TouchableItem } from '@microbusiness/common-react-native';
import { Avatar } from 'react-native-elements';
import { translate } from 'react-i18next';
import { ImageUtility } from '../../components/image';
import TableView from './TableView';
import Styles from './Styles';
import Common from './Common';
import { DefaultStyles, ScreenSize } from '../../style';

class TablesView extends Component {
  keyExtractor = item => item.id;

  renderItem = item => {
    const { onTablePressed } = this.props;

    return <TableView table={item.item} onTablePressed={onTablePressed} />;
  };

  renderBadgeSummaryItem = item => {
    const style = Common.getTableStyle(item.key);
    const width = ScreenSize({ xs: 34, s: 50, l: 75, xl: 100 }, 100);
    return (
      <TouchableItem accessibilityComponentType="button" accessibilityTraits="button" delayPressIn={0} borderless>
        <View style={Styles.tableSummaryContainer}>
          <Avatar
            rounded
            height={width}
            width={width}
            overlayContainerStyle={style}
            source={ImageUtility.getImageSource(item.key)}
            activeOpacity={0.7}
          />
          <Text>
            {item.count}
          </Text>
        </View>
      </TouchableItem>
    );
  };

  render = () => {
    const { t, onEndReached, onRefresh, isRefreshing, tables } = this.props;
    const groupedTables = Immutable.fromJS(tables)
      .groupBy(t => (t.has('tableState') ? t.getIn(['tableState', 'key']) : 'empty'))
      .mapEntries(([key, value]) => [
        key,
        {
          key: key ? key : 'empty',
          tables: value,
          count: value.count(),
        },
      ])
      .sortBy(_ => _.key)
      .valueSeq();

    return (
      <View style={Styles.container}>
        <View>
          <Text style={DefaultStyles.primaryTitleFont}>
            {t('manageTable.label')}
          </Text>
        </View>
        <FlatList
          data={tables}
          keyExtractor={this.keyExtractor}
          numColumns={3}
          renderItem={this.renderItem}
          onEndReached={onEndReached}
          onRefresh={onRefresh}
          refreshing={isRefreshing}
        />
        <View style={Styles.tableLegendsContainer}>
          {this.renderBadgeSummaryItem({
            key: 'empty',
            count: groupedTables.filter(t => t.key === 'empty').first() ? groupedTables.filter(t => t.key === 'empty').first().count : 0,
          })}
          {this.renderBadgeSummaryItem({
            key: 'taken',
            count: groupedTables.filter(t => t.key === 'taken').first() ? groupedTables.filter(t => t.key === 'taken').first().count : 0,
          })}
          {this.renderBadgeSummaryItem({
            key: 'reserved',
            count: groupedTables.filter(t => t.key === 'reserved').first() ? groupedTables.filter(t => t.key === 'reserved').first().count : 0,
          })}
          {this.renderBadgeSummaryItem({
            key: 'paid',
            count: groupedTables.filter(t => t.key === 'paid').first() ? groupedTables.filter(t => t.key === 'paid').first().count : 0,
          })}
        </View>
      </View>
    );
  };
}

TablesView.propTypes = {
  isRefreshing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onEndReached: PropTypes.func.isRequired,
  onTablePressed: PropTypes.func.isRequired,
};

export default translate()(TablesView);
