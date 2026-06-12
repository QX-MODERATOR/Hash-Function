import * as crypto from 'crypto';
import { HashAlgorithm } from './dto/hash-request.dto';
import { HashService } from './hash.service';

describe('HashService', () => {
  let service: HashService;

  beforeEach(() => {
    service = new HashService();
  });

  it('generates stable SHA-256 hashes', async () => {
    const result = await service.generateHash({
      input: 'Hello, World!',
      algorithm: HashAlgorithm.SHA256,
    });

    expect(result.hash).toBe(
      'dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f',
    );
    expect(result.length).toBe(64);
  });

  it('generates and verifies bcrypt hashes', async () => {
    const result = await service.generateHash({
      input: 'correct horse battery staple',
      algorithm: HashAlgorithm.BCRYPT,
      rounds: 4,
    });

    const comparison = await service.compareHash({
      input: 'correct horse battery staple',
      hash: result.hash,
    });

    expect(result.hash).toMatch(/^\$2[aby]\$/);
    expect(comparison.matches).toBe(true);
  });

  it('reports runtime digest availability', () => {
    const runtimeHasWhirlpool = crypto.getHashes().includes('whirlpool');
    const supported = service.getSupportedAlgorithms();
    const whirlpoolInfo = service
      .getAlgorithmsInfo()
      .find((algorithm) => algorithm.name === HashAlgorithm.WHIRLPOOL);

    expect(supported.includes(HashAlgorithm.WHIRLPOOL)).toBe(
      runtimeHasWhirlpool,
    );
    expect(whirlpoolInfo?.available).toBe(runtimeHasWhirlpool);
  });

  it('rejects compare requests that are not bcrypt hashes', async () => {
    await expect(
      service.compareHash({
        input: 'hello',
        hash: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
      }),
    ).rejects.toThrow('Only bcrypt hashes can be compared.');
  });
});
