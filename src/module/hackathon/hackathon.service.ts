import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../lib/database/prisma.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Injectable()
export class HackathonService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hackathon.findMany({ orderBy: { startDate: 'desc' } });
  }

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({ where: { id } });
    if (!hackathon) {
      throw new NotFoundException(`Hackathon with id "${id}" not found`);
    }
    return hackathon;
  }

  create(dto: CreateHackathonDto, authorId: string) {
    const { startsAt, endsAt, ...rest } = dto;
    this.assertValidRange(startsAt, endsAt);

    return this.prisma.hackathon.create({
      data: { ...rest, startDate: startsAt, endDate: endsAt, authorId },
    });
  }

  async update(id: string, dto: UpdateHackathonDto) {
    const current = await this.findOne(id);
    const { startsAt, endsAt, ...rest } = dto;
    // A partial update can change only one end, so check against the stored one.
    this.assertValidRange(
      startsAt ?? current.startDate,
      endsAt ?? current.endDate,
    );

    return this.prisma.hackathon.update({
      where: { id },
      data: { ...rest, startDate: startsAt, endDate: endsAt },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hackathon.delete({ where: { id } });
  }

  async join(hackathonId: string, userId: string) {
    const hackathon = await this.findOne(hackathonId);
    if (!hackathon.isActive) {
      throw new BadRequestException('Hackathon is not active');
    }
    if (hackathon.endDate <= new Date()) {
      throw new BadRequestException('Hackathon has already ended');
    }

    try {
      return await this.prisma.hackathonParticipant.create({
        data: { hackathonId, userId },
      });
    } catch (error) {
      // Relies on the @@unique([hackathonId, userId]) constraint instead of a
      // read-then-write check, so concurrent joins cannot both succeed.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'You have already joined this hackathon',
        );
      }
      throw error;
    }
  }

  private assertValidRange(start: Date, end: Date) {
    if (end <= start) {
      throw new BadRequestException('endsAt must be after startsAt');
    }
  }
}
