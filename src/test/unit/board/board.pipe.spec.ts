import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreateBoardDto } from 'src/board/dto/create-board.dto';
import { createValidationPipe } from 'src/test/factories/pipe.factory';

describe('CreateBoardDto Validation', () => {
  let pipe: ValidationPipe;

  beforeEach(() => {
    pipe = createValidationPipe();
  });

  it('should pass with valid data', async () => {
    const validDto = {
      name: 'My Board.com',
    };

    const result = (await pipe.transform(validDto, {
      type: 'body',
      metatype: CreateBoardDto,
    })) as CreateBoardDto;

    expect(result).toEqual(validDto);
  });

  it('should fail when name is empty', async () => {
    const invalidDto = {
      name: '',
    };

    await expect(
      pipe.transform(invalidDto, {
        type: 'body',
        metatype: CreateBoardDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should fail if extra properties exist (forbidNonWhitelisted)', async () => {
    const dto = {
      name: 'My Board.com',
      extra: 'boom!!',
    };

    await expect(
      pipe.transform(dto, {
        type: 'body',
        metatype: CreateBoardDto,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
