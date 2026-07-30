import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { createValidationPipe } from 'src/test/factories/pipe.factory';

describe('CreateTaskDto Validation', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = createValidationPipe();
  });

  it('should pass with valid data', async () => {
    const validDto = {
      title: 'My task',
      description: 'that describes the taks',
      lane: '550e8400-e29b-41d4-a716-446655440000',
    };

    const result = (await pipe.transform(validDto, {
      type: 'body',
      metatype: CreateTaskDto,
    })) as CreateTaskDto;

    expect(result).toMatchObject(validDto);
    expect(result).toBeInstanceOf(CreateTaskDto);
  });

  it('should accepts optional field', async () => {
    const validDto = {
      title: 'My task',
      description: '',
      lane: '550e8400-e29b-41d4-a716-446655440000',
    };

    const result = (await pipe.transform(validDto, {
      type: 'body',
      metatype: CreateTaskDto,
    })) as CreateTaskDto;

    expect(result).toMatchObject(validDto);
    expect(result).toBeInstanceOf(CreateTaskDto);
  });

  it('should fail when title is empty', async () => {
    const invalidDto = {
      title: '',
      lane: '550e8400-e29b-41d4-a716-446655440000',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateTaskDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail with invalid UUID', async () => {
    const invalidDto = {
      title: 'Task',
      lane: 'not-a-uuid',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateTaskDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail if extra properties exist (forbidNonWhitelisted)', async () => {
    const dto = {
      title: 'Task',
      lane: '550e8400-e29b-41d4-a716-446655440000',
      extra: 'boom',
    };

    await expect(
      pipe.transform(dto, {
        type: 'body',
        metatype: CreateTaskDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
