const yup = require('yup');

/**
 * Express middleware factory that validates req.body against a Yup schema.
 * Returns a 400 error with structured field-level error messages on failure.
 * @param {yup.ObjectSchema} schema - Yup validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => async (req, res, next) => {
  try {
    const validatedBody = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = validatedBody;
    next();
  } catch (err) {
    const errors = err.inner.map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors,
    });
  }
};

module.exports = validate;
