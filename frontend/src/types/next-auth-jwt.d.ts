// Type definitions for next-auth/jwt
declare module 'next-auth/jwt' {
  /**
   * The shape of the JWT object returned by the `jwt` callback
   * when using JWT sessions
   */
  interface JWT {
    /** OpenID ID Token */
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;

    // Custom fields
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  /**
   * The JWT decode function
   */
  export function decode(params: {
    token?: string;
    secret: string | Buffer;
  }): JWT | null;

  /**
   * The JWT encode function
   */
  export function encode(params: {
    token?: JWT;
    secret: string | Buffer;
  }): Promise<string>;

  /**
   * The JWT verify function
   */
  export function verify(token: string, secret: string | Buffer): Promise<JWT>;

  /**
   * The JWT sign function
   */
  export function sign(
    payload: string | object | Buffer,
    secret: string | Buffer,
    options?: {
      algorithm?: string;
      keyid?: string;
      mutatePayload?: boolean;
      allowInsecureKeySizes?: boolean;
      allowInvalidAsymmetricKeyTypes?: boolean;
      expiresIn?: string | number;
      notBefore?: string | number;
      audience?: string | string[];
      issuer?: string;
      jwtid?: string;
      subject?: string;
      noTimestamp?: boolean;
      header?: object;
      encoding?: string;
    }
  ): string;
}
