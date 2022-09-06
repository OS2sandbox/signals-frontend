/* SPDX-License-Identifier: MPL-2.0 */
/* Copyright (C) 2022 Gemeente Amsterdam */
import { render, screen } from '@testing-library/react'
import MAP_OPTIONS from 'shared/services/configuration/map-options'
import Map from 'components/Map'
import { withAppContext } from 'test/utils'
import { IncidentLayer } from './IncidentLayer'

const renderWithContext = () =>
  render(
    withAppContext(
      <Map mapOptions={MAP_OPTIONS}>
        <IncidentLayer passBbox={jest.fn()} />
      </Map>
    )
  )

describe('IncidentLayer', () => {
  beforeEach(() => {
    get.mockReset()
    jest.mocked(useFetch).mockImplementation(() => useFetchResponse)
  })

  it('renders the incident layer', async () => {
    jest.mocked(useFetch).mockImplementation(() => ({
      ...useFetchResponse,
      data: geography,
    }))
    renderWithContext()

    expect(screen.getByTestId('incidentLayer')).toBeInTheDocument()
  })

  it('sends a request to fetch public incidents', async () => {
    expect(get).not.toHaveBeenCalled()

    renderWithContext()
    await screen.findByTestId('incidentLayer')

    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining(configuration.GEOGRAPHY_PUBLIC_ENDPOINT)
    )
  })

  it('shows a message when the API returns an error', async () => {
    jest.mocked(useFetch).mockImplementation(() => ({
      ...useFetchResponse,
      data: undefined,
      error: true,
    }))

    renderWithContext()
    await screen.findByTestId('incidentLayer')

    expect(
      screen.getByText('Er konden geen meldingen worden opgehaald.')
    ).toBeInTheDocument()
  })

  it('shows a message when the API returns an error', async () => {
    jest.mocked(useFetch).mockImplementation(() => ({
      ...useFetchResponse,
      data: undefined,
      error: true,
    }))

    renderWithContext()
    await screen.findByTestId('incidentLayer')

    expect(
      screen.getByText('Er konden geen meldingen worden opgehaald.')
    ).toBeInTheDocument()
  })
})