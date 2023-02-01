// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2023 Gemeente Amsterdam
import { getAreaChart } from './area-chart'

const mockValues = [
  { date: '01 Jan 2012 23:00:00', amount: 48 },
  { date: '02 Jan 2012 23:00:00', amount: 34 },
  { date: '03 Jan 2012 23:00:00', amount: 44 },
  { date: '04 Jan 2012 23:00:00', amount: 40 },
  { date: '05 Jan 2012 23:00:00', amount: 48 },
  { date: '06 Jan 2012 23:00:00', amount: 45 },
  {
    date: '07 Jan 2012 23:00:00',
    amount: 50,
    image: '/assets/images/area-chart-tooltip.svg',
  },
]

const maxDomain = 60
const mockToday = { year: 2012, month: 1, date: 7, hours: 23, minutes: 0 }

describe('get-area-chart', () => {
  it('should return correct object', () => {
    const result = getAreaChart(mockValues, maxDomain, mockToday)

    expect(result).toMatchInlineSnapshot(`
      Object {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "config": Object {
          "style": Object {
            "area": Object {
              "color": "#FEECEB",
            },
            "cell": Object {
              "stroke": "transparent",
            },
            "line": Object {
              "color": "#004699",
              "strokeWidth": 1,
            },
            "point": Object {
              "color": "#004699",
              "filled": true,
              "opacity": 1,
              "size": 140,
            },
            "text": Object {
              "align": "center",
              "baseline": "bottom",
              "fontSize": 12,
              "fontWeight": 700,
            },
          },
        },
        "data": Object {
          "values": Array [
            Object {
              "amount": 48,
              "date": "01 Jan 2012 23:00:00",
            },
            Object {
              "amount": 34,
              "date": "02 Jan 2012 23:00:00",
            },
            Object {
              "amount": 44,
              "date": "03 Jan 2012 23:00:00",
            },
            Object {
              "amount": 40,
              "date": "04 Jan 2012 23:00:00",
            },
            Object {
              "amount": 48,
              "date": "05 Jan 2012 23:00:00",
            },
            Object {
              "amount": 45,
              "date": "06 Jan 2012 23:00:00",
            },
            Object {
              "amount": 50,
              "date": "07 Jan 2012 23:00:00",
              "image": "/assets/images/area-chart-tooltip.svg",
            },
          ],
        },
        "encoding": Object {
          "x": Object {
            "axis": Object {
              "domainColor": "white",
              "labelAngle": 0,
              "labelFont": "Amsterdam Sans",
              "labelFontSize": 14,
              "labelFontWeight": 700,
              "labelLineHeight": 16,
              "labelSeparation": 10,
              "offset": 10,
              "ticks": false,
            },
            "field": "date",
            "sort": null,
            "timeUnit": "day",
            "title": "",
            "type": "ordinal",
          },
          "y": Object {
            "axis": Object {
              "domainColor": "white",
              "grid": false,
              "labelFont": "Amsterdam Sans",
              "labelFontSize": 14,
              "labelFontWeight": 700,
              "labelLineHeight": 16,
              "offset": -15,
              "ticks": false,
            },
            "field": "amount",
            "scale": Object {
              "domain": Array [
                0,
                60,
              ],
              "type": "linear",
            },
            "title": "",
            "type": "quantitative",
          },
        },
        "height": 220,
        "layer": Array [
          Object {
            "mark": Object {
              "line": true,
              "type": "area",
            },
          },
          Object {
            "mark": Object {
              "type": "point",
            },
            "params": Array [
              Object {
                "name": "highlight",
                "select": Object {
                  "on": "mouseover",
                  "type": "point",
                },
              },
            ],
          },
          Object {
            "encoding": Object {
              "text": Object {
                "condition": Object {
                  "empty": false,
                  "field": "amount",
                  "param": "highlight",
                  "type": "quantitative",
                },
              },
            },
            "mark": Object {
              "color": "#004699",
              "type": "text",
              "yOffset": -10,
            },
            "transform": Array [
              Object {
                "filter": Object {
                  "not": Object {
                    "equal": Object {
                      "date": 7,
                      "hours": 23,
                      "minutes": 0,
                      "month": 1,
                      "year": 2012,
                    },
                    "field": "date",
                  },
                },
              },
            ],
          },
          Object {
            "encoding": Object {
              "url": Object {
                "field": "image",
                "type": "nominal",
              },
            },
            "mark": Object {
              "height": 35,
              "type": "image",
              "width": 35,
              "yOffset": -22,
            },
            "transform": Array [
              Object {
                "filter": Object {
                  "equal": Object {
                    "date": 7,
                    "hours": 23,
                    "minutes": 0,
                    "month": 1,
                    "year": 2012,
                  },
                  "field": "date",
                },
              },
            ],
          },
          Object {
            "encoding": Object {
              "text": Object {
                "field": "amount",
              },
            },
            "mark": Object {
              "color": "white",
              "type": "text",
              "yOffset": -17.5,
            },
            "transform": Array [
              Object {
                "filter": Object {
                  "equal": Object {
                    "date": 7,
                    "hours": 23,
                    "minutes": 0,
                    "month": 1,
                    "year": 2012,
                  },
                  "field": "date",
                },
              },
            ],
          },
        ],
        "width": 430,
      }
    `)
  })
})