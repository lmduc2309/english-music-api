import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { VocabularyItem, CefrLevel } from '../entities';
import { VllmService } from '../vllm/vllm.service';

@Injectable()
export class VocabularyService {
  constructor(@InjectRepository(VocabularyItem) private vocabRepo: Repository<VocabularyItem>, private vllmService: VllmService) {}

  async addWord(userId: string, word: string, songContext: string, songId?: string): Promise<VocabularyItem> {
    let item = await this.vocabRepo.findOne({ where: { userId, word: word.toLowerCase() } });
    if (item) return item;
    const def = await this.vllmService.getWordDefinition(word, songContext);
    item = this.vocabRepo.create({ userId, word: word.toLowerCase(), definition: def.definition, phonetic: def.phonetic, exampleSentence: def.exampleSentence, songContext, songId, nextReviewDate: new Date() });
    return this.vocabRepo.save(item);
  }

  async getReviewWords(userId: string, limit = 10): Promise<VocabularyItem[]> {
    return this.vocabRepo.find({ where: { userId, mastered: false, nextReviewDate: LessThanOrEqual(new Date()) }, order: { nextReviewDate: 'ASC' }, take: limit });
  }

  async reviewWord(userId: string, wordId: string, quality: number): Promise<VocabularyItem> {
    const item = await this.vocabRepo.findOne({ where: { id: wordId, userId } });
    if (!item) throw new NotFoundException('Word not found');
    if (quality >= 3) {
      if (item.repetitions === 0) item.interval = 1;
      else if (item.repetitions === 1) item.interval = 6;
      else item.interval = Math.round(item.interval * item.easeFactor);
      item.repetitions += 1;
    } else { item.repetitions = 0; item.interval = 1; }
    item.easeFactor = Math.max(1.3, item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const next = new Date(); next.setDate(next.getDate() + item.interval);
    item.nextReviewDate = next;
    if (item.interval > 30 && item.repetitions >= 5) item.mastered = true;
    return this.vocabRepo.save(item);
  }

  async getUserVocabulary(userId: string, page = 1, limit = 50) {
    const [items, total] = await this.vocabRepo.findAndCount({ where: { userId }, order: { createdAt: 'DESC' }, skip: (page-1)*limit, take: limit });
    const mastered = await this.vocabRepo.count({ where: { userId, mastered: true } });
    const dueForReview = await this.vocabRepo.count({ where: { userId, mastered: false, nextReviewDate: LessThanOrEqual(new Date()) } });
    return { items, total, mastered, dueForReview, page };
  }

  async extractWordsFromLyrics(userId: string, lyrics: string, songId: string, level: CefrLevel): Promise<VocabularyItem[]> {
    const words = [...new Set(lyrics.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(w => w.length > 3))];
    const existing = await this.vocabRepo.find({ where: words.map(w => ({ userId, word: w })) });
    const existingWords = new Set(existing.map(e => e.word));
    const newWords = words.filter(w => !existingWords.has(w)).slice(0, 10);
    const added: VocabularyItem[] = [];
    for (const word of newWords) { try { added.push(await this.addWord(userId, word, lyrics, songId)); } catch {} }
    return added;
  }
}
