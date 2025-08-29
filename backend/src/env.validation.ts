import { plainToInstance } from 'class-transformer';
import {
  IsHexadecimal,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsHexadecimal()
  @MinLength(2)
  WALLET_PRIVATE_KEY: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  PERPLEXITY_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const constraints = errors.map((e) => Object.values(e.constraints)).flat();
    const message = `Environment validation failed:\n${constraints.join('\n')}\n`;
    throw new Error(message);
  }
  return validatedConfig;
}
