// src/ocr/word.controller.ts
import { Controller, Post, Res } from '@nestjs/common';
import { WordService } from './word.service';
import { join } from 'path';
import { Response } from 'express';

@Controller('word')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Post('run')
  async run(@Res() res: Response) {
    // استخدم process.cwd() للوصول إلى uploads في جذر المشروع
    const imagePath = join(process.cwd(), 'uploads', '7726cd62-f10b-47db-92dc-6c2f05b6e781.png');
    const count = await this.wordService.extractAndStore(imagePath);
    return res.json({ extractedWords: count });
  }
}
