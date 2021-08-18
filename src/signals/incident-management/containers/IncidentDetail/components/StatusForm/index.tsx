// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import {
  useCallback,
  useReducer,
  useContext,
  FunctionComponent,
  Reducer,
} from 'react'
import { Label, Alert, Heading } from '@amsterdam/asc-ui'

import {
  changeStatusOptionList,
  StatusCode,
} from 'signals/incident-management/definitions/statusList'

import Paragraph from 'components/Paragraph'
import TextArea from 'components/TextArea'
import Checkbox from 'components/Checkbox'

import type { DefaultTexts as DefaultTextsType } from 'types/api/default-text'

import RadioButtonList from 'signals/incident-management/components/RadioButtonList'
import { Incident } from 'types/api/incident'
import IncidentDetailContext from '../../context'
import { PATCH_TYPE_STATUS } from '../../constants'
import { IncidentChild } from '../../types'
import DefaultTexts from './components/DefaultTexts'
import {
  Form,
  FormArea,
  HeaderArea,
  StyledLabel,
  OptionsArea,
  QuestionLabel,
  StyledButton,
  StyledColumn,
  StyledH4,
  TextsArea,
  Wrapper,
} from './styled'
import * as constants from './constants'
import reducer, { init, State } from './reducer'
import { StatusFormActions } from './actions'

interface StatusFormProps {
  defaultTexts: DefaultTextsType
  childIncidents: IncidentChild[]
}

