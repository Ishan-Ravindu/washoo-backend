const { ValidateToken } = require("../../utils");

const EmployeeAuth = async (req, res, next) => {
  const isAuthorized = await ValidateToken(req);

  if (isAuthorized) {
    if (
      (req.user.id.roll &&
        req.user.id.roll == "staff" &&
        req.user.id.id == req.params.id) ||
      (req.user.id.roll && req.user.id.roll == "branch")
    )
      return next();
    else return res.status(403).json({ message: "Not Authorized" });
  }

  return res.status(403).json({ message: "Not Authorized" });
};

const BranchAuth = async (req, res, next) => {
  const isAuthorized = await ValidateToken(req);

  if (isAuthorized) {
    console.log(req.user.id);
    if (req.user.id.roll && req.user.id.roll == "branch") return next();
    else return res.status(403).json({ message: "Not Authorized" });
  }

  return res.status(403).json({ message: "Not Authorized" });
};

const UserAuth = async (req, res, next) => {
  const isAuthorized = await ValidateToken(req);

  if (isAuthorized) {
    console.log(req.user.id);
    if (req.user.id.roll && req.user.id.roll == "staff") return next();
    else return res.status(403).json({ message: "Not Authorized" });
  }

  return res.status(403).json({ message: "Not Authorized" });
};

const EmployeeUserAuth = async (req, res, next) => {
  const isAuthorized = await ValidateToken(req);

  if (isAuthorized) {
    if (
      (req.user.id.roll &&
        req.user.id.roll == "user" &&
        req.user.id.id == req.params.id) ||
      (req.user.id.roll && req.user.id.roll == "staff")
    )
      return next();
    else return res.status(403).json({ message: "Not Authorized" });
  }

  return res.status(403).json({ message: "Not Authorized" });
};

module.exports = {
  EmployeeAuth,
  BranchAuth,
  UserAuth,
  EmployeeUserAuth,
};
