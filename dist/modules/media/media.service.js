"use strict";
// src/modules/media/media.service.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const crypto_1 = require("crypto");
const fs = __importStar(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpegInstaller = __importStar(require("@ffmpeg-installer/ffmpeg"));
// Configurer FFmpeg path
fluent_ffmpeg_1.default.setFfmpegPath(ffmpegInstaller.path);
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
class MediaService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    validateFileType(mimetype) {
        if (ALLOWED_IMAGE_TYPES.includes(mimetype))
            return 'image';
        if (ALLOWED_VIDEO_TYPES.includes(mimetype))
            return 'video';
        return null;
    }
    generateSafeFilename(filename, mimetype) {
        const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
        // For images, ensure proper extension based on mimetype
        if (mimetype === 'image/jpeg')
            return `${(0, crypto_1.randomUUID)()}.jpg`;
        if (mimetype === 'image/png')
            return `${(0, crypto_1.randomUUID)()}.png`;
        if (mimetype === 'image/webp')
            return `${(0, crypto_1.randomUUID)()}.webp`;
        if (mimetype === 'video/mp4')
            return `${(0, crypto_1.randomUUID)()}.mp4`;
        if (mimetype === 'video/webm')
            return `${(0, crypto_1.randomUUID)()}.webm`;
        // Fallback
        return `${(0, crypto_1.randomUUID)()}.${ext}`;
    }
    async uploadImage(file, filename, mimetype) {
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
        if (error)
            throw error;
        const { data: urlData } = this.supabase.storage
            .from('ads-media')
            .getPublicUrl(filePath);
        return urlData.publicUrl;
    }
    async uploadVideo(file, filename, mimetype) {
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
        if (error)
            throw error;
        const { data: urlData } = this.supabase.storage
            .from('ads-media')
            .getPublicUrl(filePath);
        return urlData.publicUrl;
    }
    /**
     * Normalise une vidéo en MP4 H.264/AAC pour compatibilité mobile
     */
    async normalizeVideo(inputBuffer, originalFilename) {
        const os = require('os');
        const path = require('path');
        const tempInputPath = path.join(os.tmpdir(), `${(0, crypto_1.randomUUID)()}_${originalFilename}`);
        const tempOutputPath = path.join(os.tmpdir(), `${(0, crypto_1.randomUUID)()}_normalized.mp4`);
        // Écrire le buffer d'entrée dans un fichier temporaire
        fs.writeFileSync(tempInputPath, inputBuffer);
        return new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(tempInputPath)
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
                .on('error', (err) => {
                // Nettoyer en cas d'erreur
                try {
                    fs.unlinkSync(tempInputPath);
                }
                catch { }
                try {
                    fs.unlinkSync(tempOutputPath);
                }
                catch { }
                reject(new Error(`FFmpeg normalization failed: ${err.message}`));
            })
                .run();
        });
    }
    async generateThumbnail(videoUrl) {
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
        if (error)
            throw error;
        const { data: urlData } = this.supabase.storage
            .from('ads-media')
            .getPublicUrl(thumbnailPath);
        return urlData.publicUrl;
    }
    async deleteMedia(mediaUrl) {
        // Extract file path from public URL
        const urlParts = mediaUrl.split('/');
        const filePath = urlParts.slice(-2).join('/'); // e.g., "images/filename.jpg"
        const { error } = await this.supabase.storage
            .from('ads-media')
            .remove([filePath]);
        if (error)
            throw error;
    }
}
exports.MediaService = MediaService;
//# sourceMappingURL=media.service.js.map