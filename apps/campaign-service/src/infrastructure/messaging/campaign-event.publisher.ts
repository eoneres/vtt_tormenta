import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGES, CAMPAIGN_EVENTS } from '@vtt/shared-events';
import { generateId, generateTraceId } from '@vtt/shared-utils';
import type { Campaign } from '../../domain/campaign/entities/campaign.entity';

@Injectable()
export class CampaignEventPublisher {
  constructor(private readonly amqp: AmqpConnection) {}

  async publishCampaignCreated(campaign: Campaign): Promise<void> {
    await this.amqp.publish(EXCHANGES.CAMPAIGN, CAMPAIGN_EVENTS.CAMPAIGN_CREATED, {
      eventId: generateId(),
      eventType: CAMPAIGN_EVENTS.CAMPAIGN_CREATED,
      version: '1',
      occurredAt: new Date().toISOString(),
      traceId: generateTraceId(),
      payload: {
        campaignId: campaign.id,
        ownerId: campaign.ownerId,
        systemId: campaign.systemId,
        name: campaign.name,
      },
    });
  }
}
