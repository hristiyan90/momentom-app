/**
 * Authentication error thrown when JWT verification fails or token is invalid
 */
export class UnauthorizedError extends Error {
  code: string;
  
  constructor(message: string, code: string = 'AUTHENTICATION_REQUIRED') {
    super(message);
    this.name = 'UnauthorizedError';
    this.code = code;
  }
}

/**
 * Error thrown when session refresh fails
 */
export class SessionRefreshError extends Error {
  originalError?: Error;
  
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'SessionRefreshError';
    this.originalError = originalError;
  }
}

/**
 * Generic authentication error for non-specific auth failures
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

