// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import type { FC } from 'react'
import type { Feature as GeoJSONFeature, Point } from 'geojson'
import type { IconOptions, LatLngLiteral } from 'leaflet'
import type { Address } from 'types/address'
import type { EventHandler } from '../types'
import type { UNREGISTERED_TYPE } from '../constants'
import type { FormFieldProps } from '../../FormField/FormField'

type Icon = {
  id: string
  icon: string
}

export interface Item extends Record<string, unknown> {
  location: {
    address?: Address
    coordinates?: LatLngLiteral
  }
  description?: string
  id: string | number
  isReported?: boolean
  type?: typeof UNREGISTERED_TYPE | string
}

export interface FeatureType {
  label: string
  description: string
  icon: FeatureIcon
  iconId?: string
  iconIsReportedId?: string
  idField: string
  isReportedField?: string
  isReportedValue?: number
  typeField: string
  typeValue: string
}

export interface FeatureIcon {
  options?: Partial<IconOptions>
  iconSvg: string
  selectedIconSvg?: string
  reportedIconSvg?: string
}

export interface Options {
  className: string
  iconSize: number[]
}

export interface Meta extends Record<string, unknown> {
  name?: string
  endpoint: string
  featureTypes: FeatureType[]
  language?: Record<string, string>
  wfsFilter?: string
  icons?: Icon[]
  extraProperties?: string[]
  ifAllOf?: { subcategory: string }
  label?: string
  shortLabel?: string
  pathMerge?: string
}

export interface AssetSelectValue {
  address?: Address
  close: () => void
  edit: EventHandler
  layer?: FC
  coordinates?: LatLngLiteral
  message?: string
  meta: Meta
  removeItem: () => void
  selection?: Item
  setItem: (item: Item) => void
  setLocation: (latLng: LatLngLiteral) => void
  setMessage: (message?: string) => void
}

export interface DataLayerProps {
  featureTypes: FeatureType[]
  desktopView?: boolean
  allowClusters?: boolean
}

export interface AssetSelectRendererProps extends FormFieldProps {
  meta: Meta
  handler: any
  parent: any
  validatorsOrOpts: any
}

export type FeatureProps = Record<string, string | number | undefined>
export type Feature = GeoJSONFeature<Point, FeatureProps>
