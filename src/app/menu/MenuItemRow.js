// @flow

import { TouchableItem } from '@microbusiness/common-react-native';
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { MenuItemPriceProp } from './PropTypes';
import config from '../../framework/config';
import Styles from './Styles';
import { DefaultColor, DefaultStyles } from '../../style';

class MenuItemRow extends Component {
  constructor(props, context) {
    super(props, context);

    this.onViewMenuItemPressedDebounced = debounce(props.onViewMenuItemPressed, config.navigationDelay);
  }

  onViewMenuItemPressed = () => {
    const {
      menuItemPrice: { id },
    } = this.props;

    this.onViewMenuItemPressedDebounced(id);
  };

  render = () => {
    const {
      isOrdered,
      menuItemPrice: {
        currentPrice,
        menuItem: { name, description, imageUrl },
        defaultChoiceItemPrices,
      },
    } = this.props;
    const priceToDisplay =
      currentPrice + defaultChoiceItemPrices.reduce((totalPrice, choiceItemPrice) => totalPrice + choiceItemPrice.currentPrice, 0.0);

    return (
      <TouchableItem onPress={this.onViewMenuItemPressed}>
        <View style={Styles.rowContainer}>
          <View>
            {imageUrl ? <FastImage style={Styles.image} resizeMode={FastImage.resizeMode.contain} source={{ uri: imageUrl }} /> : <View />}
          </View>
          <View style={Styles.columnTextContainer}>
            <Text style={DefaultStyles.primaryTitleFont}>
              {name}
            </Text>
            <Text style={DefaultStyles.primaryLabelFont}>
              {description}
            </Text>
          </View>
          {isOrdered > 0 && (
            <View style={Styles.columnOrderedIconContainer}>
              <Icon name="ios-checkmark-circle" type="ionicon" size={25} color={DefaultColor.actionButtonColor} />
            </View>
          )}
          {priceToDisplay !== 0 && (
            <Text style={DefaultStyles.primaryFont}>
              $
              {priceToDisplay.toFixed(2)}
            </Text>
          )}
        </View>
      </TouchableItem>
    );
  };
}

MenuItemRow.propTypes = {
  menuItemPrice: MenuItemPriceProp.isRequired,
  isOrdered: PropTypes.bool.isRequired,
  onViewMenuItemPressed: PropTypes.func.isRequired,
};

export default MenuItemRow;
