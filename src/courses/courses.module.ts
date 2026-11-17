import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

// O PrismaService é fornecido pelo PrismaModule global, registrado no AppModule.
@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
