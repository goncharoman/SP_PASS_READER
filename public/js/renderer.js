const ipcRenderer = require('electron').ipcRenderer;
// load jQuery
window.$ = window.jQuery = require('jquery');

function createContent(dataList = null) {
  $('#contentWindow').empty();
  $('#contentWindow').load('./templates/table.html', () => {
    for (let elem of dataList.params) {
      console.log(elem);
      $('#params').append(
        '<div class="row">' +
          '<div class="cell">' +
          elem[0] +
          '</div>' +
          '<div class="cell">' +
          elem[1] +
          '</div>' +
          '</div>'
      );
    }
  });
}

$('#dirLoad').click(function() {
  createContent(ipcRenderer.sendSync('loadDir'));
});
