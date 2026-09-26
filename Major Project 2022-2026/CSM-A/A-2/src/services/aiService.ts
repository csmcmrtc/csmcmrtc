import { AIAssessment } from '../types';
import { api } from './api';
import * as mobilenet from '@tensorflow-models/mobilenet';

// Mock AI service to simulate computer vision and OCR capabilities
class AIService {
  private model: mobilenet.MobileNet | null = null;

  // Load the MobileNet model once
  async loadModel() {
    if (!this.model) {
      this.model = await mobilenet.load();
    }
  }

  async assessFoodQuality(imageUrl: string, category: string): Promise<AIAssessment> {
    await this.loadModel(); // Ensure model is ready
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI delay

    // Create an <img> element for TF.js
    const img = document.createElement("img");
    img.crossOrigin = "anonymous"; // prevent CORS issues
    img.src = imageUrl;

    // Wait until the image is loaded
    await new Promise(resolve => {
      img.onload = resolve;
    });

    // Run prediction
    const predictions = await this.model!.classify(img);
    console.log("AI Predictions:", predictions);

    // Default score baseline
    let baseScore = 7 + Math.random() * 3;

    // Check labels for "fresh" or "spoiled" indicators
    const labels = predictions.map(p => p.className.toLowerCase());

    if (labels.some(l => l.includes("fresh") || l.includes("fruit") || l.includes("vegetable"))) {
      baseScore += 0.5;
    }
    if (labels.some(l => l.includes("mold") || l.includes("rotten") || l.includes("decay"))) {
      baseScore -= 2;
    }

    // Category-based adjustment
    if (category === 'cooked') baseScore -= 0.5;
    if (category === 'raw') baseScore += 0.3;
    if (category === 'packaged') baseScore += 0.2;

    // Clamp score
    baseScore = Math.max(1, Math.min(10, baseScore));

    // Map to quality labels
    const quality =
      baseScore > 8.5 ? 'excellent' :
      baseScore > 7.5 ? 'good' :
      baseScore > 6.5 ? 'fair' : 'poor';

    // Expiry tied to freshness
    const daysToExpiry =
      quality === 'excellent' ? 5 :
      quality === 'good' ? 3 :
      quality === 'fair' ? 1 : 0;

    return {
      qualityScore: Math.round(baseScore * 10) / 10,
      freshness: quality,
      safetyRating: Math.round((baseScore + Math.random()) * 10) / 10,
      expiryExtracted: new Date(Date.now() + 86400000 * daysToExpiry)
        .toISOString()
        .split('T')[0],
      recommendations: this.generateRecommendations(category, quality),
      approved: baseScore >= 6.0,
    };
  }

  private generateRecommendations(category: string, quality: string): string[] {
    const recommendations: string[] = [];
    
    if (category === 'cooked') {
      recommendations.push('Consume within 4 hours');
      recommendations.push('Keep at room temperature');
    } else if (category === 'raw') {
      recommendations.push('Store in refrigerator');
      recommendations.push('Check for spoilage before distribution');
    } else {
      recommendations.push('Check packaging integrity');
      recommendations.push('Verify expiry date');
    }

    if (quality === 'fair' || quality === 'poor') {
      recommendations.push('Requires immediate distribution');
      recommendations.push('Additional quality check recommended');
    }

    return recommendations;
  }

