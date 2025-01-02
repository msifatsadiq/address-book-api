const Joi = require("joi");

const addressSchema = Joi.object({
  id: Joi.number().optional().min(1).max(100),
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be exactly 10 digits.",
    }),
  address: Joi.string().min(5).max(255).required(),
});

module.exports = { addressSchema };
