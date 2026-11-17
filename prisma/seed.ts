// Seed do DevFlix serve para popular o banco de dados com categorias, cursos e aulas iniciais.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const catalog = [
  {
    category: { slug: 'frontend', name: 'Desenvolvimento Frontend' },
    course: {
      slug: 'react-iniciantes',
      title: 'React para Iniciantes',
      description: 'Fundamentos do React.',
    },
    lessons: [
      {
        position: 1,
        title: 'Introdução ao React',
        description: 'Primeiros conceitos de React.',
        videoId: 'Tn6-PIqc4UM',
      },
      {
        position: 2,
        title: 'Componentes e JSX',
        description: 'Organizando interfaces em componentes.',
        videoId: 'w7ejDZ8SWv8',
      },
    ],
  },
  {
    category: { slug: 'backend', name: 'Desenvolvimento Backend' },
    course: {
      slug: 'nodejs-iniciantes',
      title: 'Node.js para Iniciantes',
      description: 'Introdução ao Node.js.',
    },
    lessons: [
      {
        position: 1,
        title: 'Introdução ao Node.js',
        description: 'Conhecendo o ambiente Node.js.',
        videoId: 'TlB_eWDSMt4',
      },
    ],
  },
  {
    category: { slug: 'banco-de-dados', name: 'Banco de Dados' },
    course: {
      slug: 'sql-fundamentos',
      title: 'Fundamentos de SQL',
      description: 'Introdução aos bancos relacionais.',
    },
    lessons: [
      {
        position: 1,
        title: 'Introdução aos Bancos de Dados',
        description: 'Conceitos básicos de SQL.',
        videoId: 'HXV3zeQKqGY',
      },
    ],
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    console.log('Iniciando seed do DevFlix...');

    // A transação desfaz todas as alterações do seed se algum cadastro falhar.
    await prisma.$transaction(async (tx) => {
      for (const { category, course, lessons } of catalog) {
        // O slug identifica o mesmo registro mesmo quando os IDs variam entre bancos.
        const savedCategory = await tx.category.upsert({
          where: { slug: category.slug },
          update: { name: category.name },
          create: category,
        });

        const courseData = {
          ...course,
          categoryId: savedCategory.id,
          published: true,
        };
        const savedCourse = await tx.course.upsert({
          where: { slug: course.slug },
          update: courseData,
          create: courseData,
        });

        for (const { position, ...lesson } of lessons) {
          // A posição identifica a aula dentro do curso, junto com o courseId.
          const lessonKey = { courseId: savedCourse.id, position };
          await tx.lesson.upsert({
            where: { courseId_position: lessonKey },
            update: lesson,
            create: { ...lesson, ...lessonKey },
          });
        }
      }
    });

    console.log('Seed finalizado com sucesso!');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exitCode = 1;
});
