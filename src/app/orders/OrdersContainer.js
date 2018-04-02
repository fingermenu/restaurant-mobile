// @flow

import * as escPosPrinterActions from '@microbusiness/printer-react-native/src/escPosPrinter/Actions';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Immutable, { Map, Range } from 'immutable';
import { DateTimeFormatter } from 'js-joda';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationActions } from 'react-navigation';
import OrdersView from './OrdersView';
import { PlaceOrder } from '../../framework/relay/mutations';
import { OrderProp } from './PropTypes';
import * as applicationStateActions from '../../framework/applicationState/Actions';
import { ActiveCustomerProp } from '../../framework/applicationState';

const endingDots = '.';
const maxLineLength = 48;
const endOfLine = '\r\n';

class OrdersContainer extends Component {
  static alignTextsOnEachEdge = (leftStr, rightStr, width = maxLineLength, padding = ' ') => {
    if (leftStr.length + rightStr.length <= width - 1) {
      return leftStr + Array(width - (leftStr.length + rightStr.length)).join(padding) + rightStr;
    }

    if (rightStr.length > width - 1) {
      throw new Error('Can\'t fit the right text.');
    }

    if (leftStr.length + rightStr.length > width - 1 && rightStr.length > width - endingDots.length) {
      throw new Error('Can\'t fit the right text.');
    }

    return leftStr.substring(0, width - (1 + endingDots.length + rightStr.length)) + endingDots + padding + rightStr;
  };

  static splitTextIntoMultipleLines = (str, prefixStr = '', lineLength = maxLineLength) => {
    if (!str) {
      return '';
    }

    const trimmedStr = str.trim();

    if (trimmedStr.length === 0) {
      return '';
    }

    const finalStr = prefixStr + trimmedStr;

    return Range(0, finalStr.length / lineLength)
      .map(idx => finalStr.substring(idx * lineLength, (idx + 1) * lineLength))
      .reduce((reduction, value) => reduction + value + endOfLine, '');
  };

  static convertOrderToOrderRequest = order =>
    order.update('details', details =>
      details.map(detail => {
        const menuItemPrice = detail.get('menuItemPrice');

        return detail
          .merge(
            Map({
              menuItemPriceId: menuItemPrice.get('id'),
              quantity: detail.get('quantity'),
              notes: detail.get('notes'),
              paid: detail.get('paid'),
              orderChoiceItemPrices: detail.get('orderChoiceItemPrices').map(orderChoiceItemPrice => {
                const choiceItemPrice = orderChoiceItemPrice.get('choiceItemPrice');

                return orderChoiceItemPrice
                  .merge(
                    Map({
                      choiceItemPriceId: choiceItemPrice.get('id'),
                      quantity: orderChoiceItemPrice.get('quantity'),
                      notes: orderChoiceItemPrice.get('notes'),
                      paid: orderChoiceItemPrice.get('paid'),
                    }),
                  )
                  .delete('choiceItemPrice');
              }),
            }),
          )
          .delete('menuItemPrice');
      }),
    );

  static calculateTotalPrice = order =>
    order
      .get('details')
      .reduce(
        (total, menuItemPrice) =>
          total +
          menuItemPrice.get('quantity') *
            (menuItemPrice.getIn(['menuItemPrice', 'currentPrice']) +
              menuItemPrice
                .get('orderChoiceItemPrices')
                .reduce(
                  (totalChoiceItemPrice, orderChoiceItemPrice) =>
                    totalChoiceItemPrice + orderChoiceItemPrice.get('quantity') * orderChoiceItemPrice.getIn(['choiceItemPrice', 'currentPrice']),
                  0,
                )),
        0,
      );

  state = {
    isRefreshing: false,
  };

  componentWillReceiveProps = nextProps => {
    if (nextProps.selectedLanguage.localeCompare(this.props.selectedLanguage) !== 0) {
      this.handleRefresh();
    }
  };

  handleViewOrderItemPressed = ({ id, menuItemPrice: { id: menuItemPriceId } }) => {
    this.props.applicationStateActions.clearActiveMenuItemPrice();
    this.props.applicationStateActions.setActiveOrderMenuItemPrice(Map({ id, menuItemPriceId }));
    this.props.navigateToMenuItem();
  };

