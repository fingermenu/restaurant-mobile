// @flow

import React, { Component } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { Button, Icon, Input } from 'react-native-elements';
import PopupDialog, { DialogTitle, SlideAnimation } from 'react-native-popup-dialog';
import { translate } from 'react-i18next';
import OrderItemRow from './OrderItemRow';
import Styles from './Styles';
import { ListItemSeparator } from '../../components/list';
import { DefaultColor, DefaultStyles } from '../../style';
import { MenuActionButtonContainer } from '../../components/menuActionButton';
import { MenusProp, OrderItemDetailsProp } from './PropTypes';

class OrdersView extends Component {
  onOrderConfirmed = () => {
    this.confirmOrderPopupDialog.dismiss();
    this.props.onConfirmOrderPressed();
  };

  onOrderConfirmedCancelled = () => {
    this.confirmOrderPopupDialog.dismiss();
  };

  onConfirmOrderPressed = () => {
    if (this.props.inMemoryOrderItems.length > 0) {
      this.confirmOrderPopupDialog.show();
    }
  };

  setConfirmOrderPopupDialogRef = popupDialog => {
    this.confirmOrderPopupDialog = popupDialog;
  };

  keyExtractor = item => item.id;

  renderItem = info => (
    <OrderItemRow
      orderItem={info.item}
      menuItemCurrentPrice={info.item.currentPrice}
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
    const { t, notes, inMemoryOrderItems, tableName, customerName, onEndReached, onRefresh, isRefreshing, menus, onNotesChanged } = this.props;

    return (
      <View style={Styles.container}>
        <PopupDialog
          width={400}
          height={200}
          dialogTitle={<DialogTitle title={t('placeYourOrder.label')} />}
          dialogAnimation={slideAnimation}
          ref={this.setConfirmOrderPopupDialogRef}
        >
          <View style={Styles.popupDialogContainer}>
            <Text style={[DefaultStyles.primaryLabelFont, Styles.popupDialogText]}>{t('areYouSureToPlaceYourOrderNow.message')}</Text>
            <View style={[DefaultStyles.rowContainer, Styles.popupDialogButtonContainer]}>
              <Button
                title={t('no.button')}
                containerStyle={Styles.buttonContainer}
                buttonStyle={Styles.popupDialogButton}
                onPress={this.onOrderConfirmedCancelled}
              />
              <Button
                title={t('yes.button')}
                containerStyle={Styles.buttonContainer}
                buttonStyle={Styles.popupDialogButton}
                onPress={this.onOrderConfirmed}
              />
            </View>
          </View>
        </PopupDialog>
        <View style={Styles.headerContainer}>
          <Text style={DefaultStyles.primaryTitleFont}>
            {t('table.label').replace('{tableName}', tableName) + (customerName ? ',' + customerName : '')}
          </Text>
          <Text style={DefaultStyles.primaryLabelFont}>{t('yourOrder.label')}</Text>
        </View>

        {inMemoryOrderItems.length > 0 ? (
          <FlatList
            data={inMemoryOrderItems}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
            onEndReached={onEndReached}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            ItemSeparatorComponent={this.renderSeparator}
          />
        ) : (
          <ScrollView contentContainerStyle={Styles.emptyOrdersContainer}>
            <Text style={DefaultStyles.primaryLabelFont}>{t('noOrdersHaveBeenPlacedYet.message')}</Text>
          </ScrollView>
        )}
        <Input placeholder={t('notes.placeholder')} value={notes} onChangeText={onNotesChanged} />
        <MenuActionButtonContainer menus={menus} />
        <Button
          title={t('placeOrder.button')}
          icon={<Icon name="md-checkmark" type="ionicon" />}
          backgroundColor={inMemoryOrderItems.length === 0 ? DefaultColor.defaultFontColorDisabled : DefaultColor.defaultButtonColor}
          onPress={this.onConfirmOrderPressed}
        />
      </View>
    );
  };
}

OrdersView.propTypes = {
  isRefreshing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onEndReached: PropTypes.func.isRequired,
  inMemoryOrderItems: OrderItemDetailsProp.isRequired,
  onViewOrderItemPressed: PropTypes.func.isRequired,
  onRemoveOrderPressed: PropTypes.func.isRequired,
  onConfirmOrderPressed: PropTypes.func.isRequired,
  onNotesChanged: PropTypes.func.isRequired,
  tableName: PropTypes.string.isRequired,
  menus: MenusProp.isRequired,
  customerName: PropTypes.string,
  notes: PropTypes.string,
};

OrdersView.defaultProps = {
  customerName: null,
  notes: null,
};

export default translate()(OrdersView);
