// @flow

import { ImmutableEx } from '@microbusiness/common-javascript';
import * as escPosPrinterActions from '@microbusiness/printer-react-native/src/escPosPrinter/Actions';
import cuid from 'cuid';
import Immutable, { List, Map, OrderedMap, Range } from 'immutable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavigationActions } from 'react-navigation';
import TableDetailView from './TableDetailView';
import { TableProp } from './PropTypes';
import { UpdateTable, UpdateOrder } from '../../framework/relay/mutations';
import * as applicationStateActions from '../../framework/applicationState/Actions';
import PrinterHelper, { endOfLine } from '../../framework/PrintHelper';

class TableDetailContainer extends Component {
  state = {
    isRefreshing: false,
  };

  setTableStateToEmpty = callbacks => {
    const {
      relay: { environment },
      table: { id },
      user,
    } = this.props;

    UpdateTable(
      environment,
      {
        id,
        tableState: 'empty',
        customers: [],
        notes: '',
        lastOrderCorrelationId: '',
      },
      {},
      {
        user,
      },
      callbacks,
    );
  };

  setTableStateToPaid = callbacks => {
    const {
      relay: { environment },
      table: { id },
      user,
    } = this.props;

    UpdateTable(
      environment,
      {
        id,
        tableState: 'paid',
      },
      {},
      {
        user,
      },
      callbacks,
    );
  };

  setActiveCustomers = table => {
    const customers = table.customers.reduce(
      (reduction, customer) =>
        reduction.set(
          customer.customerId,
          Map({
            customerId: customer.customerId,
            name: customer.name,
            type: customer.type,
          }),
        ),
      OrderedMap(),
    );

    const { applicationStateActions } = this.props;

    applicationStateActions.setActiveCustomers(
      Map({
        reservationNotes: table.notes,
        customers,
        activeCustomerId: customers.isEmpty() ? null : customers.first().get('customerId'),
      }),
    );
  };

  handleResetTablePressed = () => {
    const { goBack } = this.props;

    this.setTableStateToEmpty({
      onSuccess: () => {
        goBack();
      },
    });
  };

  handleSetPaidPressed = ({ discount, eftpos, cash }) => {
    const {
      user: {
        orders: { edges },
      },
      goBack,
    } = this.props;
    const orders = edges.map(_ => _.node);
    let totalUpdated = 0;

    orders.forEach(order => {
      this.updateOrder(
        order,
        null,
        true,
        { paymentGroupId: cuid(), discount, cash, eftpos },
        {
          onSuccess: () => {
            totalUpdated = totalUpdated + 1;

            if (orders.length !== totalUpdated) {
              return;
            }

            this.setTableStateToPaid({
              onSuccess: () => {
                goBack();
              },
            });
          },
        },
      );
    });
  };

  handleSetPaidAndResetPressed = ({ discount, eftpos, cash }) => {
    const {
      user: {
        orders: { edges },
      },
    } = this.props;
    const orders = edges.map(_ => _.node);
    let totalUpdated = 0;

    orders.forEach(order => {
      this.updateOrder(
        order,
        null,
        true,
        { paymentGroupId: cuid(), discount, cash, eftpos },
        {
          onSuccess: () => {
            totalUpdated = totalUpdated + 1;

            if (orders.length !== totalUpdated) {
              return;
            }

            this.handleResetTablePressed();
          },
        },
      );
    });
  };

