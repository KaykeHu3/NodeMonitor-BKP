const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');

const foldersToWatch = [
  { source: 'C:/Users/Kayke/Desktop/origin-folder', backup: 'C:/Users/Kayke/Desktop/destin-folder' }
];

async function backupFile(sourcePath, backupPath) {
  try {
    await fs.copy(sourcePath, backupPath);
    console.log(`Arquivo copiado de ${sourcePath} para ${backupPath}`);
  } catch (err) {
    console.error(`Erro ao copiar ${sourcePath} para ${backupPath}:`, err);
  }
}

function setupWatcher(sourceFolder, backupFolder) {
  const watcher = chokidar.watch(sourceFolder, { persistent: true });

  watcher
    .on('add', filePath => {
      const relativePath = path.relative(sourceFolder, filePath);
      const backupFilePath = path.join(backupFolder, relativePath);
      backupFile(filePath, backupFilePath);
    })
    .on('change', filePath => {
      const relativePath = path.relative(sourceFolder, filePath);
      const backupFilePath = path.join(backupFolder, relativePath);
      backupFile(filePath, backupFilePath);
    })
    .on('unlink', filePath => {
      const relativePath = path.relative(sourceFolder, filePath);
      const backupFilePath = path.join(backupFolder, relativePath);
      fs.remove(backupFilePath)
        .then(() => console.log(`Arquivo removido do backup: ${backupFilePath}`))
        .catch(err => console.error(`Erro ao remover ${backupFilePath}:`, err));
    });

  console.log(`Monitorando ${sourceFolder} para mudanças...`);
}

foldersToWatch.forEach(({ source, backup }) => {
  setupWatcher(source, backup);
});
