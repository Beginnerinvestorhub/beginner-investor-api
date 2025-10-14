import { randomBytes, createHmac } from 'crypto';

/**
 * Comprehensive secret and key generation utilities for the application
 */
export class SecretGenerator {
  /**
   * Generate a cryptographically secure JWT secret
   * @param length - Length in bytes (default: 64 for 128 hex characters)
   */
  static generateJWT(length: number = 64): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure cookie secret
   * @param length - Length in bytes (default: 32 for 64 hex characters)
   */
  static generateCookieSecret(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a service authentication secret for inter-service communication
   * @param length - Length in bytes (default: 64 for 128 hex characters)
   */
  static generateServiceAuthSecret(length: number = 64): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate an API key with optional prefix
   * @param prefix - Optional prefix (default: 'bi_' for Beginner Investor)
   * @param length - Random part length in bytes (default: 16 for 32 hex characters)
   */
  static generateAPIKey(prefix: string = 'bi_', length: number = 16): string {
    const random = randomBytes(length).toString('hex');
    return `${prefix}${random}`;
  }

  /**
   * Generate a secure random token for various purposes
   * @param length - Length in bytes (default: 32)
   */
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a database encryption key (for sensitive data encryption)
   * @param length - Length in bytes (default: 32 for Fernet compatibility)
   */
  static generateEncryptionKey(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure password hash salt
   * @param length - Length in bytes (default: 16 for 32 hex characters)
   */
  static generateSalt(length: number = 16): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a webhook secret for external integrations
   * @param length - Length in bytes (default: 32 for 64 hex characters)
   */
  static generateWebhookSecret(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate all required secrets for a new deployment
   */
  static generateAllSecrets(): {
    jwtSecret: string;
    cookieSecret: string;
    serviceAuthSecret: string;
    databaseEncryptionKey: string;
    apiKeys: {
      marketData: string;
      finnhub: string;
      alphaVantage: string;
    };
  } {
    return {
      jwtSecret: this.generateJWT(),
      cookieSecret: this.generateCookieSecret(),
      serviceAuthSecret: this.generateServiceAuthSecret(),
      databaseEncryptionKey: this.generateEncryptionKey(),
      apiKeys: {
        marketData: this.generateAPIKey('md_'),
        finnhub: this.generateAPIKey('fh_'),
        alphaVantage: this.generateAPIKey('av_'),
      },
    };
  }

  /**
   * Validate the strength of a secret
   */
  static validateSecretStrength(secret: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    // Length check
    if (secret.length < 32) {
      issues.push('Secret is too short (minimum 32 characters)');
    } else if (secret.length >= 64) {
      score += 25;
    } else if (secret.length >= 32) {
      score += 15;
    }

    // Character diversity check
    const hasLower = /[a-z]/.test(secret);
    const hasUpper = /[A-Z]/.test(secret);
    const hasNumbers = /[0-9]/.test(secret);
    const hasSpecial = /[^a-zA-Z0-9]/.test(secret);

    const diversityCount = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length;

    if (diversityCount >= 3) {
      score += 25;
    } else if (diversityCount >= 2) {
      score += 15;
    } else {
      issues.push('Secret lacks character diversity');
    }

    // Entropy check (basic)
    const uniqueChars = new Set(secret.split('')).size;
    if (uniqueChars > 16) {
      score += 25;
    } else if (uniqueChars > 8) {
      score += 15;
    } else {
      issues.push('Secret has low entropy');
    }

    // Common patterns check
    const commonPatterns = ['123456', 'password', 'qwerty', 'admin', 'secret'];
    if (commonPatterns.some((pattern) => secret.toLowerCase().includes(pattern))) {
      issues.push('Secret contains common patterns');
      score -= 20;
    }

    // Dictionary words check (basic)
    const dictionaryWords = ['password', 'secret', 'key', 'token', 'auth'];
    if (dictionaryWords.some((word) => secret.toLowerCase().includes(word))) {
      issues.push('Secret contains dictionary words');
      score -= 10;
    }

    return {
      isValid: issues.length === 0 && score >= 50,
      score: Math.max(0, Math.min(100, score)),
      issues,
    };
  }

  /**
   * Generate a HMAC signature for data integrity verification
   */
  static createSignature(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify a HMAC signature
   */
  static verifySignature(data: string, signature: string, secret: string): boolean {
    const expected = this.createSignature(data, secret);
    return signature === expected;
  }
}

/**
 * Utility functions for environment variable validation
 */
export class SecretValidator {
  /**
   * Validate that all required secrets are present and strong
   */
  static validateEnvironmentSecrets(): {
    isValid: boolean;
    missing: string[];
    weak: Array<{ key: string; issues: string[] }>;
  } {
    const requiredSecrets = [
      'JWT_SECRET',
      'COOKIE_SECRET',
      'SERVICE_AUTH_SECRET',
      'DATABASE_ENCRYPTION_KEY',
    ];

    const missing: string[] = [];
    const weak: Array<{ key: string; issues: string[] }> = [];

    for (const secretKey of requiredSecrets) {
      const secret = process.env[secretKey];

      if (!secret) {
        missing.push(secretKey);
        continue;
      }

      const validation = SecretGenerator.validateSecretStrength(secret);
      if (!validation.isValid) {
        weak.push({ key: secretKey, issues: validation.issues });
      }
    }

    return {
      isValid: missing.length === 0 && weak.length === 0,
      missing,
      weak,
    };
  }

  /**
   * Get environment secret status for logging
   */
  static getSecretStatus(): Array<{
    key: string;
    present: boolean;
    strength?: 'weak' | 'medium' | 'strong';
  }> {
    const secrets = [
      'JWT_SECRET',
      'COOKIE_SECRET',
      'SERVICE_AUTH_SECRET',
      'DATABASE_ENCRYPTION_KEY',
    ];

    return secrets.map((key) => {
      const secret = process.env[key];
      const present = !!secret;

      if (!present) {
        return { key, present: false };
      }

      const validation = SecretGenerator.validateSecretStrength(secret);
      let strength: 'weak' | 'medium' | 'strong' = 'weak';

      if (validation.score >= 75) {
        strength = 'strong';
      } else if (validation.score >= 50) {
        strength = 'medium';
      }

      return { key, present: true, strength };
    });
  }
}
