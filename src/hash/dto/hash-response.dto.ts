import { ApiProperty } from '@nestjs/swagger';

export class HashResponseDto {
  @ApiProperty({
    description: 'The hashing algorithm used',
    example: 'sha256',
  })
  algorithm: string;

  @ApiProperty({
    description: 'The original input text',
    example: 'Hello, World!',
  })
  input: string;

  @ApiProperty({
    description: 'The resulting hash',
    example: 'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
  })
  hash: string;

  @ApiProperty({
    description: 'The length of the hash in characters',
    example: 64,
  })
  length: number;

  @ApiProperty({
    description: 'Timestamp when the hash was generated',
    example: '2025-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

export class CompareHashResponseDto {
  @ApiProperty({
    description: 'Whether the input matches the hash',
    example: true,
  })
  matches: boolean;

  @ApiProperty({
    description: 'Timestamp when the comparison was performed',
    example: '2025-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

export class MultiHashResponseDto {
  @ApiProperty({
    description: 'The original input text',
    example: 'Hello, World!',
  })
  input: string;

  @ApiProperty({
    description: 'Object containing all hash results',
    example: {
      md5: '65a8e27d8879283831b664bd8b7f0ad4',
      sha256:
        'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
    },
  })
  hashes: Record<string, string>;

  @ApiProperty({
    description: 'Timestamp when the hashes were generated',
    example: '2025-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

export class AlgorithmInfoDto {
  @ApiProperty({
    description: 'The algorithm name',
    example: 'sha256',
  })
  name: string;

  @ApiProperty({
    description: 'Algorithm family or primary category',
    example: 'SHA-2',
  })
  category: string;

  @ApiProperty({
    description: 'Description of the algorithm',
    example: 'SHA-256 is a cryptographic hash function from the SHA-2 family',
  })
  description: string;

  @ApiProperty({
    description: 'Output size in bits',
    example: 256,
  })
  outputSize: number;

  @ApiProperty({
    description: 'Whether the algorithm is cryptographically secure',
    example: true,
  })
  secure: boolean;

  @ApiProperty({
    description: 'Whether the algorithm is available in the current runtime',
    example: true,
  })
  available: boolean;

  @ApiProperty({
    description: 'Common use cases',
    example: ['Password hashing', 'Data integrity', 'Digital signatures'],
  })
  useCases: string[];

  @ApiProperty({
    description: 'Security or runtime note when one applies',
    example: 'Deprecated for cryptographic security.',
    required: false,
  })
  warning?: string;
}
