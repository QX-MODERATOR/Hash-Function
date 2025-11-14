import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { HashService } from './hash.service';
import {
  HashRequestDto,
  CompareHashDto,
  MultiHashRequestDto,
} from './dto/hash-request.dto';
import {
  HashResponseDto,
  CompareHashResponseDto,
  MultiHashResponseDto,
  AlgorithmInfoDto,
} from './dto/hash-response.dto';

@ApiTags('Hashing')
@Controller('hash')
export class HashController {
  constructor(private readonly hashService: HashService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate a hash',
    description:
      'Generate a hash using the specified algorithm (MD5, SHA1, SHA256, SHA384, SHA512, SHA3-256, SHA3-384, SHA3-512, BLAKE2b512, BLAKE2s256, RIPEMD160, Whirlpool, or Bcrypt)',
  })
  @ApiBody({ type: HashRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Hash generated successfully',
    type: HashResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or algorithm',
  })
  async generateHash(
    @Body() hashRequest: HashRequestDto,
  ): Promise<HashResponseDto> {
    return this.hashService.generateHash(hashRequest);
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare input with bcrypt hash',
    description:
      'Compare a plain text input with a bcrypt hash to verify if they match',
  })
  @ApiBody({ type: CompareHashDto })
  @ApiResponse({
    status: 200,
    description: 'Comparison completed successfully',
    type: CompareHashResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or hash',
  })
  async compareHash(
    @Body() compareDto: CompareHashDto,
  ): Promise<CompareHashResponseDto> {
    return this.hashService.compareHash(compareDto);
  }

  @Post('multiple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate hashes with all algorithms',
    description:
      'Generate hashes for the input text using all available algorithms (except bcrypt)',
  })
  @ApiBody({ type: MultiHashRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Hashes generated successfully',
    type: MultiHashResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
  })
  async generateMultipleHashes(
    @Body() request: MultiHashRequestDto,
  ): Promise<MultiHashResponseDto> {
    return this.hashService.generateMultipleHashes(request);
  }

  @Get('algorithms')
  @ApiOperation({
    summary: 'Get information about available algorithms',
    description:
      'Retrieve detailed information about all available hashing algorithms including their properties and use cases',
  })
  @ApiResponse({
    status: 200,
    description: 'Algorithm information retrieved successfully',
    type: [AlgorithmInfoDto],
  })
  getAlgorithmsInfo(): AlgorithmInfoDto[] {
    return this.hashService.getAlgorithmsInfo();
  }

  @Get('algorithms/list')
  @ApiOperation({
    summary: 'Get list of supported algorithms',
    description: 'Get a simple list of all supported algorithm names',
  })
  @ApiResponse({
    status: 200,
    description: 'Algorithm list retrieved successfully',
    type: [String],
  })
  getSupportedAlgorithms(): string[] {
    return this.hashService.getSupportedAlgorithms();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the hashing service is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  healthCheck(): { status: string; timestamp: string; service: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Hash Function API',
    };
  }
}
