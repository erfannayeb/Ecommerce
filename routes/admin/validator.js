const { check, validationResult } = require("express-validator");
const userRepo = require("../../repositories/users");

module.exports = {
  requireTitle: check("title")
    .trim()
    .isLength({ min: 4, max: 25 })
    .withMessage("Must be between 4 and 25"),
  requirePrice: check("price")
    .trim()
    .toFloat()
    .isFloat({ min: 1 })
    .withMessage("Must be more than 1"),
  requireEmail: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must be a valid email")
    .custom(async (email) => {
      const existUser = await userRepo.getoneBy({ email });

      if (existUser) {
        throw new Error("email in used");
      }
    }),
  requirePassword: check("password")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Must be between 4 and 20 characters"),
  requirePasswordConfirmation: check("passwordConfirmation")
    .trim()
    .custom(async (passwordConfirmation, { req }) => {
      if (passwordConfirmation !== req.body.password) {
        throw new Error("passwords must match");
      }
    }),
  requireEmailExist: check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Must provide valid email")
    .custom(async (email) => {
      const user = await userRepo.getoneBy({ email });

      if (!user) {
        throw new Error("Email not found");
      }
    }),
  requireValidPasswordForUser: check("password")
    .trim()
    .custom(async (password, { req }) => {
      const user = await userRepo.getoneBy({ email: req.body.email });
      if (!user) {
        throw new Error("Invalid Password");
      }
      const validPassword = await userRepo.comparePassword(
        user.password,
        password
      );

      if (!validPassword) {
        throw new Error("Invalid Password");
      }
    }),
};
