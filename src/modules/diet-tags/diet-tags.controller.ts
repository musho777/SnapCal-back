import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DietTagsService } from './diet-tags.service';

@ApiTags('diet-tags')
@Controller('diet-tags')
export class DietTagsController {
  constructor(private readonly dietTagsService: DietTagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all diet tags' })
  findAll() {
    return this.dietTagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get diet tag by ID' })
  findOne(@Param('id') id: string) {
    return this.dietTagsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new diet tag' })
  create(
    @Body('name') name: string,
    @Body('description') description?: string,
  ) {
    return this.dietTagsService.create(name, description);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a diet tag' })
  update(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Body('description') description?: string,
  ) {
    return this.dietTagsService.update(id, name, description);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a diet tag' })
  delete(@Param('id') id: string) {
    return this.dietTagsService.delete(id);
  }
}