const StatusForm: FunctionComponent<StatusFormProps> = ({
  defaultTexts,
  childIncidents,
}) => {
  const { incident, update, close } = useContext(IncidentDetailContext)
  const mockIncident = incident as Incident

  const [state, dispatch] = useReducer<
    Reducer<State, StatusFormActions>,
    { incident: Incident; childIncidents: IncidentChild[] }
  >(reducer, { incident: mockIncident, childIncidents }, init)

  const disableSubmit = Boolean(
    state.warnings.some(({ level }) => level === 'error')
  )

  const onRadioChange = useCallback((_name, selectedStatus) => {
    dispatch({ type: 'SET_STATUS', payload: selectedStatus })
  }, [])

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()

      const textValue = state.text.value || state.text.defaultValue

      if (state.text.required && !textValue) {
        dispatch({
          type: 'SET_ERRORS',
          payload: { text: 'Dit veld is verplicht' },
        })
        return
      }

      if (textValue.length > state.text.maxLength) {
        dispatch({
          type: 'SET_ERRORS',
          payload: {
            text: `Je hebt meer dan de maximale ${state.text.maxLength} tekens ingevoerd.`,
          },
        })
        return
      }

      if (/{{|}}/gi.test(textValue)) {
        dispatch({
          type: 'SET_ERRORS',
          payload: {
            text: "Er is een gereserveerd teken ('{{' of '}}') in de toelichting gevonden.\nMogelijk staan er nog een of meerdere interne aanwijzingen in deze tekst. Pas de tekst aan.",
          },
        })
        return
      }

      if (update) {
        update({
          type: PATCH_TYPE_STATUS,
          patch: {
            status: {
              state: state.status.key,
              text: textValue,
              send_email: state.check.checked,
            },
          },
        })
      }

      if (close) {
        close()
      }
    },
    [
      state.text.value,
      state.text.defaultValue,
      state.text.required,
      state.text.maxLength,
      state.status.key,
      state.check.checked,
      update,
      close,
    ]
  )

  const setDefaultText = useCallback((_event, text) => {
    dispatch({ type: 'SET_DEFAULT_TEXT', payload: text })
  }, [])

  const onCheck = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHECK', payload: undefined })
  }, [])

  const onTextChange = useCallback((event) => {
    dispatch({ type: 'SET_TEXT', payload: event.target.value })
  }, [])

  return (
    <Wrapper>
      <StyledColumn span={12}>
        <Form onSubmit={handleSubmit} data-testid="statusForm" noValidate>
          <HeaderArea>
            <StyledH4 forwardedAs="h2">Status wijzigen</StyledH4>

            <div data-testid="originalStatus">
              <StyledLabel label="Huidige status" />
              <div>{state.originalStatus.value}</div>
            </div>
          </HeaderArea>

          <OptionsArea>
            <div>
              <StyledLabel htmlFor="status" label="Nieuwe status" />
              <input
                type="hidden"
                name="status"
                value={state.originalStatus.key}
              />
              <RadioButtonList
                defaultValue={state.status.key}
                groupName="status"
                hasEmptySelectionButton={false}
                onChange={onRadioChange}
                options={changeStatusOptionList}
              />
            </div>
          </OptionsArea>

          <FormArea>
            {state.warnings.length > 0 &&
              state.warnings.map((warning) => (
                <Alert
                  key={warning.key}
                  data-testid={warning.key}
                  level={warning.level}
                >
                  {warning.heading && (
                    <Heading as="h3">{warning.heading}</Heading>
                  )}
                  {warning.content && <Paragraph>{warning.content}</Paragraph>}
                </Alert>
              ))}
            <div>
              <QuestionLabel>
                <strong>Versturen</strong>
              </QuestionLabel>

              {state.flags.isSplitIncident &&
                (state.status.key === StatusCode.ReactieGevraagd ? (
                  <Alert
                    data-testid="split-incident-reply-warning"
                    level="info"
                  >
                    {constants.REPLY_DEELMELDING_EXPLANATION}
                  </Alert>
                ) : (
                  <Alert data-testid="split-incident-warning" level="info">
                    {constants.DEELMELDING_EXPLANATION}
                  </Alert>
                ))}

              {!state.flags.isSplitIncident && (
                <div>
                  {state.flags.hasEmail ? (
                    <Label
                      disabled={state.check.disabled}
                      htmlFor="send_email"
                      label={constants.MELDING_CHECKBOX_DESCRIPTION}
                      noActiveState
                    >
                      <Checkbox
                        checked={state.check.checked}
                        data-testid="sendEmailCheckbox"
                        disabled={state.check.disabled}
                        id="send_email"
                        onClick={onCheck}
                      />
                    </Label>
                  ) : (
                    <Alert data-testid="no-email-warning">
                      {constants.NO_REPORTER_EMAIL}
                    </Alert>
                  )}
                </div>
              )}
            </div>

            <div>
              <QuestionLabel>
                <strong>{state.text.label}</strong>
                {!state.text.required && <span>&nbsp;(niet verplicht)</span>}
                {state.text.required &&
                  state.check.checked &&
                  state.flags.hasEmail && (
                    <Paragraph light>{state.text.subtitle}</Paragraph>
                  )}
              </QuestionLabel>
              <TextArea
                data-testid="text"
                error={Boolean(state.errors.text)}
                errorMessage={state.errors.text}
                infoText={`${state.text.value.length}/${state.text.maxLength} tekens`}
                name="text"
                onChange={onTextChange}
                required={state.text.required}
                rows={state.text.rows}
                value={state.text.value || state.text.defaultValue}
              />
            </div>

            <div>
              <StyledButton
                data-testid="statusFormSubmitButton"
                type="submit"
                variant="secondary"
                disabled={disableSubmit}
              >
                Opslaan
              </StyledButton>

              <StyledButton
                data-testid="statusFormCancelButton"
                variant="tertiary"
                onClick={close}
              >
                Annuleer
              </StyledButton>
            </div>
          </FormArea>
          <TextsArea>
            <DefaultTexts
              defaultTexts={defaultTexts}
              onHandleUseDefaultText={setDefaultText}
              status={state.status.key}
            />
          </TextsArea>
        </Form>
      </StyledColumn>
    </Wrapper>
  )
}

export default StatusForm
