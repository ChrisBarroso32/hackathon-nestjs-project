import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsFutureDate } from '../../../common/decorators/is-future-date.decorator';

export class CreateHackathonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  startsAt: Date;

  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  endsAt: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
