import type { AnyObject } from 'yup/es/types'
import * as yup from 'yup'

export default function constructYupResolver(
  controls: { [s: string]: unknown } | ArrayLike<unknown> | undefined
) {
  const schema = controls
    ? Object.fromEntries(
        Object.entries(controls).reduce(
          (acc: Array<[string, any]>, [key, control]: [string, any]) => {
            const validators: any = control?.options?.validators
            // All html fields start as a string
            let validationField: AnyObject = yup.string()

            // Except for locatie
            if (
              key === 'locatie' ||
              key === 'location' ||
              key.startsWith('extra')
            ) {
              validationField = yup.object()
            }

            // Chain multiple validators per field
            if (validators) {
              ;(Array.isArray(validators) ? validators : [validators]).map(
                (validator) => {
                  if (validator === 'required') {
                    validationField = validationField.required()
                  }

                  if (validator === 'email') {
                    validationField = validationField.email()
                  }

                  if (Number.parseInt(validator)) {
                    validationField = validationField.max(
                      Number.parseInt(validator)
                    )
                  }

                  if (
                    Array.isArray(validator) &&
                    validator[0] === 'maxLength' &&
                    Number.parseInt(validator[1])
                  ) {
                    validationField = validationField.max(
                      Number.parseInt(validator[1])
                    )
                  } else if (typeof validator === 'function') {
                    validationField = validationField.test(
                      'custom',
                      (v: any) => validator({ value: v })?.custom,
                      (v: any) => !validator({ value: v })?.custom
                    )
                  }
                }
              )

              acc.push([key, validationField])
            }
            return acc
          },
          []
        )
      )
    : {}
  return yup.object(schema)
}
