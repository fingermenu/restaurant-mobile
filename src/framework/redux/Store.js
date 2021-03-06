// @flow

import {
  watchGetCurrentUser,
  watchSignUpWithUsernameAndPassword,
  watchSignInWithUsernameAndPassword,
  watchSignInWithFacebook,
  watchSignOut,
} from '@microbusiness/parse-server-common-react-native';
import { watchRefreshState, watchReadValue, watchWriteValue } from '@microbusiness/common-react-native';
import { watchEscPosPrinterPrintDocument } from '@microbusiness/printer-react-native';
import { watchGoogleAnalyticsTrackerTrackEvent, watchGoogleAnalyticsTrackerTrackScreenView } from '@microbusiness/google-analytics-react-native';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import getReducers from './Reducers';

const rootSagas = function* sagas() {
  yield [
    watchGetCurrentUser(),
    watchSignUpWithUsernameAndPassword(),
    watchSignInWithUsernameAndPassword(),
    watchSignInWithFacebook(),
    watchSignOut(),
    watchRefreshState(),
    watchWriteValue(),
    watchReadValue(),
    watchEscPosPrinterPrintDocument(),
    watchGoogleAnalyticsTrackerTrackEvent(),
    watchGoogleAnalyticsTrackerTrackScreenView(),
  ];
};

export default function configureStore(navigationReducer, navigationMiddleware, initialState) {
  const sagaMiddleware = createSagaMiddleware();
  const middleware = applyMiddleware(sagaMiddleware, navigationMiddleware);
  const store = createStore(getReducers(navigationReducer), initialState, middleware);

  sagaMiddleware.run(rootSagas);

  return store;
}
