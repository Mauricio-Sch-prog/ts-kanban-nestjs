import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateTagDto } from 'src/tags/dto/create-tag.dto';
import { createValidationPipe } from 'src/test/factories/pipe.factory';

describe('CreateTagDto Validation', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = createValidationPipe();
  });

  it('should pass with valid data', async () => {
    const validDto = {
      name: 'A tag',
      task: '550e8400-e29b-41d4-a716-446655440000',
    };

    const result = (await pipe.transform(validDto, {
      type: 'body',
      metatype: CreateTagDto,
    })) as CreateTagDto;

    expect(result).toEqual(validDto);
  });

  it('should fail when name is empty', async () => {
    const invalidDto = {
      name: '',
      task: '550e8400-e29b-41d4-a716-446655440000',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateTagDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail with invalid UUID', async () => {
    const invalidDto = {
      name: 'Tag',
      task: 'not-a-uuid',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateTagDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail if extra properties exist (forbidNonWhitelisted)', async () => {
    const dto = {
      name: 'Lane',
      task: '550e8400-e29b-41d4-a716-446655440000',
      extra: 'boom',
    };

    await expect(
      pipe.transform(dto, {
        type: 'body',
        metatype: CreateTagDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
