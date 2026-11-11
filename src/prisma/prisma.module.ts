// O modulo PrismaModule é responsável por fornecer o serviço PrismaService para toda a aplicação NestJS. Ele é marcado como global, o que significa que qualquer módulo que importe o PrismaModule terá acesso ao PrismaService sem a necessidade de importá-lo explicitamente.
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}