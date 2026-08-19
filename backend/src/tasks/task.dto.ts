import { IsString, IsOptional, IsArray, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'doing', 'completed', 'on-hold', 'backlog'])
  status?: string;

  @IsOptional()
  @IsEnum(['no-priority', 'urgent', 'high', 'medium', 'low'])
  priority?: string;

  @IsOptional()
  @IsArray()
  members?: string[];

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsString()
  reporter?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  project?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['todo', 'doing', 'completed', 'on-hold', 'backlog'])
  status?: string;

  @IsOptional()
  @IsEnum(['no-priority', 'urgent', 'high', 'medium', 'low'])
  priority?: string;

  @IsOptional()
  @IsArray()
  members?: string[];

  @IsOptional()
  dueDate?: string | null;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsString()
  reporter?: string;

  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsArray()
  resources?: { name: string; url: string }[];

  @IsOptional()
  order?: number;

  @IsOptional()
  @IsArray()
  updates?: { message: string; time: Date }[];
}
