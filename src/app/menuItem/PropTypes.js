// @flow

import PropTypes from 'prop-types';

export const MenuItemProp = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
});

export const MenuItemPriceProp = PropTypes.shape({
  id: PropTypes.number.isRequired,
  currentPrice: PropTypes.string,
  menuItem: MenuItemProp,
}).isRequired;
