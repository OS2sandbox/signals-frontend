// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2022 Gemeente Amsterdam

import { validatePhoneNumber } from '../custom-validators'
import { setupSchema } from './index'

describe('Yup resolver takes a bunch of controls and returns it into a schema', () => {
  it('should return a schema', async () => {
    const controls = {
      source: {
        options: {
          validators: ['required'],
        },
      },
      locatie: {
        options: {
          validators: ['required'],
        },
      },
      email: {
        options: {
          validators: ['email'],
        },
      },
      maxlen2: {
        options: {
          validators: ['required', ['maxLength', 1]],
        },
      },
      phoneNumber: {
        options: {
          validators: [validatePhoneNumber],
        },
      },
    }

    const schema = setupSchema(controls)
    await expect(
      schema.validateAt('source', { source: 'online' })
    ).resolves.toBeTruthy()
    await expect(
      schema.validateAt('locatie', {
        locatie: { location: { coordinates: undefined } },
      })
    ).rejects.toBeTruthy()
    await expect(
      schema.validateAt('locatie', {
        locatie: { location: { coordinates: 'blackrosemarchesa' } },
      })
    ).resolves.toBeTruthy()
    await expect(
      schema.validateAt('email', { email: 'blackrosemarchesa' })
    ).rejects.toBeTruthy()
    await expect(
      schema.validateAt('email', { email: 'blackrosemarchesa@mail.com' })
    ).resolves.toBeTruthy()
    await expect(
      schema.validateAt('maxlen2', { maxlen2: 'b' })
    ).resolves.toBeTruthy()
    await expect(
      schema.validateAt('phoneNumber', { phoneNumber: 'armageddon' })
    ).rejects.toBeTruthy()
    await expect(
      schema.validateAt('phoneNumber', { phoneNumber: 666 })
    ).resolves.toBeTruthy()
  })
})
