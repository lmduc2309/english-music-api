import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface PronunciationAssessment {
  overallScore: number;
  wordDetails: { word: string; expected: string; correct: boolean; pronunciationNote: string }[];
  feedback: string;
  suggestedFocus: string[];
}

@Injectable()
export class VllmService {
  private readonly logger = new Logger(VllmService.name);
  private readonly vllmUrl: string;
  private readonly vllmModel: string;

  constructor(private config: ConfigService) {
    this.vllmUrl = config.get('VLLM_URL', 'http://192.168.20.228:8000/v1/completions');
    this.vllmModel = config.get('VLLM_MODEL', 'Qwen/Qwen2.5-7B-Instruct-AWQ');
  }

  async assessPronunciation(originalText: string, transcribedText: string, nativeLanguage = 'vi'): Promise<PronunciationAssessment> {
    const prompt = this.buildAssessmentPrompt(originalText, transcribedText, nativeLanguage);
    try {
      const response = await axios.post(this.vllmUrl, { model: this.vllmModel, prompt, max_tokens: 1024, temperature: 0.3, stop: ['```\n'] });
      const text = response.data.choices?.[0]?.text || '';
      return this.parseAssessmentResponse(text, originalText, transcribedText);
    } catch (error: any) {
      this.logger.error('vLLM assessment failed:', error.message);
      return this.fallbackAssessment(originalText, transcribedText);
    }
  }

  async generateFeedback(originalText: string, transcribedText: string, scores: { pitch: number; timing: number; pronunciation: number; wordAccuracy: number }, nativeLanguage = 'vi'): Promise<string> {
    const prompt = `<|im_start|>system\nYou are a friendly English pronunciation coach. Give brief, encouraging feedback (2-3 sentences max).\n<|im_end|>\n<|im_start|>user\nStudent's native language: ${nativeLanguage}\nOriginal lyric: "${originalText}"\nWhat they sang: "${transcribedText}"\nScores: Pitch ${Math.round(scores.pitch)}%, Timing ${Math.round(scores.timing)}%, Pronunciation ${Math.round(scores.pronunciation)}%, Words ${Math.round(scores.wordAccuracy)}%\n\nGive brief encouraging feedback with one specific tip to improve.\n<|im_end|>\n<|im_start|>assistant\n`;
    try {
      const response = await axios.post(this.vllmUrl, { model: this.vllmModel, prompt, max_tokens: 256, temperature: 0.7, stop: ['<|im_end|>'] });
      return response.data.choices?.[0]?.text?.trim() || 'Great effort! Keep practicing!';
    } catch (error: any) {
      this.logger.error('vLLM feedback failed:', error.message);
      return 'Good try! Keep practicing to improve your pronunciation.';
    }
  }

  async getWordDefinition(word: string, songContext: string): Promise<{ definition: string; phonetic: string; exampleSentence: string }> {
    const prompt = `<|im_start|>system\nYou are an English vocabulary teacher. Respond ONLY with valid JSON.\n<|im_end|>\n<|im_start|>user\nWord: "${word}" Context: "${songContext}"\nRespond: {"definition":"brief","phonetic":"IPA","exampleSentence":"example"}\n<|im_end|>\n<|im_start|>assistant\n`;
    try {
      const response = await axios.post(this.vllmUrl, { model: this.vllmModel, prompt, max_tokens: 200, temperature: 0.3, stop: ['<|im_end|>'] });
      const text = response.data.choices?.[0]?.text?.trim() || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return { definition: word, phonetic: '', exampleSentence: '' };
    } catch { return { definition: word, phonetic: '', exampleSentence: '' }; }
  }

  private buildAssessmentPrompt(original: string, transcribed: string, nativeLang: string): string {
    return `<|im_start|>system\nYou are an expert English pronunciation assessor. Compare the original lyric with what the student sang. Respond ONLY with valid JSON.\n<|im_end|>\n<|im_start|>user\nNative language: ${nativeLang}\nOriginal: "${original}"\nTranscribed: "${transcribed}"\n\nRespond in JSON: {"overallScore":0-100,"wordDetails":[{"word":"transcribed","expected":"original","correct":true/false,"pronunciationNote":"tip"}],"feedback":"brief","suggestedFocus":["phoneme"]}\n<|im_end|>\n<|im_start|>assistant\n\`\`\`json\n`;
  }

  private parseAssessmentResponse(text: string, original: string, transcribed: string): PronunciationAssessment {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)), wordDetails: parsed.wordDetails || [], feedback: parsed.feedback || '', suggestedFocus: parsed.suggestedFocus || [] };
      }
    } catch { this.logger.warn('Failed to parse vLLM response, using fallback'); }
    return this.fallbackAssessment(original, transcribed);
  }

  private fallbackAssessment(original: string, transcribed: string): PronunciationAssessment {
    const origWords = original.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const transWords = transcribed.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    let correct = 0;
    const wordDetails = origWords.map((word, i) => {
      const trans = transWords[i] || '';
      const isCorrect = word === trans;
      if (isCorrect) correct++;
      return { word: trans || '(missed)', expected: word, correct: isCorrect, pronunciationNote: isCorrect ? '' : `Expected "${word}"` };
    });
    const score = origWords.length > 0 ? (correct / origWords.length) * 100 : 0;
    return {
      overallScore: Math.round(score), wordDetails,
      feedback: score >= 80 ? 'Great job!' : score >= 50 ? 'Good effort! Focus on highlighted words.' : 'Keep practicing!',
      suggestedFocus: wordDetails.filter(w => !w.correct).map(w => w.expected).slice(0, 3),
    };
  }
}
