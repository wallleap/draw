var c = document.getElementById('myCanvas');
var ctx = c.getContext('2d'); 
var penBold = document.getElementById('penBold');
var eraserBl = document.getElementById('eraserBl');
var penBoldt = document.getElementById('penBoldt');
var col = document.getElementById('col');
var pencil = document.getElementById('pencil');
var eraser = document.getElementById('eraser');

penBold.onmousedown = function () {
  document.onmousemove = function () {
    penBoldt.value = penBold.value;
  }
}
eraserBl.onmousedown = function () {
  document.onmousemove = function () {
  }
}

penBoldt.onblur = function () {
  penBold.value = penBoldt.value;
}
penBoldt.onkeydown = function (e) {
  if (e.keyCode == 13) {
    penBold.value = penBoldt.value;
  }
}

pencil.onclick = function () {
  c.onmousedown = function (e) {
    var e = e || event;
    var x = e.clientX - c.offsetLeft;
    var y = e.clientY - c.offsetTop;
    ctx.beginPath();
    ctx.moveTo(x, y);
    document.onmousemove = function (e) {

      var e = e || event;
      var x1 = e.clientX - c.offsetLeft;
      var y1 = e.clientY - c.offsetTop;
      ctx.strokeStyle = col.value;
      ctx.lineTo(x1, y1);
      ctx.lineWidth = penBold.value;
      ctx.stroke();

    };
  };
}


eraser.onclick = function () {
  c.onmousedown = function (e) {
    var e = e || event;
    var x = e.clientX - c.offsetLeft;
    var y = e.clientY - c.offsetTop;
    ctx.beginPath();
    ctx.moveTo(x, y);
    document.onmousemove = function (e) {
      var e = e || event;
      var x1 = e.clientX - c.offsetLeft;
      var y1 = e.clientY - c.offsetTop;
      ctx.strokeStyle = 'gray';
      ctx.lineTo(x1, y1);
      ctx.lineWidth = eraserBl.value;
      ctx.stroke();

    };
  };
}


window.onmouseup = function () {

  document.onmousedown = null;
  document.onmousemove = null;
}


var btn = document.getElementById('btn');

btn.onclick = function () {
  var str = load(c);
  var hre = document.createElement("a")
  document.getElementById('hre').href = str;
}

function load(canvas) {
  var load = canvas.toDataURL("image/png");
  return load;
}