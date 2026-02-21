const { Strategy, ExtractJwt } = require("passport-jwt");
const db = require("./db");

module.exports = passport => {
  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: "secretkey"
      },
      (jwt_payload, done) => {
        db.query(
          "SELECT * FROM users WHERE id = ?",
          [jwt_payload.id],
          (err, rows) => {
            if (err) return done(err, false);
            if (rows.length > 0) return done(null, rows[0]);
            return done(null, false);
          }
        );
      }
    )
  );
};