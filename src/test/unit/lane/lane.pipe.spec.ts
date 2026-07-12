import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateLaneDto } from 'src/lane/dto/create-lane.dto';
import { createValidationPipe } from 'src/test/factories/pipe.factory';

describe('CreateLaneDto Validation', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = createValidationPipe();
  });

  it('should pass with valid data', async () => {
    const validDto = {
      name: 'My Lane',
      board: '550e8400-e29b-41d4-a716-446655440000',
    };

    const result = (await pipe.transform(validDto, {
      type: 'body',
      metatype: CreateLaneDto,
    })) as CreateLaneDto;

    expect(result).toEqual(validDto);
  });

  it('should fail when name is empty', async () => {
    const invalidDto = {
      name: '',
      board: '550e8400-e29b-41d4-a716-446655440000',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateLaneDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail with invalid UUID', async () => {
    const invalidDto = {
      name: 'Lane',
      board: 'not-a-uuid',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateLaneDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail if extra properties exist (forbidNonWhitelisted)', async () => {
    const dto = {
      name: 'Lane',
      board: '550e8400-e29b-41d4-a716-446655440000',
      extra: 'boom',
    };

    await expect(
      pipe.transform(dto, {
        type: 'body',
        metatype: CreateLaneDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
