import { Validators } from 'react-reactive-form';

import IncidentNavigation from '../components/IncidentNavigation';

import TextInput from '../components/IncidentForm/components/TextInput/';
import DescriptionWithClassificationInput from '../components/IncidentForm/components/DescriptionWithClassificationInput/';

import PlainText from '../components/IncidentPreview/components/PlainText/';

export default {
  beschrijf: {
    form: {
      controls: {
        description: {
          meta: {
            label: 'Beschrijving',
            placeholder: 'Beschrijving'
          },
          options: {
            validators: Validators.required
          },
          render: DescriptionWithClassificationInput
        },
        category: {
          meta: {
            label: 'Categorie',
            placeholder: 'Categorie',
            readOnly: true,
            type: 'text',
            watch: true
          },
          options: {
            validators: Validators.required
          },
          render: TextInput
        },
        subcategory: {
          meta: {
            label: 'Subcategorie',
            placeholder: 'Subcategorie',
            readOnly: true,
            type: 'text',
            watch: true
          },
          options: {
            validators: Validators.required
          },
          render: TextInput
        },
        $field_0: {
          isStatic: false,
          render: IncidentNavigation
        }
      }
    }
  },
  // vulaan: {
    // form: {
    // },
    // preview: {
    // }
  // },
  email: {
    form: {
      controls: {
        email: {
          meta: {
            label: 'E-mail adres',
            placeholder: 'E-mail adres',
            type: 'text'
          },
          options: {
            validators: Validators.email
          },
          render: TextInput
        },
        $field_0: {
          isStatic: false,
          render: IncidentNavigation
        }
      }
    }
  },
  telefoon: {
    form: {
      controls: {
        phone: {
          meta: {
            label: 'Telefoonnummer',
            placeholder: 'Telefoonnummer',
            type: 'text'
          },
          render: TextInput
        },
        $field_0: {
          isStatic: false,
          render: IncidentNavigation
        }
      }
    }
  },
  samenvatting: {
    form: {
      controls: {
        $field_0: {
          isStatic: false,
          render: IncidentNavigation
        }
      }
    },
    preview: {
      beschrijf: {
        description: {
          label: 'Hier gaat het om',
          render: PlainText
        }
      },
      email: {
        email: {
          label: 'Uw e-mailadres',
          render: PlainText
        }
      },
      telefoon: {
        phone: {
          label: 'Uw (mobiele) telefoon',
          render: PlainText
        }
      }
    }
  // },
  // bedankt: {
    // preview: {
      // bedankt: {}
    // }
  }
};

/*

Stap 1: bechrijf
  waar?
  wat?
  wanneer?

Stap 2: vulaan

Stap 3: email
  email

Stap 4: telefoon
    telefoonnummer

Stap 5: samenvatting
  plaats
  wat
  tijdstip
  [uitgevraagde dingen]
  email
  telefoonnummer

Stap 6: bedankt
  tekst

*/

/*
message:
{
  "description": "Er vaart hier een boot veel te hard",
  "latitude": 52.376,
  "logitude": 4.901,
  "incident_date": "2018-05-19T07:22:15Z",
  "extra_information": "Is een witte boot",
  "reporter": {
    "email": "melder@meldingen.amsterdam.nl",
    "phone": "020-1234567"
  },
  "source": "telefoon",
  "category": "watermelding",
  "subcategory": "overlast",
  "extra_properties": [
    {
      "rederij": "loveboat"
    }
  ]
}
*/
