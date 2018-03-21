// @flow

// import Immutable, { Map } from 'immutable';
import { commitMutation, graphql } from 'react-relay';
// import cuid from 'cuid';
// import { ConnectionHandler } from 'relay-runtime';
import { NotificationType } from '@microbusiness/common-react';
import * as messageBarActions from '@microbusiness/common-react/src/notification/Actions';
import { reduxStore } from '../../../app/navigation';

const mutation = graphql`
  mutation UpdateOrderMutation($input: UpdateOrderInput!) {
    updateOrder(input: $input) {
      errorMessage
      order {
        __typename
        cursor
        node {
          placedAt
          details {
            menuItemPrice {
              menuItem {
                nameToPrint
              }
            }
            quantity
            orderChoiceItemPrices {
              choiceItemPrice {
                choiceItem {
                  nameToPrint
                }
              }
              quantity
            }
          }
        }
      }
    }
  }
`;

// const sharedUpdater = (store, userId, ordersEdge) => {
//   const userProxy = store.get(userId);
//   if (!userProxy) {
//     return;
//   }
//
//   const connection = ConnectionHandler.getConnection(userProxy, 'User_orders');
//
//   if (!connection) {
//     return;
//   }
//
//   ConnectionHandler.insertEdgeAfter(connection, ordersEdge);
// };

const commit = (
  environment,
  userId,
  { id, restaurantId, numberOfAdults, numberOfChildren, customerName, notes, tableId, details, totalPrice },
  onSuccess,
) => {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        id,
        restaurantId,
        tableId,
        numberOfAdults,
        numberOfChildren,
        customerName,
        notes,
        totalPrice,
        details,
      },
    },
    updater: store => {
      const payload = store.getRootField('updateOrder');
      const errorMessage = payload.getValue('errorMessage');

      if (errorMessage) {
        reduxStore.dispatch(messageBarActions.add(errorMessage, NotificationType.ERROR));
      } else {
        if (onSuccess) {
          onSuccess();
        }
      }
    },
    // optimisticUpdater: store => {
    //   const id = cuid();
    //   const node = store.create(id, 'item');
    //
    //   // node.setValue(true, 'savingInProgress');
    //   node.setValue(id, 'id');
    //   node.setValue(tableId, 'tableId');
    //   node.setValue(restaurantId, 'restaurantId');
    //   node.setValue(numberOfAdults, 'numberOfAdults');
    //   node.setValue(numberOfChildren, 'numberOfChildren');
    //   node.setValue(customerName, 'customerName');
    //   node.setValue(notes, 'notes');
    //   node.setValue(totalPrice, 'totalPrice');
    //   node.setValue(details, 'details');
    //
    //   const ordersEdge = store.create(cuid(), 'ordersEdge');
    //
    //   ordersEdge.setLinkedRecord(node, 'node');
    //   sharedUpdater(store, userId, ordersEdge);
    // },
  });
};

export default {
  commit,
};