  handleConfirmOrderPressed = () => {
    const inMemoryOrder = Immutable.fromJS(this.props.inMemoryOrder);
    const orderRequest = OrdersContainer.convertOrderToOrderRequest(inMemoryOrder);
    const totalPrice = OrdersContainer.calculateTotalPrice(inMemoryOrder);
    const {
      navigateToOrderConfirmed,
      restaurantId,
      customer: { name: customerName, numberOfAdults, numberOfChildren },
      user: { table: { id: tableId } },
    } = this.props;

    PlaceOrder(
      this.props.relay.environment,
      orderRequest.merge(Map({ totalPrice, restaurantId, tableId, customerName, numberOfAdults, numberOfChildren })).toJS(),
      inMemoryOrder.get('details').map(detail => detail.get('menuItemPrice')),
      inMemoryOrder
        .get('details')
        .flatMap(detail => detail.getIn(['orderChoiceItemPrices']))
        .map(orderChoiceItemPrice => orderChoiceItemPrice.get('choiceItemPrice')),
      {
        user: this.props.user,
      },
      {
        onSuccess: response => {
          this.printOrder(response);
          navigateToOrderConfirmed();
        },
      },
    );
  };

  handleRemoveOrderPressed = ({ id }) => {
    this.props.applicationStateActions.removeItemFromActiveOrder(Map({ id }));
  };

  handleRefresh = () => {
    if (this.state.isRefreshing) {
      return;
    }

    this.setState({ isRefreshing: true });

    this.props.relay.refetch(
      _ => ({
        restaurant: _.restaurantId,
        tableId: _.tableId,
        choiceItemPriceIds: _.choiceItemPriceIds,
        menuItemPriceIds: _.menuItemPriceIds,
      }),
      null,
      () => {
        this.setState({ isRefreshing: false });
      },
    );
  };

  handleEndReached = () => true;

  handleNotesChanged = notes => {
    this.props.applicationStateActions.setActiveOrderTopInfo(Map({ notes }));
  };

  printOrder = response => {
    const { kitchenOrderTemplate, user: { table: { name: tableName } } } = this.props;

    if (!kitchenOrderTemplate) {
      return;
    }

    const orderList = response
      .get('details')
      .reduce(
        (menuItemsDetail, detail) =>
          menuItemsDetail +
          endOfLine +
          OrdersContainer.alignTextsOnEachEdge(detail.get('nameToPrint'), detail.get('quantity').toString()) +
          endOfLine +
          detail
            .get('choiceItems')
            .reduce(
              (reduction, choiceItem) =>
                reduction +
                OrdersContainer.alignTextsOnEachEdge('  ' + choiceItem.get('nameToPrint'), choiceItem.get('quantity').toString()) +
                endOfLine,
              '',
            ) +
          OrdersContainer.splitTextIntoMultipleLines(detail.get('notes'), 'Notes: '),
        '',
      );

    const { printerConfig: { hostname, port }, numberOfPrintCopiesForKitchen } = this.props;

    this.props.escPosPrinterActions.printDocument(
      Map({
        hostname,
        port,
        documentContent: kitchenOrderTemplate
          .replace('\r', '')
          .replace('\n', '')
          .replace(/{CR}/g, '\r')
          .replace(/{LF}/g, '\n')
          .replace(/{OrderDateTime}/g, response.get('placedAt').format(DateTimeFormatter.ofPattern('dd-MM-yyyy HH:mm:ss')))
          .replace(/{Notes}/g, OrdersContainer.splitTextIntoMultipleLines(response.get('notes'), 'Notes: '))
          .replace(/{CustomerName}/g, OrdersContainer.splitTextIntoMultipleLines(response.get('customerName')), 'CustomerName: ')
          .replace(/{TableName}/g, tableName)
          .replace(/{OrderList}/g, orderList),
        numberOfCopies: numberOfPrintCopiesForKitchen,
      }),
    );
  };

