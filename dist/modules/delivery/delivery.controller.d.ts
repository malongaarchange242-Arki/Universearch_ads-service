import { FastifyRequest, FastifyReply } from 'fastify';
import { DeliveryService } from './delivery.service';
export declare class DeliveryController {
    private deliveryService;
    constructor(deliveryService: DeliveryService);
    getCarousel(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getShorts(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=delivery.controller.d.ts.map