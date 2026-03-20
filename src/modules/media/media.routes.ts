// src/modules/media/media.routes.ts

import { FastifyInstance } from 'fastify';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

export async function mediaRoutes(app: FastifyInstance) {
  const mediaService = new MediaService(app.supabase);
  const mediaController = new MediaController(mediaService);

  // POST /ads/media/upload
  app.post('/upload', mediaController.uploadMedia.bind(mediaController));

  // DELETE /ads/media/:id
  app.delete('/:id', mediaController.deleteMedia.bind(mediaController));
}