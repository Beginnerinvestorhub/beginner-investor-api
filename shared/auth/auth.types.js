"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationError = exports.AuthenticationError = void 0;
class AuthenticationError extends Error {
    code;
    statusCode;
    constructor(message, code = 'AUTHENTICATION_ERROR', statusCode = 401) {
        super(message);
        this.name = 'AuthenticationError';
        this.code = code;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends Error {
    code;
    statusCode;
    constructor(message, code = 'AUTHORIZATION_ERROR', statusCode = 403) {
        super(message);
        this.name = 'AuthorizationError';
        this.code = code;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
exports.AuthorizationError = AuthorizationError;
//# sourceMappingURL=auth.types.js.map