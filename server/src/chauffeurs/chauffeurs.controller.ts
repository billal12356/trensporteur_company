import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChauffeursService } from './chauffeurs.service';
import { CreateChauffeurDto } from './dto/create-chauffeur.dto';
import { UpdateChauffeurDto } from './dto/update-chauffeur.dto';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly chauffeursService: ChauffeursService) {}

  @Post()
  create(@Body() createChauffeurDto: CreateChauffeurDto) {
    return this.chauffeursService.create(createChauffeurDto);
  }

  @Get()
  findAll() {
    return this.chauffeursService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chauffeursService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChauffeurDto: UpdateChauffeurDto) {
    return this.chauffeursService.update(+id, updateChauffeurDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chauffeursService.remove(+id);
  }
}
