// @flow

import { createRefetchContainer, graphql } from 'react-relay';
import MenusContainer from './MenusContainer';

export default createRefetchContainer(
  MenusContainer,
  {
    user: graphql`
      fragment MenusRelayContainer_user on User {
        id
        restaurant(restaurantId: $restaurantId) {
          menus {
            id
            name
            sortOrderIndex
          }
        }
      }
    `,
  },
  graphql`
    query MenusRelayContainer_user_FragmentQuery($restaurantId: ID!) {
      user {
        ...MenusRelayContainer_user
      }
    }
  `,
);
