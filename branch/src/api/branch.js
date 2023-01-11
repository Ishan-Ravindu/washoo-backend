const {
  createBranchValidationRules,
  getBranchesValidationRules,
  getBranchValidationRules,
  validate,
} = require("./middlewares/validator");
const { BranchAuth } = require("./middlewares/auth");
const BranchService = require("../services/branch-service");
const { AppError } = require("../utils/error-handler");
const { PublishMessage, RPCRequest } = require("../utils");
const { BRANCH_SERVICE, BRANCH_RPC } = require("../config");

module.exports = (app, channel) => {
  const service = new BranchService();

  app.post(
    "/branch",
    BranchAuth,
    createBranchValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { email, password, phone, street, postalCode, city, country } =
          req.body;
        const { data } = await service.CreateBranch({
          email,
          password,
          phone,
          street,
          postalCode,
          city,
          country,
        });

        await RPCRequest(
          BRANCH_RPC,
          JSON.stringify({
            data: { id: data.branch_id, email, password, roll: "branch" },
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
    "/branch/:id",
    BranchAuth,
    getBranchValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { data } = await service.GetBranch({ id });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );

  app.get(
    "/branches/:page",
    BranchAuth,
    getBranchesValidationRules,
    validate,
    async (req, res, next) => {
      try {
        const { page } = req.params;
        const { data } = await service.GetBranches({ page });
        res.json(data);
      } catch (err) {
        new AppError(err.statusCode || 500, err.message, res).send();
      }
    }
  );
};
