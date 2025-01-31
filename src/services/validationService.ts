/**
 * Validates the payload for any given fields.
 * @param payload - The object containing the fields to validate.
 * @param requiredFields - A list of fields that must be present in the payload.
 * @returns An array of validation error objects.
 */
export const validatePayload = (
  payload: Record<string, any>,
  requiredFields: {
    field: string;
    type: "string" | "number";
    allowNull?: boolean;
  }[],
) => {
  const errors: { field: string; message: string }[] = [];

  for (const field of requiredFields) {
    const value = payload[field.field];
    const isNullAllowed = field.allowNull || false;

    if (value === undefined || (!isNullAllowed && value === null)) {
      errors.push({
        field: field.field,
        message: `Field "${field.field}" is required`,
      });
    } else if (typeof value !== field.type) {
      errors.push({
        field: field.field,
        message: `Field "${field.field}" must be of type "${field.type}"`,
      });
    } else if (field.type === "number" && value < 0) {
      errors.push({
        field: field.field,
        message: `Field "${field.field}" cannot be negative`,
      });
    }
  }

  return errors;
};
