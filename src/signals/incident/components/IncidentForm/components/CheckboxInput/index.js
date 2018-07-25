/* eslint-disable no-unused-vars */

import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';

import Title from '../Title/';
import ErrorMessage from '../ErrorMessage/';

const CheckboxInput = ({ handler, touched, hasError, meta, parent, getError }) => (
  <div>
    {meta.ifVisible ?
      <div className="row mode_input">
        <Title meta={meta} />

        <div className={`col-${meta.cols || 12} antwoorden`}>
          <div className="antwoord">
            <input
              id={meta.name}
              className="kenmerkradio"
              {...handler('checkbox')}
              onClick={(e) => meta.updateIncident && parent.meta.setIncident({ [meta.name]: e.target.value })}
            />
            <label htmlFor={meta.name}>{meta.value}</label>
          </div>
        </div>

        <ErrorMessage
          touched={touched}
          hasError={hasError}
          getError={getError}
        />
      </div>
       : ''}
  </div>
);

CheckboxInput.propTypes = {
  handler: PropTypes.func,
  touched: PropTypes.bool,
  getError: PropTypes.func.isRequired,
  hasError: PropTypes.func.isRequired,
  meta: PropTypes.object,
  parent: PropTypes.object
};

export default CheckboxInput;
