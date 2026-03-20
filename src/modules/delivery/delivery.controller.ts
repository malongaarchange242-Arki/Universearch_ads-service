// src/modules/delivery/delivery.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { DeliveryService } from './delivery.service';

export class DeliveryController {
  constructor(private deliveryService: DeliveryService) {}

  async getCarousel(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('[Controller.getCarousel] STEP 1 - Request received', request.url);
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

      console.log('[Controller.getCarousel] STEP 2 - Calling service');
      const ads = await this.deliveryService.getCarouselAds(userProfile);
      
      console.log('[Controller.getCarousel] STEP 3 - Got response, ads count:', ads.length);
      reply.send({ success: true, data: ads });
      console.log('[Controller.getCarousel] STEP 4 - Response sent');
    } catch (error) {
      console.error('[Controller.getCarousel] ERROR:', error);
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async getShorts(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('[Controller.getShorts] STEP 1 - Request received', request.url);
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

      console.log('[Controller.getShorts] STEP 2 - Calling service');
      const ads = await this.deliveryService.getShortsAds(userProfile);
      
      console.log('[Controller.getShorts] STEP 3 - Got response, ads count:', ads.length);
      reply.send({ success: true, data: ads });
      console.log('[Controller.getShorts] STEP 4 - Response sent');
    } catch (error) {
      console.error('[Controller.getShorts] ERROR:', error);
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }
}