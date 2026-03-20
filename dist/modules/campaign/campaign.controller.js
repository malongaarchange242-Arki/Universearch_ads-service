"use strict";
// src/modules/campaign/campaign.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const zod_1 = require("zod");
const campaignSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    media_url: zod_1.z.string().url(),
    media_type: zod_1.z.enum(['image', 'video']),
    destination: zod_1.z.enum(['carousel', 'shorts']),
    target_gender: zod_1.z.string().optional(),
    target_user_type: zod_1.z.string().optional(),
    target_users: zod_1.z.array(zod_1.z.string()).optional(),
    min_age: zod_1.z.number().int().nonnegative().optional(),
    location: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
class CampaignController {
    constructor(campaignService) {
        this.campaignService = campaignService;
    }
    async createCampaign(request, reply) {
        try {
            const parsed = campaignSchema.parse(request.body);
            const result = await this.campaignService.createCampaign(parsed);
            reply.code(201).send({ success: true, data: result });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                reply.code(400).send({
                    success: false,
                    error: 'Invalid campaign payload',
                    details: error.issues,
                });
                return;
            }
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async getCampaigns(request, reply) {
        try {
            const { limit, offset } = request.query;
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
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async getCampaign(request, reply) {
        try {
            const { id } = request.params;
            const campaign = await this.campaignService.getCampaignById(id);
            if (!campaign) {
                reply.code(404).send({ success: false, error: 'Campaign not found' });
                return;
            }
            reply.send({ success: true, data: campaign });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
    async updateCampaign(request, reply) {
        try {
            const { id } = request.params;
            const updates = request.body;
            const result = await this.campaignService.updateCampaign(id, updates);
            reply.send({ success: true, data: result });
        }
        catch (error) {
            reply.code(400).send({ success: false, error: error.message });
        }
    }
    async deleteCampaign(request, reply) {
        try {
            const { id } = request.params;
            await this.campaignService.deleteCampaign(id);
            reply.send({ success: true, message: 'Campaign deleted' });
        }
        catch (error) {
            reply.code(500).send({ success: false, error: error.message });
        }
    }
}
exports.CampaignController = CampaignController;
//# sourceMappingURL=campaign.controller.js.map