const watch = require('node-watch');
const fs = require('fs-extra');
const path = require('path');

const foldersMap = {
    'C:/Users/Kayke/Desktop/origin-folder': 'C:/Users/Kayke/Desktop/destin-folder'
};

async function moveFileWithDelay(srcPath, destPath, delay) {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await fs.move(srcPath, destPath);
                console.log(`Arquivo movido: ${srcPath}`);
                resolve();
            } catch (err) {
                console.error(`Erro ao mover o arquivo: ${err.message}`);
                reject(err);
            }
        }, delay);
    });
}

async function isFileNew(filePath) {
    try {
        const stats = await fs.stat(filePath);
        const now = new Date();
        const creationTime = new Date(stats.birthtime);

        return (now - creationTime) < 10000;
    } catch (err) {
        console.error(`Erro ao verificar o arquivo: ${err.message}`);
        return false;
    }
}

function startWatchingFolders() {
    Object.keys(foldersMap).forEach(sourceFolder => {
        const destinationFolder = foldersMap[sourceFolder];

        watch(sourceFolder, { recursive: false }, async (event, filePath) => {
            if (event === 'update' && filePath.endsWith('.txt')) {
                if (!await isFileNew(filePath)) {
                    const fileName = path.basename(filePath);
                    const destPath = path.join(destinationFolder, fileName);
                    console.log(`Arquivo modificado em ${sourceFolder}: ${filePath}`);
                    await moveFileWithDelay(filePath, destPath, 5000);
                } else {
                    console.log(`Arquivo ignorado (novo): ${filePath}`);
                }
            }
        });

        console.log(`Monitorando mudanças em: ${sourceFolder}`);
    });
}

startWatchingFolders();

process.on('SIGINT', () => {
    console.log('Monitoramento interrompido.');
    process.exit();
});