  handleSplitPaidPressed = ({ discount, eftpos, cash }, selectedOrders, printCallback) => {
    const {
      user: {
        orders: { edges },
      },
      goBack,
    } = this.props;
    const allOrders = edges.map(_ => _.node);
    const orders = allOrders.filter(order =>
      order.details
        .map(_ => _.orderMenuItemPriceId)
        .find(orderMenuItemPriceId => selectedOrders.find(order => order.get('orderMenuItemPriceId').localeCompare(orderMenuItemPriceId) === 0)),
    );
    const excludedOrders = allOrders.filter(order => !orders.find(_ => _.id.localeCompare(order.id) === 0));
    const paymentGroupId = cuid();
    let totalUpdated = 0;
    let allPaidFlag = true;
    let allDetails = List();

    orders.forEach(order => {
      const allOrdersPaid = this.updateOrder(
        order,
        selectedOrders,
        false,
        { paymentGroupId, discount, cash, eftpos },
        {
          onSuccess: response => {
            totalUpdated = totalUpdated + 1;

            if (!allOrdersPaid) {
              allPaidFlag = false;
            }

            allDetails = allDetails.concat(Immutable.fromJS(response.details));

            if (orders.length !== totalUpdated) {
              return;
            }

            if (printCallback) {
              printCallback(
                allDetails.filter(item =>
                  selectedOrders.some(
                    selectedOrder => selectedOrder.get('orderMenuItemPriceId').localeCompare(item.get('orderMenuItemPriceId')) === 0,
                  ),
                ),
              );
            }

            if (!allPaidFlag || excludedOrders.filter(excludedOrder => excludedOrder.details.find(_ => !_.paid)).length !== 0) {
              return;
            }

            this.setTableStateToPaid({
              onSuccess: () => {
                goBack();
              },
            });
          },
        },
      );
    });
  };

  handleSplitPaidAndPrintReceiptPressed = ({ discount, eftpos, cash }, selectedOrders) => {
    this.handleSplitPaidPressed({ discount, eftpos, cash }, selectedOrders, details => {
      const {
        printers,
        customerReceiptTemplate,
        user: {
          table: { name: tableName },
        },
        escPosPrinterActions,
      } = this.props;

      if (!customerReceiptTemplate) {
        return null;
      }

      const documents = customerReceiptTemplate.get('linkedPrinters').flatMap(linkedPrinter => {
        const foundPrinter = printers.find(({ name }) => name.localeCompare(linkedPrinter.get('name')) === 0);

        if (!foundPrinter) {
          return List();
        }

        const contents = PrinterHelper.convertOrderIntoPrintableDocumentForReceipt(
          details,
          tableName,
          customerReceiptTemplate.get('template'),
          Math.floor(foundPrinter.maxLineWidth / customerReceiptTemplate.get('maxLineWidthDivisionFactor')),
          linkedPrinter.get('language'),
        );

        return contents.flatMap(content =>
          Range(0, linkedPrinter.get('numberOfPrints')).map(() => Map({ hostname: foundPrinter.hostname, port: foundPrinter.port, content })),
        );
      });

      if (documents.isEmpty()) {
        return;
      }

      escPosPrinterActions.printDocument(Map({ documents }));
    });
  };

  handleRefresh = () => {
    const { isRefreshing } = this.state;
    const { relay } = this.props;

    if (isRefreshing) {
      return;
    }

    this.setState({ isRefreshing: true });

    relay.refetch(_ => _, null, () => {
      this.setState({ isRefreshing: false });
    });
  };

  handleGiveToGuestPressed = () => {
    const {
      applicationStateActions,
      user: {
        orders: { edges },
      },
      table,
    } = this.props;

    this.setActiveCustomers(table);

    if (edges.length > 0) {
      const { navigateToHome } = this.props;
      const { correlationId } = edges[0].node;

      applicationStateActions.clearActiveOrder();
      applicationStateActions.setActiveOrderTopInfo(Map({ correlationId }));
      navigateToHome();
    } else {
      const { navigateToTableSetup } = this.props;

      applicationStateActions.setActiveTable(Immutable.fromJS(table));
      navigateToTableSetup();
    }
  };

  handleRePrintForKitchen = () => {
    const {
      printers,
      kitchenOrderTemplate,
      user: {
        table: { name: tableName },
        orders: { edges: orders },
      },
      escPosPrinterActions,
    } = this.props;

    if (!kitchenOrderTemplate) {
      return null;
    }

    const documents = kitchenOrderTemplate.get('linkedPrinters').flatMap(linkedPrinter => {
      const foundPrinter = printers.find(({ name }) => name.localeCompare(linkedPrinter.get('name')) === 0);

      if (!foundPrinter) {
        return List();
      }

      const content = orders
        .map(_ => _.node)
        .map(({ details, placedAt, notes }) => {
          const filteredDetails = details.filter(({ menuItemPrice: { menuItem: { linkedPrinters } } }) =>
            linkedPrinters.find(_ => _.localeCompare(foundPrinter.name) === 0),
          );

          if (filteredDetails.length === 0) {
            return '';
          }

          return PrinterHelper.convertOrderIntoPrintableDocumentForKitchen(
            filteredDetails,
            placedAt,
            notes,
            tableName,
            kitchenOrderTemplate.get('template'),
            Math.floor(foundPrinter.maxLineWidth / kitchenOrderTemplate.get('maxLineWidthDivisionFactor')),
            linkedPrinter.get('language'),
          );
        })
        .reduce((content1, content2) => (content2 ? content1 + endOfLine + content2 : content1), '');

      if (!content) {
        return List();
      }

      return Range(0, linkedPrinter.get('numberOfPrints')).map(() => Map({ hostname: foundPrinter.hostname, port: foundPrinter.port, content }));
    });

    if (documents.isEmpty()) {
      return;
    }

    escPosPrinterActions.printDocument(Map({ documents }));
  };

