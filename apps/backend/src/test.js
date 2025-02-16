const bcrypt = require('bcryptjs');

async function testBcrypt() {
    const plainPassword = "admin";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log('Оригинальный пароль:', plainPassword);
    console.log('Хэш пароля:', hashedPassword);

    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('Пароль валиден?', isValid);
}

testBcrypt();
