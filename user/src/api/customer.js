const {
  createCustomerValidationRules,
  getCustomerValidationRules,
  UpdateCustomerValidationRules,
  addAccountValidationRules,
  getCustomersValidationRules,
  DeleteCustomerValidationRules,
  validate,
} = require("./middlewares/validator");
const CustomerService = require("../services/customer-service");
const { AppError } = require("../utils/error-handler");
const {
  SubscribeMessage,
  PublishMessage,
  RPCRequest,
  RPCObserver,
} = require("../utils");
const {
  ACCOUNT_SERVICE,
  CUSTOMER_SERVICE,
  CUSTOMER_RPC,
  ACCOUNT_RPC,
} = require("../config");
const { UserAuth, EmployeeUserAuth } = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new CustomerService();

  SubscribeMessage(channel, service, ACCOUNT_SERVICE);
  RPCObserver(ACCOUNT_RPC, service);

  app.post(
    "/customer",
    UserAuth,
    createCustomerValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const {
          email,
          name,
          password,
          phone,
          street,
          postalCode,
          city,
          country,
          nic,
        } = req.body;
        const { data } = await service.CreateCustomer({
          email,
          name,
          phone,
          street,
          postalCode,
          city,
          country,
          nic,
        });
        await RPCRequest(
          CUSTOMER_RPC,
          JSON.stringify({
            data: { id: data.user_id, email, password, roll: "user" },
            event: "SIGN_UP",
          })
        );
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.get(
    "/customers/:page",
    UserAuth,
    getCustomersValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { page } = req.params;
        const { data } = await service.GetCustomers({ page });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.get(
    "/customer/:id",
    EmployeeUserAuth,
    getCustomerValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { data } = await service.GetCustomer({ id });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.put(
    "/customer/:id",
    UserAuth,
    UpdateCustomerValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { phone, street, postalCode, city, name, country } = req.body;
        const { data } = await service.UpdateCustomer({
          id,
          phone,
          street,
          postalCode,
          city,
          country,
          name,
        });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.post(
    "/customer/account/:id",
    EmployeeUserAuth,
    addAccountValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { accountId } = req.body;
        const { data } = await service.AddAccount({
          id,
          accountId,
        });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );

  app.delete(
    "/customer/:id",
    UserAuth,
    DeleteCustomerValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { data } = await service.DeleteCustomer({
          id,
        });
        PublishMessage(
          channel,
          CUSTOMER_SERVICE,
          JSON.stringify({
            data: { id },
            event: "DELETE",
          })
        );
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
};
