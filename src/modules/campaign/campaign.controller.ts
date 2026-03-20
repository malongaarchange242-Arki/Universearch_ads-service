// src/modules/campaign/campaign.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CampaignService, Campaign } from './campaign.service';

const campaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  media_url: z.string().url(),
  media_type: z.enum(['image', 'video']),
  destination: z.enum(['carousel', 'shorts']),
  target_gender: z.string().optional(),
  target_user_type: z.string().optional(),
  target_users: z.array(z.string()).optional(),
  min_age: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

type CampaignInput = z.infer<typeof campaignSchema>;

export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  async createCampaign(request: FastifyRequest, reply: FastifyReply) {
    try {
      const parsed = campaignSchema.parse(request.body);
      const result = await this.campaignService.createCampaign(parsed as Omit<Campaign, 'id' | 'created_at'>);
      reply.code(201).send({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          success: false,
          error: 'Invalid campaign payload',
          details: error.issues,
        });
        return;
      }
      reply.code(400).send({ success: false, error: (error as Error).message });
    }
  }

  async getCampaigns(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { limit, offset } = request.query as { limit?: string; offset?: string };
      const limitNum = Math.min(parseInt(limit || '50'), 100); // Max 100
      const offsetNum = parseInt(offset || '0');

      const result = await this.campaignService.getCampaigns(limitNum, offsetNum);
      reply.send({
        success: true,
        data: result.campaigns,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: result.total,
        },
      });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async getCampaign(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const campaign = await this.campaignService.getCampaignById(id);
      if (!campaign) {
        reply.code(404).send({ success: false, error: 'Campaign not found' });
        return;
      }
      reply.send({ success: true, data: campaign });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async updateCampaign(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as Partial<Campaign>;
      const result = await this.campaignService.updateCampaign(id, updates);
      reply.send({ success: true, data: result });
    } catch (error) {
      reply.code(400).send({ success: false, error: (error as Error).message });
    }
  }

  async deleteCampaign(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await this.campaignService.deleteCampaign(id);
      reply.send({ success: true, message: 'Campaign deleted' });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }
}