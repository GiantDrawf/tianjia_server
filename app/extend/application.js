'use strict';

module.exports = {
  generateJWT(name) {
    const { config } = this;
    const token = this.jwt.sign({ name }, config.jwt.secret);
    return token;
  },
  verifyToken(ctx) {
    const { config } = this;
    const token = config.jwt.getToken(ctx);
    if (!token) return null;
    return this.jwt.verify(token, config.jwt.secret);
  },
  getUserJson(user, ctx) {
    const { config } = this;
    let token = config.jwt.getToken(ctx);
    if (!token) {
      token = this.generateJWT(user.name);
    }
    return {
      id: user._id,
      token,
      name: user.name,
      role: user.role,
    };
  },
};
