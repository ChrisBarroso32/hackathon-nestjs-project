import { ValidationOptions, buildMessage, ValidateBy } from 'class-validator';

// @MinDate() is evaluated once at class load, so it cannot express "now".
export function IsFutureDate(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isFutureDate',
      validator: {
        validate: (value: unknown) =>
          value instanceof Date &&
          !Number.isNaN(value.getTime()) &&
          value.getTime() > Date.now(),
        defaultMessage: buildMessage(
          (eachPrefix) => `${eachPrefix}$property must be a future date`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
