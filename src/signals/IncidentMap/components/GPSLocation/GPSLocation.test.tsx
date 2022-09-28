/* SPDX-License-Identifier: MPL-2.0 */
/* Copyright (C) 2022 Gemeente Amsterdam */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Map } from 'leaflet'

import { DEFAULT_ZOOM } from '../../../../components/AreaMap/AreaMap'
import configuration from '../../../../shared/services/configuration/configuration'
import { GPSLocation } from './GPSLocation'
import type { Props } from './GPSLocation'

jest.mock('@amsterdam/react-maps', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  ...jest.requireActual('@amsterdam/react-maps')!,
  Marker: ({ ...props }) => {
    return <div {...props}></div>
  },
}))

const mockMap = {
  flyTo: jest.fn(),
} as unknown as Map

const defaultProps: Props = {
  map: mockMap,
  setNotification: jest.fn(),
}

describe('GPSLocation', () => {
  const coords = {
    accuracy: 1234,
    latitude: 52.3731081,
    longitude: 4.8932945,
  }

  const mockGeolocation = {
    getCurrentPosition: jest.fn().mockImplementation((success) =>
      Promise.resolve(
        success({
          coords,
        })
      )
    ),
  }

  it('renders the component', () => {
    render(<GPSLocation {...defaultProps} />)

    expect(
      screen.getByRole('button', { name: 'Huidige locatie' })
    ).toBeInTheDocument()
  })

  it('flies to the location on click', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
    })

    render(<GPSLocation {...defaultProps} />)

    userEvent.click(screen.getByRole('button', { name: 'Huidige locatie' }))

    expect(defaultProps.map.flyTo).toHaveBeenCalledWith(
      { lat: coords.latitude, lng: coords.longitude },
      DEFAULT_ZOOM
    )
  })

  it('shows marker when coordinates are available', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
    })

    render(<GPSLocation {...defaultProps} />)

    expect(screen.queryByTestId('incidentPinMarker')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: 'Huidige locatie' }))

    expect(screen.queryByTestId('incidentPinMarker')).toBeInTheDocument()
  })

  it('should call onLocationError', () => {
    const code = 1
    const message = 'User denied geolocation'
    const mockGeolocationError = {
      getCurrentPosition: jest.fn().mockImplementation((_, error) =>
        Promise.resolve(
          error({
            code,
            message,
          })
        )
      ),
    }

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocationError,
    })

    render(<GPSLocation {...defaultProps} />)

    expect(defaultProps.setNotification).not.toHaveBeenCalled()

    userEvent.click(screen.getByTestId('gpsButton'))

    expect(defaultProps.setNotification).toHaveBeenCalledWith(
      <>
        <strong>
          {`${configuration.language.siteAddress} heeft geen
                            toestemming om uw locatie te gebruiken.`}
        </strong>
        <p>
          Dit kunt u wijzigen in de voorkeuren of instellingen van uw browser of
          systeem.
        </p>
      </>
    )
  })

  it('should call onLocationOutOfBounds', () => {
    const coordsOutOfBounds = {
      accuracy: 1234,
      latitude: 55,
      longitude: 5,
    }

    const mockGeolocationOutOfBounds = {
      getCurrentPosition: jest.fn().mockImplementation((success) =>
        Promise.resolve(
          success({
            coords: coordsOutOfBounds,
          })
        )
      ),
    }

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocationOutOfBounds,
    })

    render(<GPSLocation {...defaultProps} />)

    userEvent.click(screen.getByRole('button', { name: 'Huidige locatie' }))

    expect(defaultProps.setNotification).toHaveBeenCalledWith(
      'Uw locatie valt buiten de kaart en is daardoor niet te zien'
    )
  })
})