import { BadRequestException, Body, Controller, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TestimoniesService } from './testimonies.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTestimonyDto } from './dto/create-testimony.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Controller('testimonies')
export class TestimoniesController {
  constructor(private readonly service: TestimoniesService, private readonly storage: StorageService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateTestimonyDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RESPONSABLE', 'INTERCESSEUR')
  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) return cb(new BadRequestException('Format non supporté (jpeg, png, webp uniquement)'), false);
        cb(null, true);
      },
    }),
  )
  async uploadPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const stored = await this.storage.save(file.buffer, 'testimonies', file.originalname, file.mimetype);
    await this.service.setPhoto(id, stored.path);
    return { photoPath: stored.path };
  }
}
