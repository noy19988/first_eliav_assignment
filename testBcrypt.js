const bcrypt = require('bcrypt');

async function testBcrypt() {
    const passwordText = 'abcd123';
    const hashedPassword = await bcrypt.hash(passwordText, 10);
    console.log('Password Text:', passwordText);
    console.log('Hashed Password:', hashedPassword);

    const isMatch = await bcrypt.compare(passwordText, hashedPassword);
    console.log('Password matches:', isMatch);
}

testBcrypt();
