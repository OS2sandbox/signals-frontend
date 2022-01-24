// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import type { FeatureCollection } from 'geojson'

import { render, screen } from '@testing-library/react'
import { Map } from '@amsterdam/react-maps'

import type {
  CheckedFeatureType,
  Feature,
  ReportedFeatureType,
} from 'signals/incident/components/form/MapSelectors/types'
import type { AssetSelectValue } from 'signals/incident/components/form/MapSelectors/Asset/types'

import caterpillarsJson from 'utils/__tests__/fixtures/caterpillars.json'
import { meta, selection } from 'utils/__tests__/fixtures/caterpillarsSelection'

import MAP_OPTIONS from 'shared/services/configuration/map-options'
import { WfsDataProvider } from 'signals/incident/components/form/MapSelectors/Asset/Selector/WfsLayer/context'
import withAssetSelectContext, {
  contextValue,
} from 'signals/incident/components/form/MapSelectors/Asset/__tests__/withAssetSelectContext'
import StatusLayer from './StatusLayer'
import {
  getCheckedFeatureType,
  getIsChecked,
  getIsReported,
  getReportedFeatureType,
} from './utils'

const assetSelectProviderValue: AssetSelectValue = {
  ...contextValue,
  selection: selection[0],
  meta,
}

const reportedFeatureType = getReportedFeatureType(meta.featureTypes)
const checkedFeatureType = getCheckedFeatureType(meta.featureTypes)

const statusFeatures = caterpillarsJson.features.filter(
  (feature) =>
    getIsReported(
      feature as unknown as Feature,
      reportedFeatureType as ReportedFeatureType
    ) ||
    getIsChecked(
      feature as unknown as Feature,
      checkedFeatureType as CheckedFeatureType
    )
)

describe('StatusLayer', () => {
  const withMapCaterpillar = () =>
    withAssetSelectContext(
      <Map data-testid="map-test" options={MAP_OPTIONS}>
        <WfsDataProvider value={caterpillarsJson as FeatureCollection}>
          <StatusLayer
            statusFeatures={statusFeatures as unknown as Feature[]}
            reportedFeatureType={reportedFeatureType as ReportedFeatureType}
            checkedFeatureType={checkedFeatureType as CheckedFeatureType}
          />
        </WfsDataProvider>
      </Map>,
      { ...assetSelectProviderValue }
    )

  it('should render reported and checked features in the map', () => {
    render(withMapCaterpillar())
    const reportedFeatureId = statusFeatures[0].properties['OBJECTID']
    const reportedDescription = `${reportedFeatureType?.description} - ${reportedFeatureId}`
    expect(screen.getByAltText(reportedDescription)).toBeInTheDocument()

    const checkedFeatureId = statusFeatures[2].properties['OBJECTID']
    const checkedDescription = `${checkedFeatureType?.description} - ${checkedFeatureId}`
    expect(screen.getByAltText(checkedDescription)).toBeInTheDocument()
  })
})