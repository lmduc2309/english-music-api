import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface YouTubeVideoInfo { videoId: string; title: string; thumbnailUrl: string; durationSeconds: number; channelTitle: string; }
export interface CaptionLine { text: string; startTime: number; endTime: number; }

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly apiKey: string;
  constructor(private config: ConfigService) { this.apiKey = config.get('YOUTUBE_API_KEY', ''); }

  async getVideoInfo(videoId: string): Promise<YouTubeVideoInfo> {
    try {
      if (this.apiKey) {
        const res = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${this.apiKey}`);
        const item = res.data.items?.[0];
        if (item) return { videoId, title: item.snippet.title, thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url, durationSeconds: this.parseDuration(item.contentDetails.duration), channelTitle: item.snippet.channelTitle };
      }
    } catch (error: any) { this.logger.warn(`YouTube API error for ${videoId}: ${error.message}`); }
    return { videoId, title: '', thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, durationSeconds: 0, channelTitle: '' };
  }

  async fetchCaptions(videoId: string): Promise<CaptionLine[]> {
    try {
      const res = await axios.get(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`, { timeout: 10000 });
      if (res.data?.events) {
        return res.data.events.filter((e: any) => e.segs?.length > 0).map((e: any) => ({
          text: e.segs.map((s: any) => s.utf8).join('').trim(), startTime: (e.tStartMs || 0) / 1000, endTime: ((e.tStartMs || 0) + (e.dDurationMs || 3000)) / 1000,
        })).filter((l: CaptionLine) => l.text.length > 0);
      }
    } catch (error: any) { this.logger.warn(`Caption fetch failed for ${videoId}: ${error.message}`); }
    return [];
  }

  private parseDuration(iso8601: string): number {
    const m = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return 0;
    return parseInt(m[1]||'0')*3600 + parseInt(m[2]||'0')*60 + parseInt(m[3]||'0');
  }
}
