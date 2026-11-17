// O health.controller.spec.ts testa o HealthController, que é responsável por fornecer informações sobre o status da API e do banco de dados.
import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

// Mantém o token de injeção sem carregar o serviço real e o Prisma.
jest.mock('./health.service', () => ({
  HealthService: class HealthService {},}));

describe('HealthController', () => {
  let controller: HealthController;
  const check = jest.fn<ReturnType<HealthService['check']>, []>();

  const mockResponse = {
    status: 'ok',
    application: 'DevFlix API',
    database: 'connected',
    timestamp: '2026-11-03T18:00:00.000Z',
  };

  beforeEach(async () => {
    check.mockReset().mockResolvedValue(mockResponse);

    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: { check } }],
    }).compile();

    controller = module.get(HealthController);
  });

  it('deve retornar o status da API', async () => {
    const result = await controller.check();

    expect(result).toEqual(mockResponse);
    expect(check).toHaveBeenCalledTimes(1);
  });
});
