import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum HashAlgorithm {
  MD5 = 'md5',
  SHA1 = 'sha1',
  SHA256 = 'sha256',
  SHA384 = 'sha384',
  SHA512 = 'sha512',
  SHA3_256 = 'sha3-256',
  SHA3_384 = 'sha3-384',
  SHA3_512 = 'sha3-512',
  BLAKE2B512 = 'blake2b512',
  BLAKE2S256 = 'blake2s256',
  RIPEMD160 = 'ripemd160',
  WHIRLPOOL = 'whirlpool',
  BCRYPT = 'bcrypt',
}

export class HashRequestDto {
  @ApiProperty({
    description: 'The input text to be hashed',
    example: 'Hello, World!',
  })
  @IsString()
  @IsNotEmpty()
  input: string;

  @ApiProperty({
    description: 'The hashing algorithm to use',
    enum: HashAlgorithm,
    example: HashAlgorithm.SHA256,
  })
  @IsEnum(HashAlgorithm)
  algorithm: HashAlgorithm;

  @ApiProperty({
    description:
      'Number of rounds for bcrypt (only applicable for bcrypt algorithm)',
    example: 10,
    required: false,
    minimum: 4,
    maximum: 31,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(31)
  rounds?: number;
}

export class CompareHashDto {
  @ApiProperty({
    description: 'The input text to compare',
    example: 'Hello, World!',
  })
  @IsString()
  @IsNotEmpty()
  input: string;

  @ApiProperty({
    description: 'The hash to compare against',
    example: '$2b$10$...',
  })
  @IsString()
  @IsNotEmpty()
  hash: string;
}

export class MultiHashRequestDto {
  @ApiProperty({
    description: 'The input text to be hashed with multiple algorithms',
    example: 'Hello, World!',
  })
  @IsString()
  @IsNotEmpty()
  input: string;
}
