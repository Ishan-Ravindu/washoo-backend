const {
  createEmployeeValidationRules,
  getEmployeeValidationRules,
  getEmployeesValidationRules,
  UpdateEmployeeValidationRules,
  DeleteEmployeeValidationRules,
  validate,
} = require("./middlewares/validator");
const EmployeeService = require("../services/employee-service");
const { AppError } = require("../utils/error-handler");
const { PublishMessage, RPCRequest } = require("../utils");
const { EMPLOYEE_SERVICE, EMPLOYEE_RPC } = require("../config");
const { BranchAuth, EmployeeAuth } = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new EmployeeService();
  app.post(
    "/employee",
    BranchAuth,
    createEmployeeValidationRules,
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
          possition,
          nic,
        } = req.body;
        const { id } = req.user.id;
        const { data } = await service.CreateEmployee({
          email,
          name,
          phone,
          street,
          postalCode,
          city,
          country,
          possition,
          branch: id,
          nic,
        });
        console.log(data);
        await RPCRequest(
          EMPLOYEE_RPC,
          JSON.stringify({
            data: { id: data.employee_id, email, password, roll: "staff" },
            event: "SIGN_UP",
          })
        );

        res.json(data);
      } catch (err) {
        console.log(err);
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.get(
    "/employees/:page",
    BranchAuth,
    getEmployeesValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { page } = req.params;
        const { id } = req.user.id;
        const { data } = await service.GetEmployees({ page, id });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.get(
    "/employee/:id",
    EmployeeAuth,
    getEmployeeValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { data } = await service.GetEmployee({ id });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
  app.put(
    "/employee/:id",
    BranchAuth,
    UpdateEmployeeValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const {
          phone,
          name,
          street,
          postalCode,
          city,
          country,
          possition,
          branch,
        } = req.body;
        const { data } = await service.UpdateEmployee({
          id,
          name,
          phone,
          street,
          postalCode,
          city,
          country,
          possition,
          branch,
        });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );

  app.delete(
    "/employee/:id",
    BranchAuth,
    DeleteEmployeeValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { data } = await service.DeleteEmployee({
          id,
        });
        PublishMessage(
          channel,
          EMPLOYEE_SERVICE,
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
