// middleware/authMiddleware.js
import passport from "passport";

const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send("Unauthorized");
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default authMiddleware;
