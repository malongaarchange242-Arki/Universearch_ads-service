// src/modules/delivery/delivery.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { DeliveryService } from './delivery.service';

export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  async getCarousel(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { user_gender, user_age, user_location, user_type, user_id } = request.query as {
        user_gender?: string;
        user_age?: string;
        user_location?: string;
        user_type?: string;
        user_id?: string;
      };

      const userProfile = {
        gender: user_gender,
        user_type: user_type,
        user_id: user_id,
        age: user_age ? parseInt(user_age) : undefined,
        location: user_location,
      };

      const ads = await this.deliveryService.getCarouselAds(userProfile);
      reply.send({ success: true, data: ads });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async getShorts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { user_gender, user_age, user_location, user_type, user_id } = request.query as {
        user_gender?: string;
        user_age?: string;
        user_location?: string;
        user_type?: string;
        user_id?: string;
      };

      const userProfile = {
        gender: user_gender,
        user_type: user_type,
        user_id: user_id,
        age: user_age ? parseInt(user_age) : undefined,
        location: user_location,
      };

      const ads = await this.deliveryService.getShortsAds(userProfile);
      reply.send({ success: true, data: ads });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }
}