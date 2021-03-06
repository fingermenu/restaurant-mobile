// @flow

import { GraphQLID, GraphQLObjectType, GraphQLNonNull } from 'graphql';
import { realm, DietaryOptionService } from '../../realmDB';
import { NodeInterface } from '../interface';
import Tag from './Tag';

export const getDietaryOption = async dietaryOptionId => new DietaryOptionService(realm).read(dietaryOptionId);

export default new GraphQLObjectType({
  name: 'DietaryOption',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: _ => _.get('id'),
    },
    tag: {
      type: Tag,
      resolve: async (_, args, { dataLoaders: { tagLoaderById } }) => (_.get('tagId') ? tagLoaderById.load(_.get('tagId')) : null),
    },
  },
  interfaces: [NodeInterface],
});
