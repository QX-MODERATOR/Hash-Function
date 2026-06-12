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

const DIGEST_ALGORITHMS: Partial<Record<HashAlgorithm, string>> = {
  [HashAlgorithm.MD5]: 'md5',
  [HashAlgorithm.SHA1]: 'sha1',
  [HashAlgorithm.SHA256]: 'sha256',
  [HashAlgorithm.SHA384]: 'sha384',
  [HashAlgorithm.SHA512]: 'sha512',
  [HashAlgorithm.SHA3_256]: 'sha3-256',
  [HashAlgorithm.SHA3_384]: 'sha3-384',
  [HashAlgorithm.SHA3_512]: 'sha3-512',
  [HashAlgorithm.BLAKE2B512]: 'blake2b512',
  [HashAlgorithm.BLAKE2S256]: 'blake2s256',
  [HashAlgorithm.RIPEMD160]: 'ripemd160',
  [HashAlgorithm.WHIRLPOOL]: 'whirlpool',
};

const BCRYPT_DEFAULT_ROUNDS = 10;
const BCRYPT_MIN_ROUNDS = 4;
const BCRYPT_MAX_ROUNDS = 31;

const ALGORITHM_INFO: Omit<AlgorithmInfoDto, 'available'>[] = [
  {
    name: HashAlgorithm.MD5,
    category: 'Legacy',
    description:
      'MD5 produces a 128-bit hash. It is fast, but it has known collision weaknesses and should only be used for checksums or compatibility.',
    outputSize: 128,
    secure: false,
    useCases: ['Checksums', 'Legacy systems'],
    warning: 'Not suitable for security-sensitive integrity checks.',
  },
  {
    name: HashAlgorithm.SHA1,
    category: 'Legacy',
    description:
      'SHA-1 produces a 160-bit hash. It is deprecated for security purposes because practical collision attacks exist.',
    outputSize: 160,
    secure: false,
    useCases: ['Legacy systems', 'Compatibility checks'],
    warning: 'Deprecated for cryptographic security.',
  },
  {
    name: HashAlgorithm.SHA256,
    category: 'SHA-2',
    description:
      'SHA-256 is a SHA-2 digest that produces a 256-bit hash and is widely used for signatures, certificates, and data integrity.',
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
    category: 'SHA-2',
    description:
      'SHA-384 is a SHA-2 digest with a 384-bit output and a larger internal state than SHA-256.',
    outputSize: 384,
    secure: true,
    useCases: ['High-security applications', 'Digital signatures'],
  },
  {
    name: HashAlgorithm.SHA512,
    category: 'SHA-2',
    description:
      'SHA-512 is a SHA-2 digest with a 512-bit output and strong performance on 64-bit systems.',
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
    category: 'SHA-3',
    description:
      'SHA3-256 is a Keccak-based digest standardized as SHA-3, with a different construction than SHA-2.',
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
    category: 'SHA-3',
    description:
      'SHA3-384 is a SHA-3 digest with a 384-bit output for higher assurance use cases.',
    outputSize: 384,
    secure: true,
    useCases: ['High-security applications', 'Cryptographic protocols'],
  },
  {
    name: HashAlgorithm.SHA3_512,
    category: 'SHA-3',
    description:
      'SHA3-512 is a SHA-3 digest with a 512-bit output and strong collision resistance.',
    outputSize: 512,
    secure: true,
    useCases: ['High-security applications', 'Cryptographic protocols'],
  },
  {
    name: HashAlgorithm.BLAKE2B512,
    category: 'BLAKE2',
    description:
      'BLAKE2b is a high-performance cryptographic hash optimized for 64-bit platforms.',
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
    category: 'BLAKE2',
    description:
      'BLAKE2s is optimized for 8- to 32-bit platforms and produces a 256-bit hash.',
    outputSize: 256,
    secure: true,
    useCases: ['IoT devices', 'Embedded systems', 'Mobile applications'],
  },
  {
    name: HashAlgorithm.RIPEMD160,
    category: 'RIPEMD',
    description:
      'RIPEMD-160 produces a 160-bit hash and is best known from cryptocurrency address workflows.',
    outputSize: 160,
    secure: true,
    useCases: ['Bitcoin addresses', 'Cryptocurrency'],
  },
  {
    name: HashAlgorithm.WHIRLPOOL,
    category: 'Whirlpool',
    description:
      'Whirlpool is a 512-bit cryptographic hash. Availability depends on the Node.js/OpenSSL runtime.',
    outputSize: 512,
    secure: true,
    useCases: ['Digital signatures', 'Data integrity'],
  },
  {
    name: HashAlgorithm.BCRYPT,
    category: 'Password',
    description:
      'Bcrypt is an adaptive password-hashing function designed to be intentionally slow against brute-force attacks.',
    outputSize: 184,
    secure: true,
    useCases: ['Password hashing', 'User authentication'],
  },
];

