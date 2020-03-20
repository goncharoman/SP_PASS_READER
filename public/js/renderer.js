const ipcRenr = require('electron').ipcRenderer;

document.getElementById('dirLoad').addEventListener('click', function() {
  ipcRenr.send('loadDir', 'args');
});
