const { AuthRepository } = require("../database");
const {
  FormateData,
  GeneratePassword,
  ValidatePassword,
  GenerateSalt,
  GenerateToken,
} = require("../utils");
const { APIError, STATUS_CODES } = require("../utils/app-errors");

// All Business logic will be here
class AuthService {
  constructor() {
    this.repository = new AuthRepository();
  }

  async SignUp(userInputs) {
    try {
      const { id, email, password, roll } = userInputs;
      console.log(roll);
      let salt = await GenerateSalt();

      let authPassword = await GeneratePassword(password, salt);

      console.log("pre created...", authPassword);

      const newAuth = await this.repository.SignUp({
        id,
        email,
        password: authPassword,
        salt,
        roll,
      });

      console.log("created...", newAuth);

      return FormateData(newAuth);
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to SignUp"
      );
    }
  }

  async SignIn(userInputs) {
    try {
      const { id, password } = userInputs;

      const existingAuth = await this.repository.SignIn({ id });

      if (existingAuth) {
        const validPassword = await ValidatePassword(
          password,
          existingAuth.password,
          existingAuth.salt
        );
        if (validPassword && existingAuth.is_active) {
          const token = await GenerateToken({
            email: existingAuth.email,
            id: existingAuth.user_name,
            roll: existingAuth.roll,
          });
          return FormateData({
            id: existingAuth.user_name,
            token,
            roll: existingAuth.roll,
          });
        } else {
          throw new APIError(
            "API Error",
            STATUS_CODES.INTERNAL_ERROR,
            "Unable to SignIn"
          );
        }
      } else {
        throw new APIError(
          "API Error",
          STATUS_CODES.INTERNAL_ERROR,
          "Unable to SignIn"
        );
      }
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to SignIn"
      );
    }
  }

  async DeleteUser(userInputs) {
    try {
      const { id } = userInputs;

      const deletedUser = await this.repository.DeleteUser({
        id,
      });

      return FormateData(deletedUser);
    } catch (err) {
      console.log(err);
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to SignUp"
      );
    }
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;
    switch (event) {
      case "DELETE":
        const { id } = data;
        this.DeleteUser({ id });
        break;
      default:
        break;
    }
  }

  async serveRPCRequest(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;
    switch (event) {
      case "SIGN_UP":
        const { id, email, password, roll } = data;
        console.log("recived...", data);
        return this.SignUp({ id, email, password, roll });
        break;
      default:
        break;
    }
  }
}

module.exports = AuthService;
