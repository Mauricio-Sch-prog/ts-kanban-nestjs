import { forwardRef, Module } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardController } from './board.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { BoardScopedRepository } from './board.scoped.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board]),
    forwardRef(() => UserModule),
    AuthModule,
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardScopedRepository],
})
export class BoardModule {}
