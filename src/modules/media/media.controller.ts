// src/modules/media/media.controller.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { MediaService } from './media.service';

export class MediaController {
  constructor(private mediaService: MediaService) {}

  async uploadMedia(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('Upload request received');
      console.log('Content-Type header:', request.headers['content-type']);
      const data = await request.file();
      console.log('File data:', data ? 'present' : 'null');
      if (!data) {
        reply.code(400).send({ success: false, error: 'No file uploaded' });
        return;
      }

      const buffer = await data.toBuffer();
      const filename = data.filename;
      const mimetype = data.mimetype;

      // Enforce per-type size limits
      const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
      const VIDEO_MAX_BYTES = 50 * 1024 * 1024; // 50MB

      if (mimetype.startsWith('image/') && buffer.length > IMAGE_MAX_BYTES) {
        reply.code(413).send({ success: false, error: 'Image too large (max 5MB)' });
        return;
      }
      if (mimetype.startsWith('video/') && buffer.length > VIDEO_MAX_BYTES) {
        reply.code(413).send({ success: false, error: 'Video too large (max 50MB)' });
        return;
      }

      let mediaUrl: string;

      if (mimetype.startsWith('image/')) {
        mediaUrl = await this.mediaService.uploadImage(buffer, filename, mimetype);
      } else if (mimetype.startsWith('video/')) {
        mediaUrl = await this.mediaService.uploadVideo(buffer, filename, mimetype);
      } else {
        reply.code(400).send({
          success: false,
          error: 'Unsupported file type. Allowed: images (jpeg, png, webp) and videos (mp4, webm)'
        });
        return;
      }

      // Ajouter headers CORS pour compatibilité Flutter
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Headers', 'Range, Content-Type');
      reply.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

      reply.send({ success: true, data: { mediaUrl } });
    } catch (error) {
      console.error('Upload error:', error);
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }

  async deleteMedia(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { mediaUrl } = request.body as { mediaUrl: string };
      await this.mediaService.deleteMedia(mediaUrl);
      reply.send({ success: true, message: 'Media deleted' });
    } catch (error) {
      reply.code(500).send({ success: false, error: (error as Error).message });
    }
  }
}