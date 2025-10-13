import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import {
  requireAffiliateAccess,
  trackAffiliate,
} from "../middleware/affiliate.middleware";
import { affiliateService } from "../services/affiliate/affiliate.service";

const router = Router();

// Track affiliate visits (should be used as middleware on public routes)
router.get("/track", trackAffiliate, (req, res) => {
  res.json({ success: true });
});

// Apply to become an affiliate
router.post("/apply", requireAuth, async (req, res) => {
  try {
    // @ts-ignore - user is attached to request by auth middleware
    const userId = req.user.id;

    // In a real implementation, you would:
    // 1. Validate user can become an affiliate
    // 2. Create affiliate account
    // 3. Send for approval if needed

    res.json({
      success: true,
      message: "Affiliate application received",
      // Include generated affiliate link
      affiliateLink: await affiliateService.generateAffiliateLink(userId),
    });
  } catch (error) {
    console.error("Affiliate application failed:", error);
    res.status(500).json({ error: "Failed to process affiliate application" });
  }
});

// Get affiliate dashboard data
router.get(
  "/dashboard",
  requireAuth,
  requireAffiliateAccess,
  async (req, res) => {
    try {
      // @ts-ignore - user is attached to request by auth middleware
      const userId = req.user.id;

      const [referrals, commissions] = await Promise.all([
        affiliateService.getReferrals(userId),
        affiliateService.calculateCommissions(userId),
      ]);

      const totalEarnings = commissions
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.amount, 0);

      const pendingEarnings = commissions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0);

      res.json({
        referrals,
        commissions,
        stats: {
          totalReferrals: referrals.length,
          convertedReferrals: referrals.filter((r) => r.status === "CONVERTED")
            .length,
          conversionRate:
            referrals.length > 0
              ? (referrals.filter((r) => r.status === "CONVERTED").length /
                  referrals.length) *
                100
              : 0,
          totalEarnings,
          pendingEarnings,
          currency: "USD",
        },
        affiliateLink: await affiliateService.generateAffiliateLink(userId),
      });
    } catch (error) {
      console.error("Failed to get affiliate dashboard:", error);
      res.status(500).json({ error: "Failed to load affiliate dashboard" });
    }
  },
);

// Generate a new affiliate link with optional campaign
router.post(
  "/generate-link",
  requireAuth,
  requireAffiliateAccess,
  async (req, res) => {
    try {
      const { campaign } = req.body;
      // @ts-ignore - user is attached to request by auth middleware
      const userId = req.user.id;

      const link = await affiliateService.generateAffiliateLink(
        userId,
        campaign,
      );

      res.json({
        success: true,
        link,
        campaign,
      });
    } catch (error) {
      console.error("Failed to generate affiliate link:", error);
      res.status(500).json({ error: "Failed to generate affiliate link" });
    }
  },
);

// Get referral history
router.get(
  "/referrals",
  requireAuth,
  requireAffiliateAccess,
  async (req, res) => {
    try {
      // @ts-ignore - user is attached to request by auth middleware
      const userId = req.user.id;
      const referrals = await affiliateService.getReferrals(userId);

      res.json({
        success: true,
        referrals,
      });
    } catch (error) {
      console.error("Failed to get referrals:", error);
      res.status(500).json({ error: "Failed to get referral history" });
    }
  },
);

export default router;
