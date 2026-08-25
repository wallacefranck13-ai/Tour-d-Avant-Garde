import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * Optionnelle par design : `page`/`limit` absents => l'appelant garde le
 * comportement historique (tableau brut). Ils ne deviennent actifs que si
 * fournis explicitement, pour ne pas casser le frontend/mobile existants.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