  render = () => {
    const { inMemoryOrder, customer: { name: customerName }, user: { restaurant: { menus }, table: { name: tableName } } } = this.props;

    return (
      <OrdersView
        inMemoryOrderItems={inMemoryOrder.details}
        onViewOrderItemPressed={this.handleViewOrderItemPressed}
        onConfirmOrderPressed={this.handleConfirmOrderPressed}
        onRemoveOrderPressed={this.handleRemoveOrderPressed}
        tableName={tableName}
        customerName={customerName}
        notes={inMemoryOrder.notes}
        menus={menus}
        isRefreshing={this.state.isRefreshing}
        onRefresh={this.handleRefresh}
        onEndReached={this.handleEndReached}
        onNotesChanged={this.handleNotesChanged}
      />
    );
  };
}

OrdersContainer.propTypes = {
  applicationStateActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  escPosPrinterActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  selectedLanguage: PropTypes.string.isRequired,
  inMemoryOrder: OrderProp.isRequired,
  navigateToMenuItem: PropTypes.func.isRequired,
  navigateToOrderConfirmed: PropTypes.func.isRequired,
  restaurantId: PropTypes.string.isRequired,
  kitchenOrderTemplate: PropTypes.string,
  customer: ActiveCustomerProp.isRequired,
  numberOfPrintCopiesForKitchen: PropTypes.number,
};

OrdersContainer.defaultProps = {
  kitchenOrderTemplate: null,
  numberOfPrintCopiesForKitchen: 1,
};

function mapStateToProps(state, ownProps) {
  const configurations = state.applicationState.getIn(['activeRestaurant', 'configurations']);
  const printerConfig = configurations
    .get('printers')
    .first()
    .toJS();
  const kitchenOrderTemplate = configurations
    .get('documentTemplates')
    .find(documentTemplate => documentTemplate.get('name').localeCompare('KitchenOrder') === 0);
  const menuItemPrices = ownProps.user.menuItemPrices.edges.map(_ => _.node);
  const choiceItemPrices = ownProps.user.choiceItemPrices.edges.map(_ => _.node);
  const inMemoryOrder = state.applicationState.get('activeOrder').update('details', details =>
    details
      .map(detail => {
        const foundMenuItemPrice = menuItemPrices.find(menuItemPrice => menuItemPrice.id.localeCompare(detail.getIn(['menuItemPrice', 'id'])) === 0);

        return detail
          .setIn(['menuItemPrice', 'currentPrice'], foundMenuItemPrice.currentPrice)
          .mergeIn(
            ['menuItemPrice', 'menuItem'],
            Map({
              name: foundMenuItemPrice ? foundMenuItemPrice.menuItem.name : null,
              imageUrl: foundMenuItemPrice ? foundMenuItemPrice.menuItem.imageUrl : null,
            }),
          )
          .update('orderChoiceItemPrices', orderChoiceItemPrices =>
            orderChoiceItemPrices.map(orderChoiceItemPrice => {
              const foundChoiceItemPrice = choiceItemPrices.find(
                choiceItemPrice => choiceItemPrice.id.localeCompare(orderChoiceItemPrice.getIn(['choiceItemPrice', 'id'])) === 0,
              );

              return orderChoiceItemPrice.setIn(['choiceItemPrice', 'currentPrice'], foundChoiceItemPrice.currentPrice).mergeIn(
                ['choiceItemPrice', 'choiceItem'],
                Map({
                  name: foundChoiceItemPrice ? foundChoiceItemPrice.choiceItem.name : null,
                  imageUrl: foundMenuItemPrice ? foundChoiceItemPrice.choiceItem.imageUrl : null,
                }),
              );
            }),
          );
      })
      .toList(),
  );

  return {
    selectedLanguage: state.applicationState.get('selectedLanguage'),
    inMemoryOrder: inMemoryOrder.toJS(),
    customer: state.applicationState.get('activeCustomer').toJS(),
    restaurantId: state.applicationState.getIn(['activeRestaurant', 'id']),
    printerConfig,
    kitchenOrderTemplate: kitchenOrderTemplate ? kitchenOrderTemplate.get('template') : null,
    numberOfPrintCopiesForKitchen: configurations.get('numberOfPrintCopiesForKitchen'),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    applicationStateActions: bindActionCreators(applicationStateActions, dispatch),
    escPosPrinterActions: bindActionCreators(escPosPrinterActions, dispatch),
    navigateToMenuItem: () => dispatch(NavigationActions.navigate({ routeName: 'MenuItem' })),
    navigateToOrderConfirmed: () =>
      dispatch(NavigationActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'OrderConfirmed' })] })),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrdersContainer);
