// @flow

import React, { Component } from 'react';
// import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { FlatList, Text, View, TouchableNative } from 'react-native';
import { TouchableItem } from '@microbusiness/common-react-native';
import { TablesProp } from './PropTypes';
import { Badge } from 'react-native-elements';
import Styles from './Styles';
import { translate } from 'react-i18next';

class TablesView extends Component {
  renderItem = item => {
    return (
      <TouchableItem onPress={() => this.props.onTablePressed(item.item)}>
        <View style={Styles.tableContainer}>
          <Badge
            value={item.item.name}
            textStyle={Styles.tableText}
            component={TouchableNative}
            containerStyle={Styles.tableBadgeContainer}
            wrapperStyle={Styles.tableBadgeWrapper}
          />
          <View style={Styles.tableTextContainer}>
            <Text>{item.item.numberOfAdults ? item.item.numberOfAdults : 0}</Text>
            <Text>{item.item.numberOfChildren ? item.item.numberOfAdults : 0}</Text>
          </View>
        </View>
      </TouchableItem>
    );
  };

  render = () => {
    const { t } = this.props;
    // const groupedTables = Immutable.fromJS(this.props.tables)
    //   .groupBy(t => t.getIn(['tableState', 'key']))
    //   .mapEntries(([key, value]) => [
    //     key,
    //     {
    //       key,
    //       tables: value,
    //       count: value.count(),
    //     },
    //   ])
    //   .sortBy(_ => _.key)
    //   .valueSeq()
    //   .toJS();

    // const takenCount = groupedTables.getIn(['taken', 'tables']).count();
    // const emptyCount = groupedTables.getIn(['empty', 'tables']).count();
    // const takenCount = groupedTables.getIn(['taken', 'tables']).count();
    // const takenCount = groupedTables.getIn(['taken', 'tables']).count();
    return (
      <View style={Styles.container}>
        <View>
          <Text>{t('table.manageTable')}</Text>
        </View>
        <FlatList
          data={this.props.tables}
          keyExtractor={item => {
            return item.id;
          }}
          numColumns={3}
          renderItem={this.renderItem}
        />
        <View style={Styles.tableLegendsContainer}>
          <Badge
            value="T 2"
            textStyle={Styles.tableText}
            component={TouchableNative}
            containerStyle={[Styles.tableBadgeContainer, Styles.tableBadgeTaken]}
            wrapperStyle={Styles.tableBadgeWrapper}
          />
          <Badge
            value="N 3"
            textStyle={Styles.tableText}
            component={TouchableNative}
            containerStyle={[Styles.tableBadgeContainer, Styles.tableBadgeEmpty]}
            wrapperStyle={Styles.tableBadgeWrapper}
          />
          <Badge
            value="R 1"
            textStyle={Styles.tableText}
            component={TouchableNative}
            containerStyle={[Styles.tableBadgeContainer, Styles.tableBadgeReserve]}
            wrapperStyle={Styles.tableBadgeWrapper}
          />
          <Badge
            value="$ 2"
            textStyle={Styles.tableText}
            component={TouchableNative}
            containerStyle={[Styles.tableBadgeContainer, Styles.tableBadgePaid]}
            wrapperStyle={Styles.tableBadgeWrapper}
          />
        </View>
      </View>
    );
  };
}

TablesView.propTypes = {
  menuItems: TablesProp,
  onTablePressed: PropTypes.func.isRequired,
};

export default translate()(TablesView);
