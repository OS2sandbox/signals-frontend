// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2021 Gemeente Amsterdam
import 'jest-styled-components'
import { render, screen, within } from '@testing-library/react'
import fetchMock from 'jest-fetch-mock'
import userEvent from '@testing-library/user-event'

import type { FC } from 'react'
import type { PDOKAutoSuggestProps } from 'components/PDOKAutoSuggest'
import type { PdokResponse } from 'shared/services/map-location'

import { formatAddress } from 'shared/services/format-address'
import assetsJson from 'utils/__tests__/fixtures/assets.json'
import configuration from 'shared/services/configuration/configuration'
import withAssetSelectContext, {
  contextValue,
} from '../__tests__/withAssetSelectContext'
import type { LegendPanelProps } from './LegendPanel/LegendPanel'

import Selector from './Selector'

jest.mock('../../hooks/useLayerVisible', () => ({
  __esModule: true,
  default: () => false,
}))

let mockShowDesktopVariant: boolean
jest.mock('@amsterdam/asc-ui/lib/utils/hooks', () => ({
  useMatchMedia: () => [mockShowDesktopVariant],
}))

jest.mock('./LegendPanel', () => ({ onClose }: LegendPanelProps) => (
  <span data-testid="mockLegendPanel">
    <input type="button" name="closeLegend" onClick={onClose} />
  </span>
))

const mockAddress = {
  postcode: '1000 AA',
  huisnummer: '100',
  woonplaats: 'Amsterdam',
  openbare_ruimte: 'West',
}

const mockPDOKResponse: PdokResponse = {
  id: 'foo',
  value: 'Zork',
  data: {
    location: {
      lat: 12.282,
      lng: 3.141,
    },
    address: mockAddress,
  },
}

jest.mock(
  'components/PDOKAutoSuggest',
  () =>
    ({ className, onSelect, value }: PDOKAutoSuggestProps) =>
      (
        <span data-testid="pdokAutoSuggest" className={className}>
          <button onClick={() => onSelect(mockPDOKResponse)}>selectItem</button>
          <span>{value}</span>
        </span>
      )
)

