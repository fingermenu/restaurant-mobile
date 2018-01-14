// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View } from 'react-native';
import { TouchableIcon } from '@microbusiness/common-react-native';
import { DefaultStyles } from '../../style/DefaultStyles';
import Styles from './Styles';
import { DefaultColor } from '../../style';

class QuantityControl extends Component {
  render = () => {
    return (
      <View style={[DefaultStyles.rowContainer, Styles.container]}>
        <TouchableIcon
          iconName="plus"
          iconSize={16}
          iconContainerStyle={DefaultStyles.iconContainerStyle}
          iconType="material-community"
          onPress={this.props.onQuantityIncrease}
          iconColor={DefaultColor.touchableIconPressColor}
          iconDisabledColor={DefaultColor.defaultFontColorDisabled}
        />
        <Text>{this.props.quantity}</Text>
        <TouchableIcon
          iconName="minus"
          iconSize={16}
          iconContainerStyle={DefaultStyles.iconContainerStyle}
          iconType="material-community"
          onPress={this.props.onQuantityDecrease}
          iconColor={DefaultColor.touchableIconPressColor}
          iconDisabledColor={DefaultColor.defaultFontColorDisabled}
        />
      </View>
    );
  };
}

QuantityControl.propTypes = {
  quantity: PropTypes.number.isRequired,
  onQuantityIncrease: PropTypes.func.isRequired,
  onQuantityDecrease: PropTypes.func.isRequired,
};

export default QuantityControl;
