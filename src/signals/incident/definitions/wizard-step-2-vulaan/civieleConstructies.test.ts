import civieleConstructies from './civieleConstructies'

describe('definition civieleConstructiesn', () => {
  it('has a defined set of controls', () => {
    const keys = Object.keys(civieleConstructies)

    expect(keys).toStrictEqual(['locatie', 'extra_brug'])
  })
})
