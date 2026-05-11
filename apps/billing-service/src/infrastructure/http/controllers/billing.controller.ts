import {
  Controller, Get, Post, Delete, Patch,
  Body, Param, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Subscription, PLANS, PlanId, BillingCycle } from '../../../domain/subscription/entities/subscription.entity';

// ─── In-memory store ──────────────────────────────────────────────────────────
const subscriptions = new Map<string, Subscription>(); // userId → subscription

function getOrCreateFree(userId: string): Subscription {
  if (!subscriptions.has(userId)) {
    subscriptions.set(userId, Subscription.createFree(userId));
  }
  return subscriptions.get(userId)!;
}

// ─── Controller ───────────────────────────────────────────────────────────────

@ApiTags('Billing / Subscriptions')
@ApiBearerAuth()
@Controller('v1/billing')
export class BillingController {

  // ─── Plans catalog ────────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'List all available subscription plans' })
  getPlans() {
    return Object.entries(PLANS).map(([id, plan]) => ({
      id,
      name: plan.name,
      pricing: {
        monthly: plan.priceBRL.monthly,
        annual: plan.priceBRL.annual,
        monthlyDisplay: plan.priceBRL.monthly === 0 ? 'Grátis' : `R$${(plan.priceBRL.monthly / 100).toFixed(2)}/mês`,
        annualDisplay: plan.priceBRL.annual === 0 ? 'Grátis' : `R$${(plan.priceBRL.annual / 100).toFixed(2)}/ano`,
        annualSavingPercent: plan.priceBRL.monthly > 0
          ? Math.round((1 - plan.priceBRL.annual / (plan.priceBRL.monthly * 12)) * 100)
          : 0,
      },
      features: plan.features,
    }));
  }

  // ─── Current subscription ─────────────────────────────────────────────

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription for the authenticated user' })
  getMine(@Headers('x-user-id') userId: string) {
    const sub = getOrCreateFree(userId);
    return {
      ...sub.toPlainObject(),
      plan: sub.plan,
      features: sub.features,
      priceDisplay: sub.priceDisplay,
      isActive: sub.isActive,
    };
  }

  // ─── Subscribe / Upgrade ──────────────────────────────────────────────

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe to or upgrade a plan' })
  subscribe(
    @Headers('x-user-id') userId: string,
    @Body() body: { planId: PlanId; billingCycle?: BillingCycle; paymentToken?: string },
  ) {
    const plan = PLANS[body.planId];
    if (!plan) return { statusCode: 400, message: `Unknown plan: ${body.planId}` };

    const cycle = body.billingCycle ?? 'monthly';
    const price = plan.priceBRL[cycle];

    let sub = subscriptions.get(userId);

    if (!sub) {
      // New subscriber — create trial for paid plans
      if (price > 0) {
        sub = Subscription.createTrial(userId, body.planId, 14);
      } else {
        sub = Subscription.createFree(userId);
      }
      subscriptions.set(userId, sub);
    } else {
      // Existing subscriber — upgrade/downgrade
      sub.upgrade(body.planId, cycle, price, `external-${Date.now()}`);
    }

    return {
      subscription: sub.toPlainObject(),
      features: sub.features,
      message: price === 0 ? 'Plano gratuito ativado' :
               sub.status === 'trialing' ? `Trial de 14 dias iniciado para o plano ${plan.name}` :
               `Upgraded para ${plan.name}`,
    };
  }

  // ─── Start trial ─────────────────────────────────────────────────────

  @Post('trial')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a 14-day trial for a paid plan' })
  startTrial(
    @Headers('x-user-id') userId: string,
    @Body() body: { planId: Exclude<PlanId, 'free' | 'enterprise'> },
  ) {
    if (subscriptions.has(userId)) {
      return { statusCode: 409, message: 'User already has a subscription' };
    }
    const sub = Subscription.createTrial(userId, body.planId, 14);
    subscriptions.set(userId, sub);
    return { subscription: sub.toPlainObject(), trialEndsAt: sub.trialEndsAt };
  }

  // ─── Cancel ───────────────────────────────────────────────────────────

  @Delete('subscription')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription at end of current period' })
  cancel(@Headers('x-user-id') userId: string) {
    const sub = subscriptions.get(userId);
    if (!sub) return { statusCode: 404, message: 'No active subscription' };
    sub.cancelAtEnd();
    return {
      message: 'Subscription will be cancelled at end of current period',
      cancelDate: sub.currentPeriodEnd,
    };
  }

  @Post('subscription/reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactivate a subscription scheduled for cancellation' })
  reactivate(@Headers('x-user-id') userId: string) {
    const sub = subscriptions.get(userId);
    if (!sub) return { statusCode: 404, message: 'No subscription found' };
    sub.reactivate();
    return { message: 'Subscription reactivated', status: sub.status };
  }

  // ─── Feature check (for other services to call) ───────────────────────

  @Get('features/:userId')
  @ApiOperation({ summary: 'Get features for a user (internal service call)' })
  getFeatures(@Param('userId') userId: string) {
    const sub = getOrCreateFree(userId);
    return {
      userId,
      planId: sub.planId,
      isActive: sub.isActive,
      features: sub.features,
    };
  }

  // ─── Webhook (from payment provider) ─────────────────────────────────

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment provider webhook handler (Stripe/Pagar.me)' })
  webhook(@Body() payload: Record<string, unknown>) {
    // In production: verify HMAC signature from payment provider
    const eventType = payload['type'] as string;

    if (eventType === 'invoice.payment_succeeded') {
      // Renew subscription
      const subId = (payload['data'] as any)?.subscription_id as string;
      for (const sub of subscriptions.values()) {
        if (sub.externalSubscriptionId === subId) {
          sub.renew(sub.priceAtPurchaseCentavos);
          break;
        }
      }
    } else if (eventType === 'invoice.payment_failed') {
      const subId = (payload['data'] as any)?.subscription_id as string;
      for (const sub of subscriptions.values()) {
        if (sub.externalSubscriptionId === subId) {
          sub.markPastDue();
          break;
        }
      }
    }

    return { received: true };
  }
}
