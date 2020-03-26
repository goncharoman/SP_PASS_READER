const { app, BrowserWindow, dialog } = require('electron');
const ipcMain = require('electron').ipcMain;
const fs = require('fs');
const path = require('path');
const reader = require('./reader.js').passReader;
const settings = require('./settings.json');
const builder = require('./build-data.js').buildData;

let mainWindow;
let xmlFile;
let pdfFile;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.maximize();
  mainWindow.webContents.openDevTools();

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
              reader(xmlFile, settings.mode, reply => {
                event.returnValue = builder([null], reply, settings.mode);
              });
            }
          });
        });
      }
    })
    .catch(err => {
      alert('Error');
    });
});