describe('signals/incident/components/form/AssetSelect/Selector', () => {
  beforeEach(() => {
    fetchMock.resetMocks()
    fetchMock.mockResponseOnce(JSON.stringify(assetsJson), { status: 200 })
    mockShowDesktopVariant = false
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should render the component', async () => {
    render(withAssetSelectContext(<Selector />))

    expect(await screen.findByTestId('assetSelectSelector')).toBeInTheDocument()
    expect(screen.getByTestId('gpsButton')).toBeInTheDocument()
  })

  it('should render the layer when passed as prop', () => {
    const Layer: FC<any> = () => <span data-testid="testLayer" />
    render(
      withAssetSelectContext(<Selector />, { ...contextValue, layer: Layer })
    )

    expect(screen.getByTestId('testLayer')).toBeInTheDocument()
  })

  it('should call close when closing the selector', async () => {
    render(withAssetSelectContext(<Selector />))
    expect(contextValue.close).not.toHaveBeenCalled()

    const button = await screen.findByText('Meld dit object')
    userEvent.click(button)
    expect(contextValue.close).toHaveBeenCalled()
  })

  it('should render selection panel', async () => {
    mockShowDesktopVariant = true
    render(withAssetSelectContext(<Selector />))

    expect(await screen.findByTestId('selectionPanel')).toBeInTheDocument()
  })

  it('handles closing the legend panel', () => {
    render(withAssetSelectContext(<Selector />))

    const legendToggleButton = screen.getByText('Legenda')

    expect(screen.queryByTestId('mockLegendPanel')).not.toBeInTheDocument()

    userEvent.click(legendToggleButton)

    expect(screen.getByTestId('mockLegendPanel')).toBeInTheDocument()

    const mockLegendPanel = screen.getByTestId('mockLegendPanel')

    const legendCloseButton = within(mockLegendPanel).getByRole('button')

    userEvent.click(legendCloseButton)

    expect(screen.queryByTestId('mockLegendPanel')).not.toBeInTheDocument()
  })

  it('should show desktop version on desktop', async () => {
    mockShowDesktopVariant = true
    render(withAssetSelectContext(<Selector />))

    expect(await screen.findByTestId('panelDesktop')).toBeInTheDocument()
    expect(screen.queryByTestId('panelMobile')).not.toBeInTheDocument()
  })

  it('should show mobile version on mobile', async () => {
    render(withAssetSelectContext(<Selector />))

    expect(await screen.findByTestId('panelMobile')).toBeInTheDocument()
    expect(screen.queryByTestId('panelDesktop')).not.toBeInTheDocument()
  })

  it('renders a pin marker when there is a location', async () => {
    const coordinates = { lat: 52.3731081, lng: 4.8932945 }

    render(
      withAssetSelectContext(<Selector />, {
        ...contextValue,
        coordinates,
        selection: undefined,
      })
    )
    await screen.findByTestId('assetSelectSelector')

    expect(screen.getByTestId('assetPinMarker')).toBeInTheDocument()
  })

  it('does not render a pin marker', async () => {
    render(
      withAssetSelectContext(<Selector />, {
        ...contextValue,
        coordinates: undefined,
      })
    )
    await screen.findByTestId('assetSelectSelector')

    expect(screen.queryByTestId('assetPinMarker')).not.toBeInTheDocument()
  })

  it('dispatches the location when the map is clicked', async () => {
    const { coordinates, fetchLocation } = contextValue

    render(withAssetSelectContext(<Selector />))

    await screen.findByTestId('assetSelectSelector')

    expect(fetchLocation).not.toHaveBeenCalled()

    userEvent.click(screen.getByTestId('map-base'), {
      clientX: 10,
      clientY: 10,
    })

    expect(fetchLocation).toHaveBeenCalledWith(
      expect.not.objectContaining(coordinates)
    )
  })

  it('dispatches the location when an address is selected', async () => {
    const { setLocation } = contextValue

    render(withAssetSelectContext(<Selector />))

    await screen.findByTestId('pdokAutoSuggest')

    expect(setLocation).not.toHaveBeenCalled()

    const setLocationButton = screen.getByRole('button', { name: 'selectItem' })

    userEvent.click(setLocationButton)

    expect(setLocation).toHaveBeenCalledWith({
      coordinates: mockPDOKResponse.data.location,
      address: mockPDOKResponse.data.address,
    })
  })

  it('dispatches the location when a location is retrieved via geolocation', async () => {
    const coordinates = { lat: 52.3731081, lng: 4.8932945 }
    const coords = {
      accuracy: 50,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
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

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    })

    const { setLocation } = contextValue

    render(withAssetSelectContext(<Selector />))

    expect(setLocation).not.toHaveBeenCalled()

    userEvent.click(screen.getByTestId('gpsButton'))

    await screen.findByTestId('pdokAutoSuggest')

    expect(setLocation).toHaveBeenCalledWith({
      coordinates,
    })
  })

  it('renders already selected address', () => {
    const predefinedAddress = {
      postcode: '1234BR',
      huisnummer: 1,
      huisnummer_toevoeging: 'A',
      woonplaats: 'Amsterdam',
      openbare_ruimte: '',
    }

    render(
      withAssetSelectContext(<Selector />, {
        ...contextValue,
        address: predefinedAddress,
      })
    )

    expect(
      screen.getByText(formatAddress(predefinedAddress))
    ).toBeInTheDocument()
  })

  it('only renders legend button and the zoom message when feature types are available', () => {
    render(
      withAssetSelectContext(<Selector />, {
        ...contextValue,
        meta: { ...contextValue.meta, featureTypes: [] },
      })
    )

    expect(screen.queryByText('Legenda')).not.toBeInTheDocument()
    expect(screen.queryByTestId('zoomMessage')).not.toBeInTheDocument()

    render(
      withAssetSelectContext(<Selector />, {
        ...contextValue,
        meta: {
          ...contextValue.meta,
          featureTypes: contextValue.meta.featureTypes,
        },
      })
    )

    expect(screen.queryByText('Legenda')).toBeInTheDocument()
    expect(screen.queryByTestId('zoomMessage')).toBeInTheDocument()
  })

  it('renders a location marker', () => {
    const coords = {
      accuracy: 50,
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

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    })

    render(withAssetSelectContext(<Selector />))

    expect(screen.queryByTestId('locationMarker')).not.toBeInTheDocument()

    userEvent.click(screen.getByTestId('gpsButton'))

    expect(screen.getByTestId('locationMarker')).toBeInTheDocument()
  })

  it('shows a notification whenever the location cannot be retrieved', () => {
    const code = 1
    const message = 'User denied geolocation'
    const mockGeolocation = {
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
      value: mockGeolocation,
      writable: true,
    })

    render(withAssetSelectContext(<Selector />))

    expect(screen.queryByTestId('mapMessage')).not.toBeInTheDocument()

    userEvent.click(screen.getByTestId('gpsButton'))

    expect(screen.getByTestId('mapMessage')).toBeInTheDocument()
    expect(screen.getByTestId('mapMessage')).toHaveTextContent(
      `${configuration.language.siteAddress} heeft geen toestemming om uw locatie te gebruiken.`
    )
  })

  it('shows a notification whenever the location is out of bounds', () => {
    const coords = {
      accuracy: 50,
      latitude: 55.3731081,
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

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    })

    render(withAssetSelectContext(<Selector />))

    expect(screen.queryByTestId('mapMessage')).not.toBeInTheDocument()

    userEvent.click(screen.getByTestId('gpsButton'))

    expect(screen.getByTestId('mapMessage')).toBeInTheDocument()
    expect(screen.getByTestId('mapMessage')).toHaveTextContent(
      'Uw locatie valt buiten de kaart en is daardoor niet te zien'
    )

    // closing notification
    userEvent.click(
      within(screen.getByTestId('mapMessage')).getByRole('button')
    )

    expect(screen.queryByTestId('mapMessage')).not.toBeInTheDocument()
  })
})
