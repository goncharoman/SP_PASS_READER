const { app, BrowserWindow, dialog } = require('electron');
const ipcMain = require('electron').ipcMain;
const fs = require('fs');
const path = require('path');
const reader = require('./reader.js').passReader;

let mainWindow;
let xmlFile;
let pdfFile;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.loadFile('./public/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('loadDir', function(event, args) {
  dialog
    .showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    .then(result => {
      if (result.canceled != true) {
        let currentDir = result.filePaths[0];

        xmlFile = null;
        pdfFile = null;

        fs.readdir(currentDir, function(err, files) {
          if (err) {
            alert('FS error');
            return;
          }
          files.forEach(function(file) {
            if (file.match(/.*.pdf$/g) != null) {
              // console.log(file);
              pdfFile = path.join(currentDir, file);
            }
            if (file.match(/.*.xml$/g) != null) {
              xmlFile = path.join(currentDir, file);
              reader(xmlFile);
            }
          });
        });
      }
    })
    .catch(err => {
      alert('Error');
    });
});
