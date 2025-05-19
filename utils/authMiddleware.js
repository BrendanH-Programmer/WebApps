// Ensure user is logged in
exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect("/login");
};

// Restrict to specific role (e.g. "admin")
exports.isAdmin = (req, res, next) => {
  if (req.session.userId && req.session.role === "admin") {
    return next();
  }
  return res.status(403).send("Forbidden: Admins only");
};

// Restrict to any allowed roles (array of roles)
exports.allowRoles = (roles) => {
  return (req, res, next) => {
    if (req.session.userId && roles.includes(req.session.role)) {
      return next();
    }
    return res.status(403).send("Forbidden: You do not have access");
  };
};
