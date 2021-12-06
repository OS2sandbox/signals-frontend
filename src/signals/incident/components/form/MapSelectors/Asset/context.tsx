// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2021 Gemeente Amsterdam
import type { FunctionComponent } from 'react'
import { createContext } from 'react'
import type { AssetSelectValue } from './types'

export const initialValue: AssetSelectValue = {
  close: /* istanbul ignore next */ () => {},
  edit: /* istanbul ignore next */ () => {},
  location: [0, 0],
  message: undefined,
  meta: { endpoint: '', featureTypes: [] },
  selection: [],
  setLocation: /* istanbul ignore next */ () => {},
  setMessage: /* istanbul ignore next */ () => {},
  update: /* istanbul ignore next */ () => {},
}

const AssetSelectContext = createContext(initialValue)

interface AssetSelectProviderProps {
  value: AssetSelectValue
}

export const AssetSelectProvider: FunctionComponent<AssetSelectProviderProps> =
  ({ value, children }) => (
    <AssetSelectContext.Provider value={value}>
      {children}
    </AssetSelectContext.Provider>
  )

export default AssetSelectContext
