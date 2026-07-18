import argon2 from 'argon2';

const pin = process.argv[2];

if (pin === undefined || !/^\d{4,12}$/.test(pin)) {
  console.error('Usage: npm run security:hash-pin -- <4-to-12-digit-pin>');
  process.exitCode = 1;
} else {
  const hash = await argon2.hash(pin, {
    memoryCost: 19_456,
    parallelism: 1,
    timeCost: 2,
    type: argon2.argon2id,
  });
  console.log(hash);
}
