import { PrismaClient } from "@prisma/client";
// Assuming BaseService is a default export
import BaseService from "../base.service";

// --- INTERFACES ---

export interface ReferralData {
  referrerId: string;
  referredEmail: string;
  campaign?: string;
}

export interface CommissionSummary {
  amount: number;
  currency: string;
  status: "pending" | "approved" | "paid" | "rejected";
  referralId: string;
}

// --- SERVICE CLASS ---

export class AffiliateService extends BaseService {
  private static instance: AffiliateService;
  private prisma: PrismaClient;

  private constructor() {
    super(300); // Cache TTL = 5 minutes
    this.prisma = new PrismaClient();
  }

  public static getInstance(): AffiliateService {
    if (!AffiliateService.instance) {
      AffiliateService.instance = new AffiliateService();
    }
    return AffiliateService.instance;
  }

  /**
   * Creates a new referral record when a user refers someone.
   */
  async createReferral(data: ReferralData) {
    return this.prisma.referral.create({
      data: {
        referrer: { connect: { id: data.referrerId } },
        referredEmail: data.referredEmail,
        campaign: data.campaign,
        status: "PENDING",
      },
    });
  }

  /**
   * Marks a referral record as converted (e.g., when the referred user signs up/purchases).
   */
  async recordConversion(referralId: string) {
    return this.prisma.referral.update({
      where: { id: referralId },
      data: { status: "CONVERTED" },
    });
  }

  /**
   * Generates a unique affiliate link for a user and campaign.
   */
  async generateAffiliateLink(userId: string, campaign?: string) {
    const baseUrl = process.env.APP_URL || "https://beginnerinvestorhub.com";
    const params = new URLSearchParams({
      ref: userId,
      ...(campaign ? { campaign } : {}),
    });

    return `${baseUrl}/signup?${params.toString()}`;
  }

  /**
   * Retrieves all referrals associated with a specific user.
   */
  async getReferrals(userId: string) {
    return this.prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Calculates commissions for all converted referrals that have associated purchases.
   */
  async calculateCommissions(userId: string): Promise<CommissionSummary[]> {
    const referrals = await this.prisma.referral.findMany({
      where: {
        referrerId: userId,
        status: "CONVERTED",
        commissionPaid: false,
      },
      include: {
        subscription: true, // Assumes your Referral model has a subscription relation
      },
    });

    const commissionRate = 0.1; // 10% commission

    const commissions: CommissionSummary[] = referrals
      .filter((r) => r.subscription && r.subscription.amount > 0)
      .map((referral) => ({
        amount: referral.subscription!.amount * commissionRate,
        currency: "USD",
        status: "pending",
        referralId: referral.id,
      }));

    return commissions;
  }

  /**
   * Tracks an affiliate link visit for analytics and fraud detection.
   */
  async trackAffiliateVisit(
    referrerId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    return this.prisma.affiliateVisit.create({
      data: {
        referrer: { connect: { id: referrerId } },
        ipAddress,
        userAgent,
        timestamp: new Date(),
      },
    });
  }
}

export const affiliateService = AffiliateService.getInstance();
