
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

// Impede o carregamento do Prisma e de suas dependências
jest.mock('./health.service', () => ({
  HealthService: class HealthService {
    check = jest.fn();
  },
}));

import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: { check: jest.Mock };

  const mockResponse = {
    status: 'ok',
    application: 'DevFlix API',
    database: 'connected',
    timestamp: '2026-11-03T18:00:00.000Z',
  };

  beforeEach(async () => {
    healthService = {
      check: jest.fn().mockResolvedValue(mockResponse),
    };

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [HealthController],
        providers: [
          {
            provide: HealthService,
            useValue: healthService,
          },
        ],
      }).compile();

    controller = module.get<HealthController>(
      HealthController,
    );
  });

  it('deve retornar o status da API', async () => {
    const result = await controller.check();

    expect(result).toEqual(mockResponse);
    expect(healthService.check).toHaveBeenCalledTimes(1);
  });
});
