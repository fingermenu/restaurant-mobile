// @flow

import React, { Component } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { Button } from 'react-native-elements';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import OrderItemRow from './OrderItemRow';
import Styles from './Styles';
import { ListItemSeparator } from '../../components/list';
import { DefaultColor, DefaultStyles } from '../../style';
import { MenuActionButton } from '../../components/menuActionButton';

class OrdersView extends Component {
  onOrderConfirmed = () => {
    this.confirmOrderPopupDialog.dismiss();
    this.props.onConfirmOrderPressed();
  };

  onOrderConfirmedCancelled = () => {
    this.confirmOrderPopupDialog.dismiss();
  };

  onConfirmOrderPressed = () => {
    if (this.props.orders.length > 0) {
      this.confirmOrderPopupDialog.show();
    }
  };

  setConfirmOrderPopupDialogRef = popupDialog => {
    this.confirmOrderPopupDialog = popupDialog;
  };

  keyExtractor = item => item.orderItemId;

  renderItem = info => (
    <OrderItemRow
      orderItem={info.item.data}
      orderItemId={info.item.orderItemId}
      menuItem={info.item.data.menuItem}
      menuItemCurrentPrice={info.item.data.currentPrice}
      onViewOrderItemPressed={this.props.onViewOrderItemPressed}
      onRemoveOrderPressed={this.props.onRemoveOrderPressed}
      popupDialog={this.popupDialog}
    />
  );

  renderSeparator = () => <ListItemSeparator />;

  render = () => {
    const slideAnimation = new SlideAnimation({
      slideFrom: 'bottom',
    });

    return (
      <View style={Styles.container}>
        <PopupDialog
          width={400}
          height={200}
          dialogTitle={<DialogTitle title="Place Your Order" />}
          dialogAnimation={slideAnimation}
          ref={this.setConfirmOrderPopupDialogRef}
        >
          <View style={Styles.popupDialogContainer}>
            <Text style={[DefaultStyles.primaryLabelFont, Styles.popupDialogText]}>Are you sure to place your order now?</Text>
            <View style={[DefaultStyles.rowContainer, Styles.popupDialogButtonContainer]}>
              <Button title="No" buttonStyle={Styles.popupDialogButton} onPress={this.onOrderConfirmedCancelled} />
              <Button title="Yes" buttonStyle={Styles.popupDialogButton} onPress={this.onOrderConfirmed} />
            </View>
          </View>
        </PopupDialog>
        <View style={Styles.headerContainer}>
          <Text style={DefaultStyles.primaryTitleFont}>
            Table {this.props.tableName} {this.props.customerName}
          </Text>
          <Text style={DefaultStyles.primaryLabelFont}>Your Orders</Text>
        </View>

        {this.props.orders.length > 0 ? (
          <FlatList
            data={this.props.orders}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            onEndReached={this.props.onEndReached}
            onRefresh={this.props.onRefresh}
            refreshing={this.props.isFetchingTop}
            ItemSeparatorComponent={this.renderSeparator}
          />
        ) : (
          <ScrollView contentContainerStyle={Styles.emptyOrdersContainer}>
            <Text style={DefaultStyles.primaryLabelFont}>No orders have been placed yet.</Text>
          </ScrollView>
        )}
        <MenuActionButton restaurantId={this.props.restaurantId} />
        <Button
          title="Place Order"
          icon={{ name: 'md-checkmark', type: 'ionicon' }}
          backgroundColor={this.props.orders.length === 0 ? DefaultColor.defaultFontColorDisabled : DefaultColor.defaultButtonColor}
          onPress={this.onConfirmOrderPressed}
        />
      </View>
    );
  };
}

OrdersView.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewOrderItemPressed: PropTypes.func.isRequired,
  onRemoveOrderPressed: PropTypes.func.isRequired,
  onConfirmOrderPressed: PropTypes.func.isRequired,
  tableName: PropTypes.string.isRequired,
  customerName: PropTypes.string.isRequired,
  restaurantId: PropTypes.string.isRequired,
};

export default OrdersView;
