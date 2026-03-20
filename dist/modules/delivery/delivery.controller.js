"use strict";
// src/modules/delivery/delivery.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
class DeliveryController {
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    async getCarousel(request, reply) {
        try {
            const { user_gender, user_age, user_location, user_type, user_id } = request.query;
            const userProfile = {
                gender: user_gender,
                user_type: user_type,
                user_id: user_id,
                age: user_age ? parseInt(user_age) : undefined,
                location: user_location,
            };
            const ads = await this.deliveryService.getCarouselAds(userProfile);
            reply.send({ success: true, data: ads });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async getShorts(request, reply) {
        try {
            const { user_gender, user_age, user_location, user_type, user_id } = request.query;
            const userProfile = {
                gender: user_gender,
                user_type: user_type,
                user_id: user_id,
                age: user_age ? parseInt(user_age) : undefined,
                location: user_location,
            };
            const ads = await this.deliveryService.getShortsAds(userProfile);
            reply.send({ success: true, data: ads });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
}
exports.DeliveryController = DeliveryController;
//# sourceMappingURL=delivery.controller.js.map