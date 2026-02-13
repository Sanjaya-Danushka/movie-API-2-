export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (result.success) {
    return next();
  }

  const errors = result.error.issues.map((issue) => issue.message);

  return res.status(400).json({
    error: errors.join(", "),
  });
};
