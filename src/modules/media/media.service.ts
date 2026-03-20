// src/modules/media/media.service.ts

import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

// Configurer FFmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export class MediaService {
  constructor(private supabase: SupabaseClient) {}

  private validateFileType(mimetype: string): 'image' | 'video' | null {
    if (ALLOWED_IMAGE_TYPES.includes(mimetype)) return 'image';
    if (ALLOWED_VIDEO_TYPES.includes(mimetype)) return 'video';
    return null;
  }

  private generateSafeFilename(filename: string, mimetype: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
    // For images, ensure proper extension based on mimetype
    if (mimetype === 'image/jpeg') return `${randomUUID()}.jpg`;
    if (mimetype === 'image/png') return `${randomUUID()}.png`;
    if (mimetype === 'image/webp') return `${randomUUID()}.webp`;
    if (mimetype === 'video/mp4') return `${randomUUID()}.mp4`;
    if (mimetype === 'video/webm') return `${randomUUID()}.webm`;
    // Fallback
    return `${randomUUID()}.${ext}`;
  }

  async uploadImage(file: Buffer, filename: string, mimetype: string): Promise<string> {
    const fileType = this.validateFileType(mimetype);
    if (fileType !== 'image') {
      throw new Error(`Invalid image type: ${mimetype}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    const safeFilename = this.generateSafeFilename(filename, mimetype);
    const filePath = `images/${safeFilename}`;

    const { data, error } = await this.supabase.storage
      .from('ads-media')
      .upload(filePath, file, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('ads-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async uploadVideo(file: Buffer, filename: string, mimetype: string): Promise<string> {
    const fileType = this.validateFileType(mimetype);
    if (fileType !== 'video') {
      throw new Error(`Invalid video type: ${mimetype}. Allowed: ${ALLOWED_VIDEO_TYPES.join(', ')}`);
    }

    // Normaliser la vidéo avant upload
    const normalizedBuffer = await this.normalizeVideo(file, filename);

    const safeFilename = this.generateSafeFilename(filename, 'video/mp4'); // Toujours MP4 après normalisation
    const filePath = `videos/${safeFilename}`;

    const { data, error } = await this.supabase.storage
      .from('ads-media')
      .upload(filePath, normalizedBuffer, {
        contentType: 'video/mp4', // Toujours MP4
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('ads-media')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Normalise une vidéo en MP4 H.264/AAC pour compatibilité mobile
   */
  private async normalizeVideo(inputBuffer: Buffer, originalFilename: string): Promise<Buffer> {
    const os = require('os');
    const path = require('path');
    const tempInputPath = path.join(os.tmpdir(), `${randomUUID()}_${originalFilename}`);
    const tempOutputPath = path.join(os.tmpdir(), `${randomUUID()}_normalized.mp4`);

    // Écrire le buffer d'entrée dans un fichier temporaire
    fs.writeFileSync(tempInputPath, inputBuffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempInputPath)
        .inputOptions(['-hwaccel auto']) // Accélération matérielle si disponible
        .outputOptions([
          '-c:v libx264', // Codec vidéo H.264
          '-preset fast', // Preset rapide pour production
          '-crf 23', // Qualité équilibrée (plus bas = meilleure qualité)
          '-c:a aac', // Codec audio AAC
          '-b:a 128k', // Bitrate audio
          '-movflags +faststart', // Optimisé pour streaming (moov atom au début)
          '-pix_fmt yuv420p', // Format pixel compatible mobile
          '-vf scale=-2:720', // Redimensionner à 720p max (optionnel, ajustez selon besoin)
        ])
        .output(tempOutputPath)
        .on('end', () => {
          const outputBuffer = fs.readFileSync(tempOutputPath);
          // Nettoyer les fichiers temporaires
          fs.unlinkSync(tempInputPath);
          fs.unlinkSync(tempOutputPath);
          resolve(outputBuffer);
        })
        .on('error', (err: any) => {
          // Nettoyer en cas d'erreur
          try { fs.unlinkSync(tempInputPath); } catch {}
          try { fs.unlinkSync(tempOutputPath); } catch {}
          reject(new Error(`FFmpeg normalization failed: ${err.message}`));
        })
        .run();
    });
  }

  async generateThumbnail(videoUrl: string): Promise<string> {
    // For now, return a placeholder. In production, you'd use a video processing service
    // to generate actual thumbnails from the video
    const thumbnailPath = `thumbnails/${Date.now()}-thumb.jpg`;

    // Placeholder thumbnail upload
    const placeholderBuffer = Buffer.from('placeholder thumbnail data');

    const { data, error } = await this.supabase.storage
      .from('ads-media')
      .upload(thumbnailPath, placeholderBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = this.supabase.storage
      .from('ads-media')
      .getPublicUrl(thumbnailPath);

    return urlData.publicUrl;
  }

  async deleteMedia(mediaUrl: string): Promise<void> {
    // Extract file path from public URL
    const urlParts = mediaUrl.split('/');
    const filePath = urlParts.slice(-2).join('/'); // e.g., "images/filename.jpg"

    const { error } = await this.supabase.storage
      .from('ads-media')
      .remove([filePath]);

    if (error) throw error;
  }
}