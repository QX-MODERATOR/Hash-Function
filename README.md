# Hash Function API

A comprehensive NestJS API for generating and comparing hashes using various cryptographic algorithms.

## Features

- **13 Hashing Algorithms** including:
  - **MD5** - Legacy checksum algorithm
  - **SHA Family** - SHA-1, SHA-256, SHA-384, SHA-512
  - **SHA-3 Family** - SHA3-256, SHA3-384, SHA3-512
  - **BLAKE2** - BLAKE2b512, BLAKE2s256 (high-performance hashing)
  - **RIPEMD-160** - Used in Bitcoin addresses
  - **Whirlpool** - 512-bit cryptographic hash
  - **Bcrypt** - Adaptive password hashing

- **RESTful API** with comprehensive endpoints
- **Swagger Documentation** - Interactive API documentation
- **Input Validation** - Type-safe DTOs with validation
- **Multi-hash Generation** - Hash input with all algorithms at once
- **Hash Comparison** - Bcrypt password verification
- **Algorithm Information** - Detailed info about each algorithm

## Installation

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Visit Swagger documentation
open http://localhost:3000/api
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Swagger Documentation
```
http://localhost:3000/api
```

### Available Endpoints

#### 1. Generate Hash
**POST** `/hash/generate`

Generate a hash using a specific algorithm.

**Request Body:**
```json
{
  "input": "Hello, World!",
  "algorithm": "sha256",
  "rounds": 10
}
```

**Supported Algorithms:**
`md5`, `sha1`, `sha256`, `sha384`, `sha512`, `sha3-256`, `sha3-384`, `sha3-512`, `blake2b512`, `blake2s256`, `ripemd160`, `whirlpool`, `bcrypt`

#### 2. Compare Hash (Bcrypt)
**POST** `/hash/compare`

Compare a plain text input with a bcrypt hash.

#### 3. Generate Multiple Hashes
**POST** `/hash/multiple`

Generate hashes using all available algorithms at once.

#### 4. Get Algorithm Information
**GET** `/hash/algorithms`

Get detailed information about all available algorithms including security properties and use cases.

#### 5. Get Supported Algorithms List
**GET** `/hash/algorithms/list`

Get a simple list of all supported algorithm names.

#### 6. Health Check
**GET** `/hash/health`

Check if the service is running.

## Usage Examples

### Using cURL

```bash
# Generate SHA-256 hash
curl -X POST http://localhost:3000/hash/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello, World!", "algorithm": "sha256"}'

# Generate Bcrypt hash with custom rounds
curl -X POST http://localhost:3000/hash/generate \
  -H "Content-Type: application/json" \
  -d '{"input": "myPassword123", "algorithm": "bcrypt", "rounds": 12}'

# Compare Bcrypt hash
curl -X POST http://localhost:3000/hash/compare \
  -H "Content-Type: application/json" \
  -d '{"input": "myPassword123", "hash": "$2b$10$..."}'

# Generate all hashes at once
curl -X POST http://localhost:3000/hash/multiple \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello, World!"}'
```

### Using JavaScript/TypeScript

```typescript
// Generate hash
const response = await fetch('http://localhost:3000/hash/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: 'Hello, World!',
    algorithm: 'sha256'
  })
});
const result = await response.json();
console.log(result.hash);
```

## Algorithm Details

### Cryptographically Secure Algorithms
- **SHA-256, SHA-384, SHA-512** - Industry standard, used in SSL/TLS, Bitcoin
- **SHA3-256, SHA3-384, SHA3-512** - Latest NIST standard
- **BLAKE2b512, BLAKE2s256** - Faster than MD5, SHA-1, SHA-2, SHA-3 while being secure
- **Bcrypt** - Designed for password hashing with adaptive cost factor

### Legacy Algorithms (Not Recommended for Security)
- **MD5** - Known vulnerabilities, use only for checksums
- **SHA-1** - Collision attacks possible, deprecated

### Special Purpose
- **RIPEMD-160** - Used in Bitcoin address generation
- **Whirlpool** - 512-bit hash with strong security properties

## Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Format code
npm run format

# Lint code
npm run lint
```

## Project Structure

```
Hash-Function/
├── src/
│   ├── hash/
│   │   ├── dto/
│   │   │   ├── hash-request.dto.ts    # Request DTOs
│   │   │   └── hash-response.dto.ts   # Response DTOs
│   │   ├── hash.controller.ts          # API endpoints
│   │   ├── hash.service.ts             # Hashing logic
│   │   └── hash.module.ts              # Hash module
│   ├── app.module.ts                   # Root module
│   └── main.ts                         # Application entry point
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## Security Considerations

1. **Password Hashing**: Always use **bcrypt** for password hashing
2. **Legacy Algorithms**: MD5 and SHA-1 should only be used for non-security purposes
3. **Bcrypt Rounds**: Default is 10 rounds. Use 12-14 for higher security
4. **Data Integrity**: Use SHA-256, SHA-512, SHA3-256, or BLAKE2 for file integrity

## License

MIT
