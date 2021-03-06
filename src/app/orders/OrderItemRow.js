// @flow

import { TouchableItem, TouchableIcon } from '@microbusiness/common-react-native';
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { View, Text } from 'react-native';
import { CheckBox } from 'react-native-elements';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import FastImage from 'react-native-fast-image';
import { OrderItemDetailProp } from './PropTypes';
import config from '../../framework/config';
import Styles from './Styles';
import { DefaultColor, DefaultStyles } from '../../style';

class OrderItemRow extends Component {
  constructor(props, context) {
    super(props, context);

    if (props.orderItemIsEditable) {
      if (props.onRemoveOrderPressed) {
        this.onRemoveOrderPressedDebounced = debounce(props.onRemoveOrderPressed, config.navigationDelay);
      }

      if (props.onViewOrderItemPressed) {
        this.onViewOrderItemPressedDebounced = debounce(props.onViewOrderItemPressed, config.navigationDelay);
      }

      if (props.onOrderSelected) {
        this.onOrderSelectedDebounced = debounce(props.onOrderSelected, config.navigationDelay);
      }
    }
  }

  handleRemoveOrderPressed = () => {
    if (this.onRemoveOrderPressedDebounced) {
      const { orderItem } = this.props;

      this.onRemoveOrderPressedDebounced(orderItem);
    }
  };

  handleViewOrderItemPressed = () => {
    if (this.onViewOrderItemPressedDebounced) {
      const { orderItem } = this.props;

      this.onViewOrderItemPressedDebounced(orderItem);
    }
  };

  handleOrderItemSelected = () => {
    if (this.onOrderSelectedDebounced) {
      const { orderItem, isSelected } = this.props;

      this.onOrderSelectedDebounced(orderItem, !isSelected);
    }
  };

  renderChoiceItemPrices = orderChoiceItemPrices =>
    orderChoiceItemPrices.map(orderChoiceItemPrice => (
      <Text key={orderChoiceItemPrice.orderChoiceItemPriceId} style={Styles.extraOptions}>
        {orderChoiceItemPrice.choiceItemPrice.choiceItem.name}
        {orderChoiceItemPrice.choiceItemPrice.currentPrice ? ' - $' + orderChoiceItemPrice.choiceItemPrice.currentPrice.toFixed(2) : ''}
      </Text>
    ));

  render = () => {
    const { t, orderItemIsEditable, orderItem, isSelected, showImage, showRemove, enableMultiSelection, backgroundColor } = this.props;
    const {
      orderChoiceItemPrices,
      notes,
      quantity,
      paid,
      menuItemPrice: {
        currentPrice,
        menuItem: { name, imageUrl },
      },
    } = orderItem;
    const totalPrice =
      currentPrice * quantity +
      quantity *
        orderChoiceItemPrices.reduce(
          (totalChoiceItemPrices, orderChoiceItemPrice) =>
            totalChoiceItemPrices + orderChoiceItemPrice.quantity * orderChoiceItemPrice.choiceItemPrice.currentPrice,
          0.0,
        );

    return (
      <TouchableItem onPress={this.handleViewOrderItemPressed}>
        <View style={[DefaultStyles.rowContainer, Styles.orderRowContainer, { backgroundColor }]}>
          {showImage && imageUrl ? <FastImage style={Styles.image} resizeMode={FastImage.resizeMode.contain} source={{ uri: imageUrl }} /> : <View />}
          {enableMultiSelection &&
            !paid && (
            <CheckBox
              center
              size={28}
              iconType="material-community"
              checkedIcon="check-circle-outline"
              uncheckedIcon="checkbox-blank-circle-outline"
              checked={isSelected}
              onPress={this.handleOrderItemSelected}
            />
          )}
          <View style={Styles.quantityContainer}>
            <Text style={DefaultStyles.primaryFont}>
              {quantity}
              x
            </Text>
          </View>
          <View style={Styles.titleContainer}>
            <Text style={DefaultStyles.primaryLabelFont}>
              {name}
            </Text>
            {notes &&
              notes.trim() && (
              <Text style={DefaultStyles.primaryFont}>
                {t('notes.label')}
                  :
                {notes}
              </Text>
            )}
            {this.renderChoiceItemPrices(orderChoiceItemPrices)}
          </View>
          <View style={DefaultStyles.rowContainer}>
            {paid && (
              <Text style={Styles.paid}>
                {t('paid.label')}
              </Text>
            )}
            <Text style={DefaultStyles.primaryLabelFont}>
              $
              {totalPrice.toFixed(2)}
            </Text>
            {orderItemIsEditable && showRemove ? (
              <TouchableIcon
                onPress={this.handleRemoveOrderPressed}
                iconName="ios-remove-circle-outline"
                iconType="ionicon"
                iconColor={DefaultColor.iconColor}
                pressColor={DefaultColor.touchableIconPressColor}
                iconDisabledColor={DefaultColor.defaultFontColorDisabled}
                iconContainerStyle={DefaultStyles.iconContainerStyle}
              />
            ) : (
              <View />
            )}
          </View>
        </View>
      </TouchableItem>
    );
  };
}

OrderItemRow.propTypes = {
  orderItem: OrderItemDetailProp.isRequired,
  onViewOrderItemPressed: PropTypes.func,
  onRemoveOrderPressed: PropTypes.func,
  onOrderSelected: PropTypes.func,
  enableMultiSelection: PropTypes.bool,
  isSelected: PropTypes.bool,
  showRemove: PropTypes.bool.isRequired,
  orderItemIsEditable: PropTypes.bool.isRequired,
  showImage: PropTypes.bool,
  backgroundColor: PropTypes.string,
};

OrderItemRow.defaultProps = {
  enableMultiSelection: false,
  isSelected: false,
  onViewOrderItemPressed: null,
  onRemoveOrderPressed: null,
  onOrderSelected: null,
  showImage: true,
  backgroundColor: null,
};

export default translate()(OrderItemRow);
