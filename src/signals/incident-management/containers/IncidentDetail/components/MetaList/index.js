import React, { useCallback, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Button, themeColor, themeSpacing } from '@datapunt/asc-ui';

import { string2date, string2time } from 'shared/services/string-parser';
import { makeSelectSubCategories } from 'models/categories/selectors';
import { typesList, priorityList } from 'signals/incident-management/definitions';
import { patchIncident as patchIncidentAction } from 'models/incident/actions';
import { makeSelectPatching } from 'models/incident/selectors';
import { PATCH_TYPE_STATUS, PATCH_TYPE_PRIORITY, PATCH_TYPE_SUBCATEGORY, PATCH_TYPE_TYPE } from 'models/incident/constants';

import RadioInput from 'signals/incident-management/components/RadioInput';

import ChangeValue from './components/ChangeValue';
import Highlight from '../Highlight';
import IconEdit from '../../../../../../shared/images/icon-edit.svg';
import IncidentDetailContext from '../../context';

const List = styled.dl`
  dt {
    color: ${themeColor('tint', 'level5')};
    margin-bottom: ${themeSpacing(1)};
    position: relative;
    font-weight: 400;
  }

  dd {
    margin-bottom: ${themeSpacing(4)};

    &.alert {
      color: ${themeColor('secondary')};
      font-family: Avenir Next LT W01 Demi, arial, sans-serif;
    }

    .childLink:not(:first-child) {
      margin-left: ${themeSpacing(2)};
    }
  }
`;

const EditButton = styled(Button)`
  position: absolute;
  top: 0;
  right: 0;
  padding: ${themeSpacing(0, 1.5)};
`;

export const getCategoryName = ({ name, departments }) => {
  const departmensStringList = departments?.length > 0 ? ` (${departments.filter(({ is_responsible }) => is_responsible).map(({ code }) => code).join(', ')})` : '';
  return `${name}${departmensStringList}`;
};

const MetaList = ({ onEditStatus }) => {
  const { incident } = useContext(IncidentDetailContext);
  const dispatch = useDispatch();
  const patching = useSelector(makeSelectPatching);
  const subcategories = useSelector(makeSelectSubCategories);
  const subcategoryOptions = useMemo(
    () =>
      subcategories?.map(category => ({
        ...category,
        value: getCategoryName(category),
      })),
    // disabling linter; we want to allow possible null subcategories
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subcategories]
  );

  const subcatHighlightDisabled = ![
    'm',
    'reopened',
    'i',
    'b',
    'ingepland',
    'send failed',
    'closure requested',
  ].includes(incident.status.state);

  const patchIncident = useCallback(
    patchedData => {
      dispatch(patchIncidentAction(patchedData));
    },
    [dispatch]
  );

  return (
    <List>
      <dt data-testid="meta-list-date-definition">Gemeld op</dt>
      <dd data-testid="meta-list-date-value">
        {string2date(incident.created_at)} {string2time(incident.created_at)}
      </dd>

      <Highlight valueChanged={patching[PATCH_TYPE_STATUS]}>
        <dt data-testid="meta-list-status-definition">
          <EditButton
            data-testid="editStatusButton"
            icon={<IconEdit />}
            iconSize={18}
            variant="application"
            type="button"
            onClick={onEditStatus}
          />
          Status
        </dt>
        <dd className="alert" data-testid="meta-list-status-value">
          {incident.status.state_display}
        </dd>
      </Highlight>

      {incident.priority && (
        <Highlight valueChanged={patching[PATCH_TYPE_PRIORITY]}>
          <ChangeValue
            display="Urgentie"
            valueClass={incident.priority.priority === 'high' ? 'alert' : ''}
            list={priorityList}
            incident={incident}
            path="priority.priority"
            type="priority"
            onPatchIncident={patchIncident}
            component={RadioInput}
          />
        </Highlight>
      )}

      {incident.type && (
        <Highlight valueChanged={patching[PATCH_TYPE_TYPE]}>
          <ChangeValue
            component={RadioInput}
            display="Type"
            incident={incident}
            list={typesList}
            onPatchIncident={patchIncident}
            path="type.code"
            type="type"
          />
        </Highlight>
      )}

      {subcategoryOptions && (
        <Highlight valueChanged={patching[PATCH_TYPE_SUBCATEGORY]}>
          <ChangeValue
            disabled={subcatHighlightDisabled}
            display="Subcategorie"
            list={subcategoryOptions}
            incident={incident}
            infoKey="description"
            onPatchIncident={patchIncident}
            patch={{ status: { state: 'm' } }}
            path="category.sub_category"
            sort
            type="subcategory"
            valuePath="category.category_url"
          />
        </Highlight>
      )}

      <Highlight valueChanged={patching[PATCH_TYPE_SUBCATEGORY]}>
        <dt data-testid="meta-list-main-category-definition">Hoofdcategorie</dt>
        <dd data-testid="meta-list-main-category-value">{incident.category.main}</dd>
      </Highlight>

      <dt data-testid="meta-list-source-definition">Bron</dt>
      <dd data-testid="meta-list-source-value">{incident.source}</dd>
    </List>
  );
};

MetaList.propTypes = {
  onEditStatus: PropTypes.func.isRequired,
};

export default MetaList;
