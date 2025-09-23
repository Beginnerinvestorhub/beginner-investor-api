import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';
import { logger } from '../utils/logger';

/**
 * Middleware to authenticate service-to-service requests
 * Uses HMAC-SHA256 for request signing
 */
class ServiceAuth {
  private static instance: ServiceAuth;
  private secret: string;
  private algorithm = 'sha256';
  private encoding: BufferEncoding = 'hex';
  private headerName = 'x-service-signature';
  private timestampHeader = 'x-service-timestamp';
  private maxTimeDiff = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.secret = process.env.SERVICE_AUTH_SECRET || 'default-secret';
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
  public verify() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const signature = req.header(this.headerName);
        const timestamp = req.header(this.timestampHeader);

        // Check if required headers are present
        if (!signature || !timestamp) {
          logger.warn('Missing required headers for service authentication');
          return res.status(401).json({ error: 'Missing authentication headers' });
        }

        // Validate timestamp
        if (!this.validateTimestamp(timestamp)) {
          logger.warn('Invalid timestamp in service request');
          return res.status(401).json({ error: 'Request expired' });
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
          return res.status(401).json({ error: 'Invalid signature' });
        }

        // Authentication successful
        next();
      } catch (error) {
        logger.error('Service authentication error:', error);
        return res.status(500).json({ error: 'Authentication error' });
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
   * Middleware to sign outgoing service requests
   */
  public signOutgoingRequest(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    
    // Override the response send method to sign the response
    res.send = (body?: any): Response => {
      if (body) {
        const { signature, timestamp } = this.signRequest(body);
        res.setHeader(this.headerName, signature);
        res.setHeader(this.timestampHeader, timestamp);
      }
      return originalSend.call(res, body);
    };

    next();
  }
}

// Create a singleton instance
const serviceAuth = ServiceAuth.getInstance();

export { serviceAuth };
