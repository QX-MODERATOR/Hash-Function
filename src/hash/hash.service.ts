import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  HashAlgorithm,
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

@Injectable()
export class HashService {
  /**
   * Generate a hash using the specified algorithm
   */
  async generateHash(hashRequest: HashRequestDto): Promise<HashResponseDto> {
    const { input, algorithm, rounds } = hashRequest;

    let hash: string;

    try {
      switch (algorithm) {
        case HashAlgorithm.MD5:
          hash = crypto.createHash('md5').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA1:
          hash = crypto.createHash('sha1').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA256:
          hash = crypto.createHash('sha256').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA384:
          hash = crypto.createHash('sha384').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA512:
          hash = crypto.createHash('sha512').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA3_256:
          hash = crypto.createHash('sha3-256').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA3_384:
          hash = crypto.createHash('sha3-384').update(input).digest('hex');
          break;

        case HashAlgorithm.SHA3_512:
          hash = crypto.createHash('sha3-512').update(input).digest('hex');
          break;

        case HashAlgorithm.BLAKE2B512:
          hash = crypto.createHash('blake2b512').update(input).digest('hex');
          break;

        case HashAlgorithm.BLAKE2S256:
          hash = crypto.createHash('blake2s256').update(input).digest('hex');
          break;

        case HashAlgorithm.RIPEMD160:
          hash = crypto.createHash('ripemd160').update(input).digest('hex');
          break;

        case HashAlgorithm.WHIRLPOOL:
          hash = crypto.createHash('whirlpool').update(input).digest('hex');
          break;

        case HashAlgorithm.BCRYPT:
          const saltRounds = rounds || 10;
          hash = await bcrypt.hash(input, saltRounds);
          break;

        default:
          throw new BadRequestException(`Unsupported algorithm: ${algorithm}`);
      }

      return {
        algorithm,
        input,
        hash,
        length: hash.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate hash: ${error.message}`,
      );
    }
  }

  /**
   * Compare input with a bcrypt hash
   */
  async compareHash(
    compareDto: CompareHashDto,
  ): Promise<CompareHashResponseDto> {
    try {
      const matches = await bcrypt.compare(compareDto.input, compareDto.hash);
      return {
        matches,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to compare hash: ${error.message}`,
      );
    }
  }

