exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect("/login");
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  return res.status(403).send("Forbidden: Admins only");
};

exports.allowRoles = (roles) => {
  return (req, res, next) => {
    if (req.session.user && roles.includes(req.session.user.role)) {
      return next();
    }
    return res.status(403).send("Forbidden: You do not have access");
  };
};


// Middleware to set user in views locals (call this in your main app)
exports.setUserInViews = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};
