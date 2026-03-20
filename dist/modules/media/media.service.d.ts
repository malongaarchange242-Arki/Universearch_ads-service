import { SupabaseClient } from '@supabase/supabase-js';
export declare class MediaService {
    private supabase;
    constructor(supabase: SupabaseClient);
    private validateFileType;
    private generateSafeFilename;
    uploadImage(file: Buffer, filename: string, mimetype: string): Promise<string>;
    uploadVideo(file: Buffer, filename: string, mimetype: string): Promise<string>;
    /**
     * Normalise une vidéo en MP4 H.264/AAC pour compatibilité mobile
     */
    private normalizeVideo;
    generateThumbnail(videoUrl: string): Promise<string>;
    deleteMedia(mediaUrl: string): Promise<void>;
}
//# sourceMappingURL=media.service.d.ts.map