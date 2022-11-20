/* SPDX-License-Identifier: MPL-2.0 */
/* Copyright (C) 2022 Gemeente Amsterdam */
import { useEffect } from 'react'

import format from 'date-fns/format'
import nl from 'date-fns/locale/nl'
import { useHistory } from 'react-router-dom'

import useFetch from '../../../../hooks/useFetch'
import useLocationReferrer from '../../../../hooks/useLocationReferrer'
import configuration from '../../../../shared/services/configuration/configuration'
import { routes } from '../../definitions'
import { FormTitle } from '../../pages/styled'
import type { HistoryInstance, MyIncident } from '../../types'
import { StatusBlock, Wrapper, Status, StatusStat, StyledH4 } from './styled'

export interface Props {
  incident?: MyIncident
}

const defaultData = [
  {
    when: '2022-11-16T12:00:00+00:00',
    what: 'UPDATE_LOCATION',
    action: 'Locatie gewijzigd naar:',
    description: 'Locatie is gepinned op kaart',
    _signal: '00000000-0000-0000-0000-000000000000',
  },
  {
    when: '2022-12-16T12:00:00+00:00',
    what: 'checking',
    action: 'Does this show?',
    description: 'Party on',
    _signal: '00000000-0000-0000-0000-000000000001',
  },
]

export const History = ({ incident }: Props) => {
  const { get, data = defaultData, error } = useFetch<HistoryInstance[]>()
  const location = useLocationReferrer() as Location
  const history = useHistory()

  useEffect(() => {
    const locationPathArray = location.pathname.split('/')
    const token = locationPathArray[locationPathArray.length - 2]
    const uuid = locationPathArray[locationPathArray.length - 1]
    get(
      `${configuration.MY_SIGNALS_ENDPOINT}/${uuid}/history`,
      {},
      {},
      { Authorization: `Token ${token}` }
    )
  }, [get, location.pathname])

  useEffect(() => {
    if (error) {
      history.push(routes.expired)
    }
  }, [error, history])

  return (
    <Wrapper>
      <StatusBlock>
        <Status>Status</Status>
        <StatusStat>{incident?.status.state}</StatusStat>
      </StatusBlock>
      <StyledH4 forwardedAs="h2">Geschiedenis</StyledH4>

      {data?.map((instance: HistoryInstance) => {
        const { when, action, description } = instance
        const date = new Date(when)
        const formattedDate = format(date, 'd MMMM yyyy, HH:mm', {
          locale: nl,
        })
        return (
          <>
            <FormTitle>{formattedDate}</FormTitle>
            <p>
              {action} {description}
            </p>
          </>
        )
      })}
    </Wrapper>
  )
}
