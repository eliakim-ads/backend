import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from './courses.service';

// O mock evita abrir uma conexão com o PostgreSQL nos testes unitários.
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));

describe('CoursesService', () => {
  const prisma = { course: { findMany: jest.fn(), findUnique: jest.fn() } };
  const service = new CoursesService(prisma as unknown as PrismaService);
  const course = {
    id: 1,
    title: 'React para Iniciantes',
    category: { id: 1, slug: 'frontend' },
    lessons: [],
  };
  const relations = {
    category: true,
    lessons: { orderBy: { position: 'asc' } },
  };

  beforeEach(() => jest.resetAllMocks());

  it('lista os cursos por título e inclui as aulas em ordem', async () => {
    prisma.course.findMany.mockResolvedValue([course]);

    await expect(service.findAll()).resolves.toEqual([course]);
    expect(prisma.course.findMany).toHaveBeenCalledWith({
      include: relations,
      orderBy: { title: 'asc' },
    });
  });

  it('busca um curso pelo ID com a categoria e as aulas', async () => {
    prisma.course.findUnique.mockResolvedValue(course);

    await expect(service.findOne(1)).resolves.toEqual(course);
    expect(prisma.course.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: relations,
    });
  });

  it('lança NotFoundException para um curso inexistente', async () => {
    prisma.course.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
