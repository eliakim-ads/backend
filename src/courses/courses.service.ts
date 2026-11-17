import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// As duas rotas retornam a categoria e as aulas na ordem de exibição.
const courseRelations = {
  category: true,
  lessons: { orderBy: { position: 'asc' } },
} satisfies Prisma.CourseInclude;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany({
      include: courseRelations,
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: number) {
    // O ID identifica um único curso. O Prisma devolve null quando ele não existe.
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: courseRelations,
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    return course;
  }
}
