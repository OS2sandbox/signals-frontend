// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import 'jest-styled-components'

import { withAppContext } from 'test/utils'

import { UNKNOWN_TYPE } from '../../../constants'
import withAssetSelectContext, {
  contextValue,
} from '../../__tests__/withAssetSelectContext'
import DetailPanel from '../DetailPanel'
import type { AssetListProps } from '../../AssetList/AssetList'
import type { DetailPanelProps } from './DetailPanel'

jest.mock('../../AssetList', () =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ onRemove, featureTypes, selection, ...props }: AssetListProps) => (
    <span data-testid="mockAssetList" {...props}>
      {`${selection.description} - ${selection.id}`}
      <input type="button" onClick={onRemove} />
    </span>
  )
)

describe('DetailPanel', () => {
  const GLAS_FEATURE = {
    label: 'Glas',
    description: 'Glas container',
    icon: {
      options: {},
      iconUrl: '/assets/images/afval/glas.svg',
    },
    idField: 'id_nummer',
    typeField: 'fractie_omschrijving',
    typeValue: 'Glas',
  }
  const UNREGISTERED_FEATURE = {
    description: 'Het object staat niet op de kaart',
    label: 'Onbekend',
    icon: {
      iconUrl: '/assets/images/featureUnknownMarker.svg',
    },
    idField: 'id',
    typeField: 'type',
    typeValue: UNKNOWN_TYPE,
  }
  const UNREGISTERED_CONTAINER = {
    description: 'Het object staat niet op de kaart',
    id: '',
    type: UNKNOWN_TYPE,
  }
  const GLAS_CONTAINER = {
    id: 'GLAS123',
    description: 'Glas container',
    type: 'Glas',
  }

  const props: DetailPanelProps = {
    featureTypes: [GLAS_FEATURE, UNREGISTERED_FEATURE],
    language: {
      unregisteredId: 'Nummer van de container',
    },
  }

  const selection = {
    ...GLAS_CONTAINER,
    location: { coordinates: { lat: 0, lng: 12.345345 } },
    label: 'foo bar',
  }

  const selectionUnregistered = {
    ...UNREGISTERED_CONTAINER,
    location: { coordinates: { lat: 0, lng: 12.345345 } },
    label: 'foo bar',
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the panel', () => {
    render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection: undefined,
      })
    )

    expect(screen.getByRole('heading', { name: 'Locatie' })).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', {
        name: 'Het object staat niet op de kaart',
      })
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Meld dit object' })
    ).toBeInTheDocument()

    expect(screen.queryByTestId('assetList')).not.toBeInTheDocument()
  })

  it('renders selected asset', () => {
    render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection,
      })
    )

    expect(
      screen.getByRole('button', { name: 'Meld dit object' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('mockAssetList')).toBeInTheDocument()
    expect(
      screen.getByText(`${selection.description} - ${selection.id}`)
    ).toBeInTheDocument()
  })

  it('calls remove on selected asset', () => {
    render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection,
      })
    )

    const mockAssetList = screen.getByTestId('mockAssetList')

    const removeButton = within(mockAssetList).getByRole('button')

    expect(contextValue.removeItem).not.toHaveBeenCalled()

    userEvent.click(removeButton)

    expect(contextValue.removeItem).toHaveBeenCalled()
  })

  it('adds asset not on map', () => {
    render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection: undefined,
      })
    )

    expect(
      screen.queryByText('Nummer van de container')
    ).not.toBeInTheDocument()

    expect(contextValue.setItem).not.toHaveBeenCalled()

    userEvent.click(
      screen.getByRole('checkbox', {
        name: 'Het object staat niet op de kaart',
      })
    )
    expect(contextValue.setItem).toHaveBeenCalledTimes(1)
    expect(contextValue.setItem).toHaveBeenCalledWith({
      id: '',
      label: 'Het object staat niet op de kaart',
      type: UNKNOWN_TYPE,
    })

    expect(screen.getByText('Nummer van de container')).toBeInTheDocument()

    const unregisteredObjectId = '8976238'

    userEvent.type(screen.getByRole('textbox'), unregisteredObjectId)

    fireEvent.blur(screen.getByRole('textbox'))

    expect(contextValue.setItem).toHaveBeenCalledTimes(2)
    expect(contextValue.setItem).toHaveBeenLastCalledWith({
      id: unregisteredObjectId,
      type: UNKNOWN_TYPE,
      label: `Het object staat niet op de kaart - ${unregisteredObjectId}`,
    })
  })

  it('closes/submits the panel', () => {
    render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection: selectionUnregistered,
      })
    )

    expect(contextValue.close).not.toHaveBeenCalled()

    userEvent.click(screen.getByRole('button', { name: 'Meld dit object' }))

    expect(contextValue.close).toHaveBeenCalled()
  })

  it('handles Enter key on input', () => {
    render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection: selectionUnregistered,
      })
    )

    userEvent.type(
      screen.getByLabelText('Nummer van de container (niet verplicht)'),
      '5'
    )

    expect(contextValue.setItem).not.toHaveBeenCalled()
    expect(contextValue.close).not.toHaveBeenCalled()

    userEvent.type(
      screen.getByLabelText('Nummer van de container (niet verplicht)'),
      '{Enter}'
    )

    expect(contextValue.setItem).toHaveBeenCalledWith({
      id: '5',
      type: UNKNOWN_TYPE,
      label: 'Het object staat niet op de kaart - 5',
    })
    expect(contextValue.close).toHaveBeenCalled()
  })

  it('renders default labels', () => {
    const language = undefined

    const propsWithLanguage = {
      ...props,
      language,
    }

    render(withAppContext(<DetailPanel {...propsWithLanguage} />))

    expect(screen.getByText('Locatie')).toBeInTheDocument()
    expect(
      screen.getByText('Het object staat niet op de kaart')
    ).toBeInTheDocument()
  })

  it('renders custom labels', () => {
    const language = {
      title: 'Locatie',
      subTitle: 'Kies een container op de kaart',
      unregistered: 'De container staat niet op de kaart',
      description: 'Beschrijving',
    }

    const propsWithLanguage = {
      ...props,
      language,
    }

    render(withAppContext(<DetailPanel {...propsWithLanguage} />))

    Object.values(language).forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders the object panel only when feature types are available', () => {
    const { rerender } = render(
      withAssetSelectContext(<DetailPanel {...props} />, {
        ...contextValue,
        selection: undefined,
      })
    )

    expect(screen.getByTestId('unregisteredObjectPanel')).toBeInTheDocument()
    expect(screen.getByTestId('legendPanel')).toBeInTheDocument()
    expect(screen.getByTestId('legendToggleButton')).toBeInTheDocument()

    rerender(
      withAssetSelectContext(<DetailPanel {...props} featureTypes={[]} />, {
        ...contextValue,
        selection: undefined,
      })
    )

    expect(
      screen.queryByTestId('unregisteredObjectPanel')
    ).not.toBeInTheDocument()

    expect(screen.queryByTestId('legendPanel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('legendToggleButton')).not.toBeInTheDocument()
  })

  it('toggles the position of the legend panel', () => {
    render(withAssetSelectContext(<DetailPanel {...props} />))

    expect(screen.getByTestId('legendPanel')).toHaveStyleRule(
      'transform',
      'translate3d( 0,200%,0 )',
      { media: 'only screen and (max-width:767px)' }
    )

    expect(screen.getByTestId('legendPanel')).toHaveStyleRule(
      'transform',
      'translate3d( -200%,0,0 )',
      { media: 'only screen and (min-width:768px)' }
    )

    userEvent.click(screen.getByTestId('legendToggleButton'))

    expect(screen.getByTestId('legendPanel')).toHaveStyleRule(
      'transform',
      'translate3d( 0,0,0 )',
      { media: 'only screen and (max-width:767px)' }
    )

    expect(screen.getByTestId('legendPanel')).toHaveStyleRule(
      'transform',
      'translate3d( 0,0,0 )',
      { media: 'only screen and (min-width:768px)' }
    )
  })
})
