"use strict";
// src/modules/media/media.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRoutes = mediaRoutes;
const media_controller_1 = require("./media.controller");
const media_service_1 = require("./media.service");
async function mediaRoutes(app) {
    const mediaService = new media_service_1.MediaService(app.supabase);
    const mediaController = new media_controller_1.MediaController(mediaService);
    // POST /ads/media/upload
    app.post('/upload', mediaController.uploadMedia.bind(mediaController));
    // DELETE /ads/media/:id
    app.delete('/:id', mediaController.deleteMedia.bind(mediaController));
}
//# sourceMappingURL=media.routes.js.map