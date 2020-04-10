import reverseGeocoderService, { formatRequest, serviceURL } from '../services/reverseGeocoderService';

describe('formatRequest', () => {
  const testLocation = {
    latitude: 42,
    longitude: 4,
  };
  const result = 'https://base-url&X=39180.476027290264&Y=-667797.6751788945&distance=';

  it('should format correct without distance', () => {
    expect(formatRequest('https://base-url', testLocation)).toEqual(`${result}50`);
  });

  it('should format correct with distance', () => {
    expect(formatRequest('https://base-url', testLocation, 20)).toEqual(`${result}20`);
  });
});

describe('reverseGeocoderService', () => {
  const testLocation = {
    lat: 42,
    lng: 4,
  };

  const serviceURLResponse = {
    response: {
      numFound: 1,
      start: 0,
      maxScore: 15.822564,
      docs: [
        {
          woonplaatsnaam: 'Amsterdam',
          huis_nlt: '189A-2',
          weergavenaam: 'Bloemgracht 189A-2, 1016KP Amsterdam',
          straatnaam: 'Bloemgracht',
          id: 'adr-a03ce477aaa2e95e9246139b631484ad',
          postcode: '1016KP',
          centroide_ll: 'POINT(4.87745608 52.37377195)',
        },
      ],
    },
  };

  const bagResponse = {
    features: [
      {
        properties: {
          code: 'N',
          display: 'Noord',
          distance: 4467.47982312323,
          id: '03630000000019',
          type: 'gebieden/stadsdeel',
          uri: 'https://api.data.amsterdam.nl/gebieden/stadsdeel/03630000000019/',
        },
      },
      {
        properties: {
          code: '61b',
          display: 'Vogelbuurt Zuid',
          distance: 109.145476159977,
          id: '03630000000644',
          type: 'gebieden/buurt',
          uri: 'https://api.data.amsterdam.nl/gebieden/buurt/03630000000644/',
          vollcode: 'N61b',
        },
      },
    ],
    type: 'FeatureCollection',
  };
  const testResult = {
    id: serviceURLResponse.response.docs[0].id,
    value: serviceURLResponse.response.docs[0].weergavenaam,
    data: {
      location: { lat: 52.37377195, lng: 4.87745608 },
      address: {
        openbare_ruimte: serviceURLResponse.response.docs[0].straatnaam,
        huisnummer: serviceURLResponse.response.docs[0].huis_nlt,
        huisletter: '',
        huisnummertoevoeging: '',
        postcode: serviceURLResponse.response.docs[0].postcode,
        woonplaats: serviceURLResponse.response.docs[0].woonplaatsnaam,
      },
      stadsdeel: bagResponse.features[0].properties.code,
    },
  };

  beforeEach(() => {
    fetch.mockResponseOnce(JSON.stringify(serviceURLResponse)).mockResponseOnce(JSON.stringify(bagResponse));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the correct location', async () => {
    const result = await reverseGeocoderService(testLocation);

    expect(fetch).toHaveBeenCalledTimes(2);

    expect(fetch).toHaveBeenNthCalledWith(1, expect.stringContaining(serviceURL));
    expect(fetch).toHaveBeenNthCalledWith(2, expect.stringContaining('https://api.data.amsterdam.nl/geosearch/bag/'));

    expect(result).toEqual(testResult);
  });
});
