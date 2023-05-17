// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2023 Gemeente Amsterdam
import {
  falsyOrNumber,
  inPast,
} from 'signals/incident/services/custom-validators'
import { QuestionFieldType } from 'types/question'

import locatie from './locatie'

export const ICON_SIZE = 40

export const controls = {
  locatie,
  dateTime: {
    meta: {
      ifOneOf: {
        subcategory: ['asbest-accu', 'handhaving-op-afval'],
      },
      label: 'Wanneer was het?',
      ignoreVisibility: true,
      canBeNull: true,
    },
    options: {
      validators: [falsyOrNumber, inPast],
    },
    render: QuestionFieldType.DateTimeInput,
  },
  extra_afval: {
    meta: {
      ifOneOf: {
        subcategory: ['grofvuil', 'huisafval', 'puin-sloopafval'],
      },
      label: 'Welk afval is verkeerd neergezet?',
      subtitle:
        'U helpt ons door zoveel mogelijk informatie te geven over het soort afval: huisafval, bedrijfsafval, grofvuil of dozen en papier.',
      shortLabel: 'Welke soort',
      pathMerge: 'extra_properties',
    },
    options: {
      validators: ['required'],
    },
    render: QuestionFieldType.TextInput,
  },
  extra_afval_eigenaar: {
    meta: {
      ifOneOf: {
        subcategory: ['grofvuil', 'huisafval', 'puin-sloopafval'],
      },
      label:
        'Weet u wie de eigenaar is van het verkeerd geplaatste afval? Bijvoorbeeld omdat u dat ziet aan een adressticker of iets anders?',
      shortLabel: 'Welke eigenaar',
      pathMerge: 'extra_properties',
      values: {
        ja: 'Ja',
        nee: 'Nee',
      },
    },
    options: {
      validators: ['required'],
    },
    render: QuestionFieldType.RadioInput,
  },
  extra_afval_eigenaar_ja: {
    meta: {
      ifOneOf: {
        extra_afval_eigenaar: 'ja',
      },
      value:
        'We willen graag telefonisch contact met u hierover. Als u dat goed vindt, vul dan uw telefoonnummer in op de volgende pagina.',
      type: 'info',
    },
    render: QuestionFieldType.PlainText,
  },
}

export default controls
