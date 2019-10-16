/*
 *
 * OverviewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  REQUEST_INCIDENTS,
  REQUEST_INCIDENTS_SUCCESS,
  REQUEST_INCIDENTS_ERROR,
  FILTER_INCIDENTS_CHANGED,
  PAGE_INCIDENTS_CHANGED,
  SORT_INCIDENTS_CHANGED,
  GET_FILTERS_SUCCESS,
  GET_FILTERS_FAILED,
  REMOVE_FILTER_SUCCESS,
  APPLY_FILTER,
} from './constants';
import priorityList from '../../definitions/priorityList';
import stadsdeelList from '../../definitions/stadsdeelList';
import statusList from '../../definitions/statusList';
import feedbackList from '../../definitions/feedbackList';

export const initialState = fromJS({
  sort: '-created_at',
  page: 1,
  incidents: [],
  incidentsCount: null,
  priorityList,
  stadsdeelList,
  statusList,
  feedbackList,
  allFilters: [],
  filter: {},
});

function overviewPageReducer(state = initialState, action) {
  let newFilters;
  let re;
  switch (action.type) {
    case REQUEST_INCIDENTS:
      return state.set('loading', true).set('error', false);
    case REQUEST_INCIDENTS_SUCCESS:
      return state
        .set('incidents', fromJS(action.payload.results))
        .set('incidentsCount', action.payload.count)
        .set('loading', false);
    case REQUEST_INCIDENTS_ERROR:
      return state.set('error', action.payload).set('loading', false);
    case FILTER_INCIDENTS_CHANGED:
      return state.set('filter', fromJS(action.payload)).set('page', 1);
    case PAGE_INCIDENTS_CHANGED:
      return state.set('page', fromJS(action.payload));
    case SORT_INCIDENTS_CHANGED:
      return state.set('page', 1).set('sort', fromJS(action.payload));
    case GET_FILTERS_SUCCESS:
      return state
        .set('allFilters', fromJS(action.payload))
        .set('loading', false);
    case GET_FILTERS_FAILED:
      return state
        .set('loading', false)
        .set('error', true)
        .set('errorMessage', action.payload);
    case REMOVE_FILTER_SUCCESS:
      re = new RegExp(`/${action.payload}`, 'g');
      newFilters = state
        .get('allFilters')
        .toJS()
        .filter(i => !i._links.self.href.match(re));
      return state.set('allFilters', fromJS(newFilters));
    case APPLY_FILTER:
      return state.set('filter', fromJS(action.payload));

    default:
      return state;
  }
}

export default overviewPageReducer;