  async generateChatResponse(message: string, context: any): Promise<string> {
    // Simulate chatbot processing
    await new Promise((resolve) => setTimeout(resolve, 700));

    const lower = (message ?? '').toLowerCase().trim();
    const ctx = context ?? {};
    const currentUser = ctx.user ?? ctx?.context?.user;
    const lastOrderId = (ctx.lastOrderId as string | undefined) ?? undefined;

    const hasDonationContext = /(donation|donate|donor|beneficiary|pending|review|approved|rejected|in transit|in_transit|delivered|expiry|expires|expiry date|expire|quantity|pickup)/i.test(lower);
    const wantsDonationDetails = /(details|information|expiry|expires|quantity|pickup location|pickup time|pickup point|assigned|beneficiary|category)/i.test(lower);
    const wantsDonationStatus = /(status|approved|pending|review|rejected|in transit|in_transit|delivered)/i.test(lower);

    const extractDonationId = (text: string): string | undefined => {
      // Examples user might type:
      // - "donation #12"
      // - "donation id 5"
      // - "don 7"
      const match =
        text.match(/(?:donation|don)\s*(?:#|id)?\s*(\d{1,})\b/i) ||
        text.match(/\b(?:donation|don)\s*(\d{1,})\b/i);
      return match?.[1]?.toString();
    };

    const canExtractDonationId = /(donation|don)\b/i.test(lower);
    const donationId = canExtractDonationId ? extractDonationId(lower) : undefined;

    const mapDonationStatus = (status: string): string => {
      switch (status) {
        case 'pending':
          return 'Pending approval';
        case 'review':
          return 'In review';
        case 'approved':
          return 'Approved';
        case 'rejected':
          return 'Rejected';
        case 'in_transit':
          return 'Pickup in progress (in transit)';
        case 'delivered':
          return 'Delivered';
        default:
          return status;
      }
    };

    const formatDonationDetails = (donation: any, beneficiaryName?: string): string => {
      const assessment = donation.aiAssessment ?? undefined;
      const assignedText = donation.assignedBeneficiary
        ? (beneficiaryName ? `${beneficiaryName} (ID: ${donation.assignedBeneficiary})` : `ID: ${donation.assignedBeneficiary}`)
        : 'Not assigned';

      const lines: string[] = [
        `Donation Details`,
        `Donation ID: ${donation.id}`,
        `Title: ${donation.title}`,
        `Status: ${mapDonationStatus(donation.status)} (${donation.status})`,
        `Category: ${donation.category}`,
        `Quantity: ${donation.quantity}`,
        `Expiry Date: ${donation.expiryDate}`,
        `Pickup Location: ${donation.pickupLocation}`,
        `Assigned Beneficiary: ${assignedText}`,
      ];

      if (assessment) {
        lines.push(
          ``,
          `AI Quality Assessment:`,
          `- Quality Score: ${assessment.qualityScore}`,
          `- Freshness: ${assessment.freshness}`,
          `- Safety Rating: ${assessment.safetyRating}`,
          `- Approved by AI: ${assessment.approved ? 'Yes' : 'No'}`
        );

        if (assessment.expiryExtracted) {
          lines.push(`- AI Extracted Expiry: ${assessment.expiryExtracted}`);
        }

        if (Array.isArray(assessment.recommendations) && assessment.recommendations.length) {
          lines.push(`- Recommendations:`);
          lines.push(...assessment.recommendations.slice(0, 5).map((r: string) => `  • ${r}`));
        }
      }

      return lines.join('\n');
    };

    // ---- Donation-aware responses (real data from backend) ----
    if (donationId) {
      try {
        const donation = await api.getDonationById(donationId);
        if (donation) {
          let beneficiaryName: string | undefined;
          if (donation.assignedBeneficiary) {
            try {
              const orgs = await api.getOrganizations();
              const org = orgs.find((o: any) => String(o.id) === String(donation.assignedBeneficiary));
              beneficiaryName = org?.name;
            } catch {
              // Non-fatal: still return the details even if we can't resolve org name.
            }
          }
          return formatDonationDetails(donation, beneficiaryName);
        }
        return `I couldn't find a donation with ID ${donationId}. If you share the donation title or try another ID, I’ll help.`;
      } catch (error) {
        console.error('Failed to fetch donation by id:', error);
        return 'Sorry, I could not fetch that donation right now. Please try again.';
      }
    }

    // If they ask for their donation status/details, show the latest donation(s)
    if (currentUser?.id && hasDonationContext && (wantsDonationStatus || wantsDonationDetails)) {
      try {
        const donations = await api.getDonationsByDonor(String(currentUser.id));
        if (!donations?.length) {
          return `You don’t have any donations found yet. You can create a new donation from the “New Donation” tab.`;
        }

        const wantsList = /(my\s+donations|list|all|show all)/i.test(lower);
        const top = wantsList ? donations.slice(0, 3) : donations.slice(0, 1);

        if (wantsList) {
          const summaryLines = top.map((d: any) => {
            const statusText = mapDonationStatus(d.status);
            return `• ${d.id}: ${d.title} — ${statusText}`;
          });
          return [
            `Here are your latest donations:`,
            ...summaryLines,
            ``,
            `Reply with “donation #<id>” to see full details.`,
          ].join('\n');
        }

        return formatDonationDetails(donations[0], undefined);
      } catch (error) {
        console.error('Failed to fetch donations for donor:', error);
        return 'Sorry, I could not fetch your donations right now. Please try again.';
      }
    }

    const extractOrderId = (text: string): string | undefined => {
      // Common formats:
      // - "Order #12345"
      // - "order 12345"
      // - "OD-12345"
      const match =
        text.match(/(?:order\s*#?\s*|od[-\s]?)\s*([a-zA-Z]{0,3}\d{3,})/i) ||
        text.match(/\b([a-zA-Z]{0,3}\d{3,})\b/);
      const id = match?.[1];
      return id ? id.toString().trim() : undefined;
    };

    const hashString = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return h;
    };

    const orderId = extractOrderId(message) ?? lastOrderId;

    const intent = (() => {
      if (/(track|where|status|eta|out for delivery|delivery partner|partner|driver)/i.test(lower)) return 'order_status';
      if (/(cancel|cancellation|remove|change order)/i.test(lower)) return 'cancel_order';
      if (/(refund|reimburse|chargeback)/i.test(lower)) return 'refunds';
      if (/(payment|paid|upi|card|cash on delivery)/i.test(lower)) return 'payment';
      if (/(menu|suggest|recommend|food i want|what should i eat|something to eat|recommendations)/i.test(lower)) return 'menu';
      if (
        /(donation|donate|how\s+to\s+donate|donation\s+process|how\s+does\s+it\s+work|i\s+want\s+to\s+donate|food\s+donation)/i.test(lower)
      ) return 'donation_help';
      if (/(quality|fresh|spoiled|ai|tensorflow|score)/i.test(lower)) return 'quality_help';
      if (/(pickup|pickup time|pickup location|collection)/i.test(lower)) return 'pickup_help';
      if (/(help|support|how do i|what can you do)/i.test(lower)) return 'help';
      return 'general';
    })();

    const simulateTracking = (id: string) => {
      const h = hashString(id);
      // Pick a stage based on hash; keeps it deterministic per order id.
      const stageIdx = h % 4;
      const stages = [
        {
          status: 'Order confirmed',
          detail: 'We’ve received your order. Preparing it now.',
          etaMinRange: [20, 35] as [number, number],
          partner: 'GreenLine Courier',
          partnerPhone: '+91 9XXXX XXXXX',
          partnerVehicle: 'Bike',
        },
        {
          status: 'Out for delivery',
          detail: 'Your delivery partner has picked up the order.',
          etaMinRange: [10, 20] as [number, number],
          partner: 'SwiftNest Delivery',
          partnerPhone: '+91 8XXXX XXXXX',
          partnerVehicle: 'Scooter',
        },
        {
          status: 'Preparing',
          detail: 'Restaurant is cooking/preparing your food.',
          etaMinRange: [15, 25] as [number, number],
          partner: 'GreenWave Logistics',
          partnerPhone: '+91 7XXXX XXXXX',
          partnerVehicle: 'Van',
        },
        {
          status: 'Delivered',
          detail: 'Delivered successfully. Enjoy your meal!',
          etaMinRange: [0, 5] as [number, number],
          partner: 'QuickCart Partners',
          partnerPhone: '+91 6XXXX XXXXX',
          partnerVehicle: 'Bike',
        },
      ];

      const stage = stages[stageIdx];
      const [minEta, maxEta] = stage.etaMinRange;
      const etaMinutes = minEta + (h % Math.max(1, maxEta - minEta + 1));
      const etaTime = new Date(Date.now() + etaMinutes * 60_000);

      return {
        status: stage.status,
        etaMinutes,
        etaTime: etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        partner: stage.partner,
        partnerPhone: stage.partnerPhone,
        partnerVehicle: stage.partnerVehicle,
        detail: stage.detail,
      };
    };

    const menuItems = [
      { name: 'Veggie Wrap', price: '₹129', tags: ['veg'], desc: 'Crispy veggies wrapped with a tangy sauce.' },
      { name: 'Paneer Tikka Bowl', price: '₹199', tags: ['veg'], desc: 'Char-grilled paneer with rice and fresh salad.' },
      { name: 'Masala Dosa', price: '₹149', tags: ['veg'], desc: 'Classic dosa with sambar and coconut chutney.' },
      { name: 'Chicken Alfredo Pasta', price: '₹279', tags: ['non-veg'], desc: 'Creamy Alfredo sauce with tender chicken.' },
      { name: 'Spicy Spring Rolls', price: '₹159', tags: ['veg', 'snack'], desc: 'Crispy rolls with a spicy dipping sauce.' },
      { name: 'Dal Khichdi (Comfort)', price: '₹139', tags: ['veg', 'comfort'], desc: 'Warm, hearty khichdi with ghee aroma.' },
    ];

    const respondDonationOrPlatform = () => {
      const responses = {
        donation:
          "To donate, open “New Donation” (or “Bulk Donation”), fill in the details, and upload photos of the food items. Our system will help assess quality and guide the pickup process. You can ask me about donation status/details using your Donation ID (example: “donation #3”).",
        status:
          "Donation status meanings:\n• `pending` = awaiting approval\n• `review` = being reviewed\n• `approved` = approved and ready for pickup matching\n• `rejected` = not accepted\n• `in_transit` = pickup is in progress\n• `delivered` = donation completed",
        quality:
          'Our AI uses computer vision to estimate food quality/freshness and generate safety recommendations (quality score 1–10).',
        pickup:
          "Pickup process: once your donation is approved, we match you with nearby beneficiaries and coordinate pickup time/location. Your donation status will update as pickup moves from approval to in_transit to delivered.",
        expiry:
          "Expiry/safety: each donation has an `expiryDate` in the system. If AI assessment exists, it may include an `expiryExtracted` date plus freshness/quality recommendations. If you ask, I can show the expiry date for your specific donation.",
        quantity:
          "Quantity: each donation record includes a `quantity` value (how much you’re donating). If you ask for donation details, I’ll show the quantity along with category, expiry, and pickup location.",
        eligibility:
          "General donation guidance: try to donate food that is fresh/within expiry, properly stored, and suitable for pickup/transfer. If you’re unsure, ask me about the donation quality assessment or how to interpret expiry/safety recommendations.",
        help:
          "I’m here to assist you with food donations and delivery/pickup coordination. Ask me about donations, quality assessment, pickup times/locations, or anything else.",
      };

      // Keyword-based FAQ handling (works even when the user doesn't type “donation”)
      if (/(how\s+to\s+donate|donation\s+process|how\s+does\s+it\s+work|start\s+donating)/i.test(lower)) {
        return responses.donation;
      }
      if (/(pending|review|approved|rejected)\b|status meaning|what does.*status/i.test(lower)) {
        return responses.status;
      }
      if (/(expiry|expires|expiry date|expire|expired)/i.test(lower)) {
        return responses.expiry;
      }
      if (/(quantity|how many|number of items|items count)/i.test(lower)) {
        return responses.quantity;
      }
      if (/(who can donate|eligib|requirements|documents|prove)/i.test(lower)) {
        return responses.eligibility;
      }

      if (intent === 'donation_help') return responses.donation;
      if (intent === 'quality_help') return responses.quality;
      if (intent === 'pickup_help') return responses.pickup;
      if (intent === 'help') return responses.help;

      return "Tell me what you need help with: donation process, donation status meanings, quality assessment, expiry/safety, quantity, or pickup coordination.";
    };

    // ---- Order status & process intents ----
    if (intent === 'order_status') {
      if (!orderId) {
        return "Sure—please share your order number (example: “Order #12345”) and I’ll tell you the ETA and delivery partner details.";
      }

      const tracking = simulateTracking(orderId);
      // If user specifically asks ETA, respond tighter; otherwise include full tracking.
      if (/(eta|when|how long|time)/i.test(lower)) {
        return `Your order ${orderId} is currently: ${tracking.status}. Estimated delivery time: ${tracking.etaTime} (${tracking.etaMinutes} min). Courier: ${tracking.partner}.`;
      }

      return `Tracking for order ${orderId}: ${tracking.status}.\n\n${tracking.detail}\nETA: ${tracking.etaTime} (${tracking.etaMinutes} min).\nDelivery partner: ${tracking.partner} (${tracking.partnerVehicle}).`;
    }

    if (intent === 'cancel_order') {
      if (!orderId) {
        return "I can help with cancellation. Please share your order number (example: “Order #12345”).";
      }

      const tracking = simulateTracking(orderId);
      if (tracking.status === 'Delivered') {
        return `Order ${orderId} is already delivered, so cancellation isn’t possible. If you want a refund, tell me “Refunds for order ${orderId}”.`;
      }

      // For non-delivered, we simulate "possible" cancellation
      return `Cancellation request for order ${orderId}: ${tracking.status}.\n\nIf the order hasn’t been handed over to the courier yet, we can cancel it. Reply “Confirm cancel ${orderId}” to proceed, or tell me what stage it’s in (ETA/partner) and I’ll guide you.`;
    }

    if (intent === 'refunds') {
      if (!orderId) {
        return 'I can help with refunds. Please share your order number so I can check the refund flow.';
      }

      const tracking = simulateTracking(orderId);

      return `Refunds for order ${orderId}:\n\n• If the order was cancelled before dispatch: refund is typically processed immediately (as per payment method).\n• If it was delivered: refund/adjustments depend on the issue and are usually processed within 3–5 business days.\n\nCurrent stage: ${tracking.status}. If you share the reason (wrong item, not received, quality issue), I’ll tell you the next step.`;
    }

    if (intent === 'payment') {
      return 'Payment help: You can pay via UPI/card/cash (as available). If your payment failed, please try once more and share the order number. I can also help you with cancellation/refund steps if needed.';
    }

    // ---- Menu intents ----
    if (intent === 'menu') {
      const isVeg = /(veg|vegetarian)/i.test(lower);
      const isNonVeg = /(non.?veg|chicken|egg|mutton|fish)/i.test(lower);

      let pool = menuItems;
      if (isVeg) pool = pool.filter((i) => i.tags.includes('veg'));
      if (isNonVeg) pool = pool.filter((i) => i.tags.includes('non-veg'));
      if (pool.length === 0) pool = menuItems;

      const pick = (pool.length ? pool[hashString(lower) % pool.length] : menuItems[0]) as any;
      const alt = pool.length > 1 ? pool[(hashString(lower) + 1) % pool.length] : pick;

      return `Here are a couple of picks based on your request:\n\n1) ${pick.name} (${pick.price}) — ${pick.desc}\n2) ${alt.name} (${alt.price}) — ${alt.desc}\n\nWant something spicy, quick, or a specific diet (veg/non-veg)?`;
    }

    // Donation/help intents for your existing app
    if (
      intent === 'donation_help' ||
      intent === 'quality_help' ||
      intent === 'pickup_help' ||
      intent === 'help'
    ) {
      return respondDonationOrPlatform();
    }

    // ---- Default helpful response ----
    if (/(hello|hi|hey|good morning|good afternoon)/i.test(lower)) {
      return `Hi ${context?.user?.name ?? ''}! I can help with donation questions like:\n• Donation status (pending/review/approved/in transit/delivered)\n• Donation details (expiry date, quantity, pickup location)\n• How food quality is assessed\n• Pickup process after approval\n\nTry: “my donation status” or “donation #<id>”.`;
    }

    return 'I can help with donation status and donation details (expiry date, quantity, pickup location) and also answer donation process questions. Try “my donation status” or “donation #<id>”.';
  }
}

export const aiService = new AIService();
