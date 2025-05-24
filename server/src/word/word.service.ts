// src/ocr/word.service.ts
import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word } from './word.schema';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class WordService {
  constructor(@InjectModel(Word.name) private wordModel: Model<Word>) { }

  async extractAndStore(imagePath: string): Promise<number> {
    // __dirname داخل dist/ocr سيشير إلى .../dist/ocr
    const script = join(__dirname, '..', 'scripts', 'scripts', 'extract_coords.py');

    if (!existsSync(script)) {
      throw new Error(`Python script not found at ${script}`);
    }
    if (!existsSync(imagePath)) {
      throw new Error(`Image file not found at ${imagePath}`);
    }

    // استدعاء بداية Python (بافتراض أن 'python' معرف)
    const py = spawn('python', [script, imagePath]);

    let out = '';
    for await (const chunk of py.stdout) { out += chunk; }
    let err = '';
    for await (const chunk of py.stderr) { err += chunk; }

    const code = await new Promise<number>(r => py.on('close', r));
    if (code !== 0) {
      throw new Error(err || `Python exited with code ${code}`);
    }

    const words: Array<{
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      conf: number;
    }> = JSON.parse(out);

    for (const w of words) {
      await this.wordModel.create({ ...w, fillValue: null });
    }
    return words.length;
  }
}