@Injectable()
export class HashService {
  private readonly runtimeDigests = new Set(crypto.getHashes());

  async generateHash(hashRequest: HashRequestDto): Promise<HashResponseDto> {
    const { input, algorithm, rounds } = hashRequest;

    try {
      const hash =
        algorithm === HashAlgorithm.BCRYPT
          ? await this.generateBcryptHash(input, rounds)
          : this.generateDigest(input, algorithm);

      return {
        algorithm,
        input,
        hash,
        length: hash.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to generate hash: ${error.message}`,
      );
    }
  }

  async compareHash(
    compareDto: CompareHashDto,
  ): Promise<CompareHashResponseDto> {
    try {
      if (!compareDto.hash.startsWith('$2')) {
        throw new BadRequestException('Only bcrypt hashes can be compared.');
      }

      const matches = await bcrypt.compare(compareDto.input, compareDto.hash);
      return {
        matches,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(`Failed to compare hash: ${error.message}`);
    }
  }

  async generateMultipleHashes(
    request: MultiHashRequestDto,
  ): Promise<MultiHashResponseDto> {
    const { input } = request;
    const hashes: Record<string, string> = {};
    const algorithms = this.getSupportedAlgorithms().filter(
      (algorithm) => algorithm !== HashAlgorithm.BCRYPT,
    );

    for (const algorithm of algorithms) {
      const result = await this.generateHash({ input, algorithm });
      hashes[algorithm] = result.hash;
    }

    return {
      input,
      hashes,
      timestamp: new Date().toISOString(),
    };
  }

  getAlgorithmsInfo(): AlgorithmInfoDto[] {
    return ALGORITHM_INFO.map((algorithm) => ({
      ...algorithm,
      available: this.isAlgorithmAvailable(algorithm.name as HashAlgorithm),
    }));
  }

  getSupportedAlgorithms(): HashAlgorithm[] {
    return Object.values(HashAlgorithm).filter((algorithm) =>
      this.isAlgorithmAvailable(algorithm),
    );
  }

  async hashFileContent(
    content: Buffer,
    algorithm: HashAlgorithm,
  ): Promise<string> {
    if (algorithm === HashAlgorithm.BCRYPT) {
      throw new BadRequestException(
        'BCRYPT is not suitable for file hashing. Use a different algorithm.',
      );
    }

    return this.generateDigest(content, algorithm);
  }

  private generateDigest(input: string | Buffer, algorithm: HashAlgorithm) {
    const digest = DIGEST_ALGORITHMS[algorithm];

    if (!digest) {
      throw new BadRequestException(`Unsupported algorithm: ${algorithm}`);
    }

    if (!this.runtimeDigests.has(digest)) {
      throw new BadRequestException(
        `${algorithm} is not available in this Node.js/OpenSSL runtime.`,
      );
    }

    return crypto.createHash(digest).update(input).digest('hex');
  }

  private async generateBcryptHash(input: string, rounds?: number) {
    const saltRounds = rounds ?? BCRYPT_DEFAULT_ROUNDS;

    if (
      !Number.isInteger(saltRounds) ||
      saltRounds < BCRYPT_MIN_ROUNDS ||
      saltRounds > BCRYPT_MAX_ROUNDS
    ) {
      throw new BadRequestException(
        `Bcrypt rounds must be an integer from ${BCRYPT_MIN_ROUNDS} to ${BCRYPT_MAX_ROUNDS}.`,
      );
    }

    return bcrypt.hash(input, saltRounds);
  }

  private isAlgorithmAvailable(algorithm: HashAlgorithm) {
    if (algorithm === HashAlgorithm.BCRYPT) {
      return true;
    }

    const digest = DIGEST_ALGORITHMS[algorithm];
    return Boolean(digest && this.runtimeDigests.has(digest));
  }
}
