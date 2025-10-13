import type { Request, Response, NextFunction } from "express";
import { affiliateService } from "../services/affiliate/affiliate.service";
import { SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    referrerId?: string;
    campaign?: string;
  }
}

export const trackAffiliate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check for referral code in query params
  const referrerId = req.query.ref as string;
  const campaign = req.query.campaign as string;

  if (referrerId) {
    // Store referral in session or cookie
    if (req.session) {
      req.session.referrerId = referrerId;
      if (campaign) {
        req.session.campaign = campaign;
      }
    }

    // Track the visit
    const ipAddress =
      req.ip || (req.connection && req.connection.remoteAddress) || "";
    const userAgent = req.headers["user-agent"] || "";

    affiliateService
      .trackAffiliateVisit(referrerId, ipAddress, userAgent)
      .catch((error) => {
        console.error("Failed to track affiliate visit:", error);
        // Don't fail the request if tracking fails
      });
  }

  next();
};

export const handleNewUserReferral = async (
  userId: string,
  email: string,
  req: Request,
) => {
  try {
    // Check if user was referred
    const referrerId = req.session?.referrerId;
    const campaign = req.session?.campaign;

    if (referrerId) {
      // Record the referral
      await affiliateService.createReferral({
        referrerId,
        referredEmail: email,
        campaign,
      });

      // Clear the referral from session
      if (req.session) {
        delete req.session.referrerId;
        delete req.session.campaign;
      }
    }
  } catch (error) {
    console.error("Error processing referral:", error);
    // Don't fail the user registration if referral processing fails
  }
};

export const requireAffiliateAccess = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // @ts-ignore - user is attached to request by auth middleware
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // In a real implementation, check if user has affiliate permissions
  // This is a simplified example
  const isAffiliate = true; // Replace with actual check

  if (!isAffiliate) {
    return res.status(403).json({
      error: "Affiliate program access required",
      applyUrl: "/affiliate/apply",
    });
  }

  next();
};
