const mongoose = require("mongoose");
const { AuthSchema } = require("../models");
const { APIError, STATUS_CODES } = require("../../utils/app-errors");

//Dealing with data base operations
class AuthRepository {
  async SignUp({ id, email, password, salt, roll }) {
    try {
      const auth = new AuthSchema({
        user_name: id,
        email,
        password,
        salt,
        roll,
        is_active: true,
      });

      const authResult = await auth.save();
      return authResult;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to SignUp"
      );
    }
  }

  async SignIn({ id }) {
    try {
      const auth = await AuthSchema.findOne({ user_name: id });
      return auth;
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to SignIn"
      );
    }
  }

  async DeleteUser({ id }) {
    try {
      const auth = await AuthSchema.findOneAndUpdate(
        { user_name: id },
        {
          is_active: false,
        }
      );
      return auth;
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to SignIn"
      );
    }
  }
}

module.exports = AuthRepository;