  /**
   * Generate hashes using all available algorithms
   */
  async generateMultipleHashes(
    request: MultiHashRequestDto,
  ): Promise<MultiHashResponseDto> {
    const { input } = request;
    const hashes: Record<string, string> = {};

    // Generate all non-bcrypt hashes
    const algorithms = Object.values(HashAlgorithm).filter(
      (alg) => alg !== HashAlgorithm.BCRYPT,
    );

    for (const algorithm of algorithms) {
      try {
        const result = await this.generateHash({ input, algorithm });
        hashes[algorithm] = result.hash;
      } catch (error) {
        hashes[algorithm] = `Error: ${error.message}`;
      }
    }

    return {
      input,
      hashes,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get information about available algorithms
   */
  getAlgorithmsInfo(): AlgorithmInfoDto[] {
    return [
      {
        name: HashAlgorithm.MD5,
        description:
          'MD5 is a widely used cryptographic hash function producing a 128-bit hash. Note: Not recommended for security purposes due to known vulnerabilities.',
        outputSize: 128,
        secure: false,
        useCases: ['Checksums', 'Legacy systems'],
      },
      {
        name: HashAlgorithm.SHA1,
        description:
          'SHA-1 produces a 160-bit hash. Note: Deprecated for security purposes due to collision attacks.',
        outputSize: 160,
        secure: false,
        useCases: ['Git commits', 'Legacy systems'],
      },
      {
        name: HashAlgorithm.SHA256,
        description:
          'SHA-256 is part of the SHA-2 family and produces a 256-bit hash. Widely used and considered secure.',
        outputSize: 256,
        secure: true,
        useCases: [
          'Digital signatures',
          'SSL certificates',
          'Blockchain',
          'Data integrity',
        ],
      },
      {
        name: HashAlgorithm.SHA384,
        description:
          'SHA-384 is part of the SHA-2 family and produces a 384-bit hash. Offers higher security than SHA-256.',
        outputSize: 384,
        secure: true,
        useCases: ['High-security applications', 'Digital signatures'],
      },
      {
        name: HashAlgorithm.SHA512,
        description:
          'SHA-512 is part of the SHA-2 family and produces a 512-bit hash. Offers the highest security in SHA-2 family.',
        outputSize: 512,
        secure: true,
        useCases: [
          'High-security applications',
          'Digital signatures',
          'Cryptographic protocols',
        ],
      },
      {
        name: HashAlgorithm.SHA3_256,
        description:
          'SHA3-256 is part of the SHA-3 family (Keccak) and produces a 256-bit hash. Different construction than SHA-2.',
        outputSize: 256,
        secure: true,
        useCases: [
          'Modern cryptographic applications',
          'Blockchain',
          'Data integrity',
        ],
      },
      {
        name: HashAlgorithm.SHA3_384,
        description:
          'SHA3-384 is part of the SHA-3 family and produces a 384-bit hash.',
        outputSize: 384,
        secure: true,
        useCases: ['High-security applications', 'Cryptographic protocols'],
      },
      {
        name: HashAlgorithm.SHA3_512,
        description:
          'SHA3-512 is part of the SHA-3 family and produces a 512-bit hash.',
        outputSize: 512,
        secure: true,
        useCases: ['High-security applications', 'Cryptographic protocols'],
      },
      {
        name: HashAlgorithm.BLAKE2B512,
        description:
          'BLAKE2b is a cryptographic hash function faster than MD5, SHA-1, SHA-2, and SHA-3, yet is at least as secure as SHA-3.',
        outputSize: 512,
        secure: true,
        useCases: [
          'High-performance applications',
          'Data integrity',
          'Digital signatures',
        ],
      },
      {
        name: HashAlgorithm.BLAKE2S256,
        description:
          'BLAKE2s is optimized for 8- to 32-bit platforms and produces a 256-bit hash.',
        outputSize: 256,
        secure: true,
        useCases: [
          'IoT devices',
          'Embedded systems',
          'Mobile applications',
        ],
      },
      {
        name: HashAlgorithm.RIPEMD160,
        description:
          'RIPEMD-160 produces a 160-bit hash and was designed as a secure alternative to MD5 and SHA-1.',
        outputSize: 160,
        secure: true,
        useCases: ['Bitcoin addresses', 'Cryptocurrency'],
      },
      {
        name: HashAlgorithm.WHIRLPOOL,
        description:
          'Whirlpool is a cryptographic hash function producing a 512-bit hash, designed after the Square block cipher.',
        outputSize: 512,
        secure: true,
        useCases: ['Digital signatures', 'Data integrity'],
      },
      {
        name: HashAlgorithm.BCRYPT,
        description:
          'Bcrypt is a password-hashing function designed to be slow and resistant to brute-force attacks. Uses adaptive cost factor.',
        outputSize: 184,
        secure: true,
        useCases: ['Password hashing', 'User authentication'],
      },
    ];
  }

  /**
   * Get list of all supported algorithms
   */
  getSupportedAlgorithms(): string[] {
    return Object.values(HashAlgorithm);
  }

  /**
   * Hash a file content
   */
  async hashFileContent(
    content: Buffer,
    algorithm: HashAlgorithm,
  ): Promise<string> {
    if (algorithm === HashAlgorithm.BCRYPT) {
      throw new BadRequestException(
        'BCRYPT is not suitable for file hashing. Use a different algorithm.',
      );
    }

    try {
      const hash = crypto
        .createHash(algorithm.replace('sha3-', 'sha3-').replace('blake2', 'blake2'))
        .update(content)
        .digest('hex');
      return hash;
    } catch (error) {
      throw new BadRequestException(
        `Failed to hash file content: ${error.message}`,
      );
    }
  }
}
