import { Injectable } from '@nestjs/common';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { UpdateChauffeurDto } from './dto/update-chauffeur.dto';

@Injectable()
export class ChauffeursService {
  create(createChauffeurDto: CreateChauffeurDto) {
    return 'This action adds a new chauffeur';
  }

  findAll() {
    return `This action returns all chauffeurs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chauffeur`;
  }

  update(id: number, updateChauffeurDto: UpdateChauffeurDto) {
    return `This action updates a #${id} chauffeur`;
  }

  remove(id: number) {
    return `This action removes a #${id} chauffeur`;
  }
}
