import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateChecklistDto {
  @IsOptional()
  @IsBoolean()
  programmeLance?: boolean;

  @IsOptional()
  @IsBoolean()
  intercesseursEncourages?: boolean;

  @IsOptional()
  @IsBoolean()
  situationsImportantesTraitees?: boolean;

  @IsOptional()
  @IsBoolean()
  messagePublie?: boolean;
}
