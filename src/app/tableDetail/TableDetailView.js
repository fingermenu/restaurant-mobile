// @flow

import React, { Component } from 'react';
import { FlatList, Text, TouchableNative, View } from 'react-native';
import ActionButton from 'react-native-action-button';
import OrderItemRow from '../orders/OrderItemRow';
import Styles from './Styles';
import { Badge, Button, Icon } from 'react-native-elements';
import { DefaultColor } from '../../style';

class TableDetailView extends Component {
  render = () => {
    return (
      <View style={Styles.container}>
        <View style={Styles.headerContainer}>
          <Text>Table : {this.props.table.name}</Text>
          <Badge
            value="Taken"
            textStyle={Styles.tableText}
            component={TouchableNative}
            containerStyle={[Styles.tableBadgeContainer, Styles.tableBadgeTaken]}
            wrapperStyle={Styles.tableBadgeWrapper}
          />
          <Text style={Styles.price}>$76</Text>
        </View>
        <FlatList
          data={this.props.table.orders}
          renderItem={info => (
            <OrderItemRow
              orderItem={info.item}
              onViewOrderItemPressed={this.props.onViewOrderItemPressed}
              onRemoveOrderPressed={this.props.onRemoveOrderPressed}
            />
          )}
          keyExtractor={item => item.id}
          onEndReached={this.props.onEndReached}
          onRefresh={this.props.onRefresh}
          refreshing={this.props.isFetchingTop}
        />
        <View style={Styles.buttonsContainer}>
          <Button title="Set paid" backgroundColor={DefaultColor.defaultButtonColor} />
          <Button title="Reset table" backgroundColor={DefaultColor.defaultButtonColor} />
        </View>
        <ActionButton buttonColor={DefaultColor.actionButtonColor} offsetX={50} onPress={() => {}}>
          <ActionButton.Item buttonColor="#9b59b6" title="Drink" onPress={() => {}}>
            <Icon name="md-create" type="ionicon" style={Styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor="#3498db" title="Desert" onPress={() => {}}>
            <Icon name="md-notifications-off" type="ionicon" style={Styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor="#1abc9c" title="Kids" onPress={() => {}}>
            <Icon name="md-done-all" type="ionicon" style={Styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>
      </View>
    );
  };
}

export default TableDetailView;