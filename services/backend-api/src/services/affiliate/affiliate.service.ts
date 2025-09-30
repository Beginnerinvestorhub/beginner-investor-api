import { PrismaClient } from '@prisma/client';
import { Service } from '../base.service';

export interface ReferralData {
  referrerId: string;
  referredEmail: string;
  campaign?: string;
}

export interface Commission {
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  referralId: string;
}

export class AffiliateService extends Service {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  async createReferral(data: ReferralData) {
    return this.prisma.referral.create({
      data: {
        referrer: { connect: { id: data.referrerId } },
        referredEmail: data.referredEmail,
        campaign: data.campaign,
        status: 'PENDING'
      }
    });
  }

  async recordConversion(referralId: string) {
    return this.prisma.referral.update({
      where: { id: referralId },
      data: { status: 'CONVERTED' }
    });
  }

  async generateAffiliateLink(userId: string, campaign?: string) {
    const baseUrl = process.env.APP_URL || 'https://beginnerinvestorhub.com';
    const params = new URLSearchParams({
      ref: userId,
      ...(campaign && { campaign })
    });
    
    return `${baseUrl}/signup?${params.toString()}`;
  }

  async getReferrals(userId: string) {
    return this.prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async calculateCommissions(userId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: {
        referrerId: userId,
        status: 'CONVERTED',
        commissionPaid: false
      },
      include: {
        // Assuming there's a related subscription or purchase
        subscription: true
      }
    });

    // Calculate commissions based on your business logic
    const commissionRate = 0.1; // 10% commission
    const commissions = referrals.map(referral => ({
      amount: (referral.subscription?.amount || 0) * commissionRate,
      currency: 'USD',
      status: 'pending' as const,
      referralId: referral.id
    }));

    return commissions;
  }

  async trackAffiliateVisit(referrerId: string, ipAddress: string, userAgent: string) {
    return this.prisma.affiliateVisit.create({
      data: {
        referrer: { connect: { id: referrerId } },
        ipAddress,
        userAgent,
        timestamp: new Date()
      }
    });
  }
}

export const affiliateService = new AffiliateService();
