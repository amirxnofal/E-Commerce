import * as e from "../responses/error.response.js";

export const Validation = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error)
      return e.BadRequestException({
        message: "Validation error",
        extra: error.message,
      });
    next();
  };
};
