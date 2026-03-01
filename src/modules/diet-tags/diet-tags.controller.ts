import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DietTagsService } from './diet-tags.service';
import { CreateDietTagDto } from './dto/create-diet-tag.dto';
import { UpdateDietTagDto } from './dto/update-diet-tag.dto';

@ApiTags('diet-tags')
@Controller('diet-tags')
export class DietTagsController {
  constructor(private readonly dietTagsService: DietTagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all diet tags' })
  @ApiResponse({
    status: 200,
    description: 'List of all active diet tags',
    schema: {
      type: 'array',
      example: [
        {
          id: 'uuid-123',
          name: 'vegetarian',
          description: 'No meat or fish',
          is_active: true,
          created_at: '2026-03-02T00:00:00Z',
          updated_at: '2026-03-02T00:00:00Z'
        }
      ]
    }
  })
  findAll() {
    return this.dietTagsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get diet tag by ID' })
  @ApiResponse({ status: 200, description: 'Diet tag found' })
  @ApiResponse({ status: 404, description: 'Diet tag not found' })
  findOne(@Param('id') id: string) {
    return this.dietTagsService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: require('multer').diskStorage({
        destination: './uploads/diet-tags',
        filename: (req, file, callback) => {
          const uniqueName = `${require('uuid').v4()}${require('path').extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          return callback(new Error('Only image files are allowed'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new diet tag with icon' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Diet tag icon image',
        },
        name: {
          type: 'string',
          example: 'vegetarian',
        },
        description: {
          type: 'string',
          example: 'No meat or fish',
        },
        icon_url: {
          type: 'string',
          example: 'https://example.com/icons/vegetarian.png',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Diet tag created successfully' })
  @ApiResponse({ status: 409, description: 'Diet tag with this name already exists' })
  create(
    @Body() createDto: CreateDietTagDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return this.dietTagsService.create(createDto.name, createDto.description, createDto.icon_url, icon);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: require('multer').diskStorage({
        destination: './uploads/diet-tags',
        filename: (req, file, callback) => {
          const uniqueName = `${require('uuid').v4()}${require('path').extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
          return callback(new Error('Only image files are allowed'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a diet tag with icon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        icon: {
          type: 'string',
          format: 'binary',
          description: 'Diet tag icon image',
        },
        name: {
          type: 'string',
          example: 'vegetarian',
        },
        description: {
          type: 'string',
          example: 'No meat or fish',
        },
        icon_url: {
          type: 'string',
          example: 'https://example.com/icons/vegetarian.png',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Diet tag updated successfully' })
  @ApiResponse({ status: 404, description: 'Diet tag not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDietTagDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    return this.dietTagsService.update(id, updateDto.name, updateDto.description, updateDto.icon_url, icon);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a diet tag (soft delete)' })
  @ApiResponse({ status: 200, description: 'Diet tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Diet tag not found' })
  delete(@Param('id') id: string) {
    return this.dietTagsService.delete(id);
  }
}
