"use strict";
// src/modules/delivery/delivery.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryController = void 0;
class DeliveryController {
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    /**
     * Normalise les paramètres de query (supporte plusieurs conventions de nommage)
     * Accepte: userId OU user_id, gender OU user_gender, etc.
     */
    parseUserProfile(query) {
        // Normaliser les noms de paramètres (camelCase ET snake_case)
        const gender = query.user_gender || query.gender;
        const user_type = query.user_type || query.userType;
        const user_id = query.user_id || query.userId;
        const location = query.location || query.user_location;
        const age = query.user_age || query.age;
        // Construire l'objet utilisateur avec contrôle de types
        const userProfile = {
            gender: gender ? String(gender).trim() || undefined : undefined,
            user_type: user_type ? String(user_type).trim() || undefined : undefined,
            user_id: user_id ? String(user_id).trim() || undefined : undefined,
            location: location ? String(location).trim() || undefined : undefined,
            age: age ? parseInt(String(age), 10) : undefined,
        };
        // Enlever les undefined pour plus de clarté
        return Object.fromEntries(Object.entries(userProfile).filter(([_, v]) => v !== undefined && v !== null && v !== ''));
    }
    async getCarousel(request, reply) {
        try {
            console.log('[Controller.getCarousel] STEP 1 - Request received', request.url);
            console.log('[Controller.getCarousel] Raw query params:', request.query);
            const userProfile = this.parseUserProfile(request.query);
            console.log('[Controller.getCarousel] Parsed user profile:', userProfile);
            console.log('[Controller.getCarousel] STEP 2 - Calling service');
            const ads = await this.deliveryService.getCarouselAds(userProfile);
            console.log('[Controller.getCarousel] STEP 3 - Got response, ads count:', ads.length);
            reply.send({ ads: ads, targetingFiltered: Object.keys(userProfile).length > 0 });
            console.log('[Controller.getCarousel] STEP 4 - Response sent');
        }
        catch (error) {
            console.error('[Controller.getCarousel] ERROR:', error);
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async getShorts(request, reply) {
        try {
            console.log('[Controller.getShorts] STEP 1 - Request received', request.url);
            console.log('[Controller.getShorts] Raw query params:', request.query);
            const userProfile = this.parseUserProfile(request.query);
            console.log('[Controller.getShorts] Parsed user profile:', userProfile);
            console.log('[Controller.getShorts] STEP 2 - Calling service');
            const ads = await this.deliveryService.getShortsAds(userProfile);
            console.log('[Controller.getShorts] STEP 3 - Got response, ads count:', ads.length);
            reply.send({ ads: ads, targetingFiltered: Object.keys(userProfile).length > 0 });
            console.log('[Controller.getShorts] STEP 4 - Response sent');
        }
        catch (error) {
            console.error('[Controller.getShorts] ERROR:', error);
            reply.code(500).send({ success: false, error: error.message });
        }
    }
}
exports.DeliveryController = DeliveryController;
//# sourceMappingURL=delivery.controller.js.map