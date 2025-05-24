// Check if user is logged in
exports.isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }

  // Pass a 403 error for unauthenticated access
  const err = new Error("Unauthorized: Please log in");
  err.status = 403;
  return next(err);
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }

  const err = new Error("Forbidden: Admins only");
  err.status = 403;
  return next(err);
};

// Allow specific roles
exports.allowRoles = (roles) => {
  return (req, res, next) => {
    if (req.session.user && roles.includes(req.session.user.role)) {
      return next();
    }

    const err = new Error("Forbidden: You do not have access");
    err.status = 403;
    return next(err);
  };
};

// Set user in views locals (keep as-is)
exports.setUserInViews = (req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
};
