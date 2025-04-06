import fs from 'fs';
import path from 'path';

const ROOT_DIR = './src';
const CLIENT_APIS = ['useEffect', 'useRouter', 'usePathname', 'window', 'localStorage'];

function walk(dir) {
    const files = fs.readdirSync(dir);
    let allFiles = [];

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            allFiles = allFiles.concat(walk(fullPath));
        } else if (fullPath.endsWith('.tsx')) {
            allFiles.push(fullPath);
        }
    }

    return allFiles;
}

function analyzeAndFixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    const trimmed = content.trimStart();
    const isClient = trimmed.startsWith("'use client'") || trimmed.startsWith('"use client"');

    const usesClientAPI = CLIENT_APIS.some(api => content.includes(api));
    if (usesClientAPI && !isClient) {
        console.log(`🛠️  Добавляю 'use client' в: ${filePath}`);

        const lines = content.split('\n');
        const insertIndex = lines.findIndex(line => line.trim() !== '');

        lines.splice(insertIndex, 0, "'use client';");
        const updatedContent = lines.join('\n');

        fs.writeFileSync(filePath, updatedContent, 'utf-8');
    }
}

function run() {
    const files = walk(ROOT_DIR);
    files.forEach(analyzeAndFixFile);
    console.log('\n✅ Готово. Все нужные файлы обновлены.');
}

run();
