import { Test, TestingModule } from '@nestjs/testing';
import { HackathonController } from './hackathon.controller';
import { HackathonService } from './hackathon.service';

describe('HackathonController', () => {
  let controller: HackathonController;
  const service = { create: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HackathonController],
      providers: [{ provide: HackathonService, useValue: service }],
    }).compile();

    controller = module.get(HackathonController);
  });

  it('passes the logged-in user id as the author id on create', async () => {
    const dto = {
      name: 'Hack',
      startsAt: new Date('2030-01-01'),
      endsAt: new Date('2030-01-02'),
    };
    service.create.mockResolvedValue({ id: 'h1' });

    await controller.create(dto, { user: { id: 'user-1' } } as never);

    expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
  });
});
