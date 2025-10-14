import { Request, Response, NextFunction } from 'express';
import { createHmac, randomBytes } from 'crypto';
import { logger } from '../utils/logger';

/**
 * Middleware to authenticate service-to-service requests
 * Uses HMAC-SHA256 for request signing
 */
class ServiceAuth {
  private static instance: ServiceAuth;
  private secret: string;
  private algorithm = 'sha256';
  private encoding = 'hex' as const;
  private headerName = 'x-service-signature';
  private timestampHeader = 'x-service-timestamp';
  private maxTimeDiff = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Get secret from environment - required in production
    const secret = process.env.SERVICE_AUTH_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === 'development') {
        // Generate a temporary secret for development only
        this.secret = randomBytes(64).toString('hex');
        logger.warn('⚠️  Generated temporary service auth secret for development use only');
        logger.warn('🔧 Set SERVICE_AUTH_SECRET environment variable for production');
      } else {
        throw new Error('SERVICE_AUTH_SECRET is required in production environment');
      }
    } else {
      this.secret = secret;
    }

    // Validate secret strength
    if (this.secret.length < 64) {
      logger.warn('⚠️  SERVICE_AUTH_SECRET is shorter than recommended 128 characters');
    }
  }

  public static getInstance(): ServiceAuth {
    if (!ServiceAuth.instance) {
      ServiceAuth.instance = new ServiceAuth();
    }
    return ServiceAuth.instance;
  }

  /**
   * Generate a signature for the request
   */
  private generateSignature(timestamp: string, body: any): string {
    const hmac = createHmac(this.algorithm, this.secret);
    const data = `${timestamp}.${JSON.stringify(body)}`;
    return hmac.update(data).digest(this.encoding);
  }

  /**
   * Validate the request timestamp
   */
  private validateTimestamp(timestamp: string): boolean {
    try {
      const requestTime = new Date(timestamp).getTime();
      const currentTime = Date.now();
      return Math.abs(currentTime - requestTime) <= this.maxTimeDiff;
    } catch (error) {
      return false;
    }
  }

  /**
   * Middleware to verify service requests
   */
  public verify(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const signature = req.header(this.headerName);
        const timestamp = req.header(this.timestampHeader);

        // Check if required headers are present
        if (!signature || !timestamp) {
          logger.warn('Missing required headers for service authentication');
          res.status(401).json({ error: 'Missing authentication headers' });
          return;
        }

        // Validate timestamp
        if (!this.validateTimestamp(timestamp)) {
          logger.warn('Invalid timestamp in service request');
          res.status(401).json({ error: 'Request expired' });
          return;
        }

        // Clone and clean the request body for signature generation
        const body = { ...req.body };
        // Remove any sensitive fields that shouldn't be part of the signature
        delete body.signature;
        delete body[this.headerName.toLowerCase()];

        // Generate expected signature
        const expectedSignature = this.generateSignature(timestamp, body);

        // Compare signatures
        if (signature !== expectedSignature) {
          logger.warn('Invalid service request signature');
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }

        // Authentication successful
        next();
      } catch (error) {
        logger.error('Service authentication error:', error);
        res.status(500).json({ error: 'Authentication error' });
      }
    };
  }

  /**
   * Sign a request with the current timestamp and secret
   */
  public signRequest(body: any): { signature: string; timestamp: string } {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp, body);
    return { signature, timestamp };
  }

  /**
   * Get the current service auth secret (for debugging only)
   */
  public getSecretInfo(): { length: number; isProduction: boolean } {
    return {
      length: this.secret.length,
      isProduction: process.env.NODE_ENV === 'production',
    };
  }
}

// Create a singleton instance
const serviceAuth = ServiceAuth.getInstance();

export { serviceAuth };
