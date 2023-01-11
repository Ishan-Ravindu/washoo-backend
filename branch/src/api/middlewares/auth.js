const { ValidateToken } = require("../../utils");

const BranchAuth = async (req, res, next) => {
  const isAuthorized = await ValidateToken(req);

  if (isAuthorized) {
    console.log(req.user.id.roll);
    if (req.user.id.roll && req.user.id.roll == "branch") return next();
    else return res.status(403).json({ message: "Not Authorized" });
  }

  return res.status(403).json({ message: "Not Authorized" });
};

module.exports = {
  BranchAuth,
};
