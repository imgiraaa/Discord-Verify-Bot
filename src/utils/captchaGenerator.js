const words = ['discord', 'javascript', 'verifikasi', 'moderasi', 'server', 'komunitas'];

function generateCaptcha(level) {
    let question = '';
    let answer = '';

    switch (level) {
        case 'sedang': // Teks acak 5 karakter
            answer = Math.random().toString(36).substring(2, 7).toUpperCase();
            question = `Silakan ketik teks berikut: **${answer}**`;
            break;
        case 'susah': // Acak kata
            const word = words[Math.floor(Math.random() * words.length)];
            answer = word;
            question = `Susun kembali kata yang diacak ini: **${word.split('').sort(() => 0.5 - Math.random()).join('')}**`;
            break;
        case 'ekstrem': // Operasi matematika 2 digit
            const num1 = Math.floor(Math.random() * 90) + 10;
            const num2 = Math.floor(Math.random() * 90) + 10;
            answer = (num1 + num2).toString();
            question = `Berapakah hasil dari **${num1} + ${num2}**?`;
            break;
        case 'mudah': // Operasi matematika 1 digit
        default:
            const n1 = Math.floor(Math.random() * 9) + 1;
            const n2 = Math.floor(Math.random() * 9) + 1;
            answer = (n1 + n2).toString();
            question = `Berapakah hasil dari **${n1} + ${n2}**?`;
            break;
    }

    return { question, answer };
}

module.exports = { generateCaptcha };
