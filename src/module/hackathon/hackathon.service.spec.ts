import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../lib/database/prisma.service';
import { HackathonService } from './hackathon.service';

describe('HackathonService', () => {
  let service: HackathonService;
  const hackathon = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const participantCreate = jest.fn();

  const start = new Date('2030-01-01T00:00:00Z');
  const end = new Date('2030-01-02T00:00:00Z');
  const stored = { id: 'h1', startDate: start, endDate: end };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HackathonService,
        {
          provide: PrismaService,
          useValue: {
            hackathon,
            hackathonParticipant: { create: participantCreate },
          },
        },
      ],
    }).compile();

    service = module.get(HackathonService);
  });

  it('creates with the author id and maps startsAt/endsAt to the model', async () => {
    hackathon.create.mockResolvedValue(stored);

    await service.create(
      { name: 'Hack', startsAt: start, endsAt: end },
      'user-1',
    );

    expect(hackathon.create).toHaveBeenCalledWith({
      data: { name: 'Hack', startDate: start, endDate: end, authorId: 'user-1' },
    });
  });

  it('rejects a range where endsAt is not after startsAt', () => {
    expect(() =>
      service.create({ name: 'Hack', startsAt: end, endsAt: start }, 'user-1'),
    ).toThrow(BadRequestException);
  });

  it('throws NotFound when the hackathon does not exist', async () => {
    hackathon.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('validates a partial update against the stored dates', async () => {
    hackathon.findUnique.mockResolvedValue(stored);

    await expect(
      service.update('h1', { startsAt: new Date('2030-02-01T00:00:00Z') }),
    ).rejects.toThrow(BadRequestException);
    expect(hackathon.update).not.toHaveBeenCalled();
  });

  it('updates only the provided fields', async () => {
    hackathon.findUnique.mockResolvedValue(stored);
    hackathon.update.mockResolvedValue(stored);

    await service.update('h1', { name: 'New name' });

    expect(hackathon.update).toHaveBeenCalledWith({
      where: { id: 'h1' },
      data: { name: 'New name', startDate: undefined, endDate: undefined },
    });
  });

  describe('join', () => {
    const open = {
      ...stored,
      isActive: true,
      endDate: new Date(Date.now() + 60_000),
    };

    it('creates and returns the participant record', async () => {
      const participant = { id: 'p1', hackathonId: 'h1', userId: 'user-1' };
      hackathon.findUnique.mockResolvedValue(open);
      participantCreate.mockResolvedValue(participant);

      await expect(service.join('h1', 'user-1')).resolves.toBe(participant);
      expect(participantCreate).toHaveBeenCalledWith({
        data: { hackathonId: 'h1', userId: 'user-1' },
      });
    });

    it('throws NotFound when the hackathon does not exist', async () => {
      hackathon.findUnique.mockResolvedValue(null);

      await expect(service.join('h1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects an inactive hackathon', async () => {
      hackathon.findUnique.mockResolvedValue({ ...open, isActive: false });

      await expect(service.join('h1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(participantCreate).not.toHaveBeenCalled();
    });

    it('rejects a hackathon that has already ended', async () => {
      hackathon.findUnique.mockResolvedValue({
        ...open,
        endDate: new Date(Date.now() - 1000),
      });

      await expect(service.join('h1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(participantCreate).not.toHaveBeenCalled();
    });

    it('maps the unique-constraint violation to BadRequest', async () => {
      hackathon.findUnique.mockResolvedValue(open);
      participantCreate.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.join('h1', 'user-1')).rejects.toThrow(
        'You have already joined this hackathon',
      );
    });

    it('rethrows unexpected errors', async () => {
      hackathon.findUnique.mockResolvedValue(open);
      participantCreate.mockRejectedValue(new Error('db down'));

      await expect(service.join('h1', 'user-1')).rejects.toThrow('db down');
    });
  });

  it('deletes an existing hackathon', async () => {
    hackathon.findUnique.mockResolvedValue(stored);
    hackathon.delete.mockResolvedValue(stored);

    await service.remove('h1');

    expect(hackathon.delete).toHaveBeenCalledWith({ where: { id: 'h1' } });
  });
});
