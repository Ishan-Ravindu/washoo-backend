const { signInValidationRules, validate } = require("./middlewares/validator");
const AuthService = require("../services/auth-service");
const { AppError } = require("../utils/error-handler");
const { SubscribeMessage, RPCObserver } = require("../utils");
const {
  BRANCH_SERVICE,
  EMPLOYEE_SERVICE,
  CUSTOMER_SERVICE,
  BRANCH_RPC,
  EMPLOYEE_RPC,
  CUSTOMER_RPC,
} = require("../config");

module.exports = (app, channel) => {
  const service = new AuthService();

  SubscribeMessage(channel, service, BRANCH_SERVICE);
  SubscribeMessage(channel, service, EMPLOYEE_SERVICE);
  SubscribeMessage(channel, service, CUSTOMER_SERVICE);

  RPCObserver(BRANCH_RPC, service);
  RPCObserver(EMPLOYEE_RPC, service);
  RPCObserver(CUSTOMER_RPC, service);

  app.post(
    "/signin",
    signInValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id, password } = req.body;
        const { data } = await service.SignIn({
          id,
          password,
        });
        res.json(data);
      } catch (err) {
        console.log(err);
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );

  app.post(
    "/signup",
    signInValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id, email, password, roll } = req.body;
        console.log(roll);
        const { data } = await service.SignUp({
          id,
          email,
          password,
          roll,
        });
        res.json(data);
      } catch (err) {
        console.log(err);
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
};
