const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.roleName)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user ? req.user.roleName : 'undefined'} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = authorize;
