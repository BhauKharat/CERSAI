// Quick test script to check Digipin validation
const testValue = '67C-45F-7JMT';
const pattern = /^[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{3}-[2-9CFJKLMPT]{4}$/;

console.log('Test value:', testValue);
console.log('Pattern:', pattern);
console.log('Does it match?', pattern.test(testValue));

// Check each character's code
console.log('\nCharacter codes:');
for (let i = 0; i < testValue.length; i++) {
  const char = testValue[i];
  const code = char.charCodeAt(0);
  console.log(
    `Position ${i}: '${char}' = ${code} (${code === 45 ? 'DASH' : code === 126 ? 'TILDE' : 'OTHER'})`
  );
}

// Test with different values
const testCases = [
  '67C-45F-7JMT', // with regular dash (should PASS)
  '67C~45F-7JMT', // with tilde (should FAIL)
  '29C-45F-7JMT', // valid example (should PASS)
];

console.log('\nTest cases:');
testCases.forEach((value) => {
  console.log(`"${value}" => ${pattern.test(value) ? '✓ PASS' : '✗ FAIL'}`);
});