  handlePrintReceipt = () => {
    const {
      printers,
      customerReceiptTemplate,
      user: {
        table: { name: tableName },
        orders: { edges: orders },
      },
      escPosPrinterActions,
    } = this.props;

    if (!customerReceiptTemplate) {
      return null;
    }

    const documents = customerReceiptTemplate.get('linkedPrinters').flatMap(linkedPrinter => {
      const foundPrinter = printers.find(({ name }) => name.localeCompare(linkedPrinter.get('name')) === 0);

      if (!foundPrinter) {
        return List();
      }

      const details = Immutable.fromJS(orders.map(_ => _.node)).flatMap(order => order.get('details'));
      const contents = PrinterHelper.convertOrderIntoPrintableDocumentForReceipt(
        details,
        tableName,
        customerReceiptTemplate.get('template'),
        Math.floor(foundPrinter.maxLineWidth / customerReceiptTemplate.get('maxLineWidthDivisionFactor')),
        linkedPrinter.get('language'),
      );

      return contents.flatMap(content =>
        Range(0, linkedPrinter.get('numberOfPrints')).map(() => Map({ hostname: foundPrinter.hostname, port: foundPrinter.port, content })),
      );
    });

    if (documents.isEmpty()) {
      return;
    }

    escPosPrinterActions.printDocument(Map({ documents }));
  };

  handleEndReached = () => true;

