const joi = require("@hapi/joi");

const validateUser = async (data) => {
  return joi
    .object({
      username: joi.string().required(),
      email: joi.string().email().required(),
      gender: joi.string().max(1).required(),
      password: joi.string().min(8).required(),
    })
    .validate(data);
};

module.exports = { validateUser };