  convertOrderToOrderRequest = (
    order,
    selectedOrders,
    setAllMenuItemPricesPaid,
    { paymentGroupId, discount: paymentGroupDiscount, eftpos: paymentGroupEftpos, cash: paymentGroupCash },
  ) =>
    order.update('details', details =>
      details.map(detail => {
        const menuItemPrice = detail.get('menuItemPrice');
        let id;
        let eftpos;
        let cash;
        let discount;

        if (detail.get('paid')) {
          id = detail.getIn(['paymentGroup', 'paymentGroupId']);
          eftpos = detail.getIn(['paymentGroup', 'eftpos']);
          cash = detail.getIn(['paymentGroup', 'cash']);
          discount = detail.getIn(['paymentGroup', 'discount']);
        } else {
          if (setAllMenuItemPricesPaid) {
            id = paymentGroupId;
            cash = paymentGroupCash;
            eftpos = paymentGroupEftpos;
            discount = paymentGroupDiscount;
          } else {
            const foundSelectedOrder = selectedOrders.find(
              order => order.get('orderMenuItemPriceId').localeCompare(detail.get('orderMenuItemPriceId')) === 0,
            );

            id = foundSelectedOrder ? paymentGroupId : null;
            eftpos = foundSelectedOrder ? paymentGroupEftpos : null;
            cash = foundSelectedOrder ? paymentGroupCash : null;
            discount = foundSelectedOrder ? paymentGroupDiscount : null;
          }
        }
        const servingTimeId = detail.getIn(['servingTime', 'id']);

        return ImmutableEx.removeUndefinedProps(
          detail.merge(
            Map({
              paymentGroup: Map({
                paymentGroupId: id,
                discount,
                cash,
                eftpos,
                paidAt: detail.getIn(['paymentGroup', 'paidAt']),
              }),
              servingTimeId,
              menuItemPriceId: menuItemPrice.get('id'),
              quantity: detail.get('quantity'),
              notes: detail.get('notes'),
              paid:
                setAllMenuItemPricesPaid ||
                detail.get('paid') ||
                !!selectedOrders.find(order => order.get('orderMenuItemPriceId').localeCompare(detail.get('orderMenuItemPriceId')) === 0),
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
          ),
        )
          .delete('servingTime')
          .delete('menuItemPrice');
      }),
    );

  updateOrder = (orderToUpdate, selectedOrders, setAllMenuItemPricesPaid, paymentGroup, callbacks) => {
    const order = Immutable.fromJS(orderToUpdate);
    const orderUpdateRequest = this.convertOrderToOrderRequest(order, selectedOrders, setAllMenuItemPricesPaid, paymentGroup);
    const {
      relay: { environment },
      restaurantId,
      table: { id },
    } = this.props;

    UpdateOrder(
      environment,
      orderUpdateRequest.merge(Map({ restaurantId, tableId: id, paymentGroupId: paymentGroup.paymentGroupId })).toJS(),
      order.get('details').map(detail => detail.get('menuItemPrice')),
      order
        .get('details')
        .flatMap(detail => detail.getIn(['orderChoiceItemPrices']))
        .map(orderChoiceItemPrice => orderChoiceItemPrice.get('choiceItemPrice')),
      callbacks,
    );

    return orderUpdateRequest
      .get('details')
      .filterNot(_ => _.get('paid'))
      .isEmpty();
  };

  render = () => {
    const {
      table,
      user: {
        orders: { edges: orders },
      },
      customerReceiptTemplate,
      kitchenOrderTemplate,
    } = this.props;
    const { isRefreshing } = this.state;

    return (
      <TableDetailView
        table={table}
        orders={orders.map(_ => _.node)}
        onResetTablePressed={this.handleResetTablePressed}
        onSetPaidPressed={this.handleSetPaidPressed}
        onSetPaidAndResetPressed={this.handleSetPaidAndResetPressed}
        onSplitPaidPressed={this.handleSplitPaidPressed}
        onSplitPaidAndPrintReceiptPressed={this.handleSplitPaidAndPrintReceiptPressed}
        isRefreshing={isRefreshing}
        onRefresh={this.handleRefresh}
        onEndReached={this.handleEndReached}
        onGiveToGuestPressed={this.handleGiveToGuestPressed}
        onRePrintForKitchen={this.handleRePrintForKitchen}
        canPrintKitchenOrder={!!kitchenOrderTemplate}
        onPrintReceipt={this.handlePrintReceipt}
        canPrintReceipt={!!customerReceiptTemplate}
      />
    );
  };
}

TableDetailContainer.propTypes = {
  applicationStateActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  escPosPrinterActions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  navigateToHome: PropTypes.func.isRequired,
  navigateToTableSetup: PropTypes.func.isRequired,
  goBack: PropTypes.func.isRequired,
  table: TableProp.isRequired,
  tableId: PropTypes.string.isRequired,
  restaurantId: PropTypes.string.isRequired,
};

const mapStateToProps = (state, { user: { table } }) => {
  const activeTable = state.applicationState.get('activeTable');
  const configurations = state.applicationState.getIn(['activeRestaurant', 'configurations']);
  const printers = configurations.get('printers').toJS();
  const kitchenOrderTemplate = configurations
    .get('documentTemplates')
    .find(documentTemplate => documentTemplate.get('name').localeCompare('KitchenOrder') === 0);
  const customerReceiptTemplate = configurations
    .get('documentTemplates')
    .find(documentTemplate => documentTemplate.get('name').localeCompare('CustomerReceipt') === 0);

  return {
    restaurantId: state.applicationState.getIn(['activeRestaurant', 'id']),
    table,
    tableId: activeTable.get('id'),
    printers,
    kitchenOrderTemplate,
    customerReceiptTemplate,
  };
};

const mapDispatchToProps = dispatch => ({
  applicationStateActions: bindActionCreators(applicationStateActions, dispatch),
  escPosPrinterActions: bindActionCreators(escPosPrinterActions, dispatch),
  navigateToHome: () => dispatch(NavigationActions.reset({ index: 0, actions: [NavigationActions.navigate({ routeName: 'Home' })] })),
  navigateToTableSetup: () => dispatch(NavigationActions.navigate({ routeName: 'TableSetup' })),
  goBack: () => dispatch(NavigationActions.back()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TableDetailContainer);
