class DrawingBoard {
  constructor() {
    this.drawingCanvas = document.getElementById('drawingCanvas');
    this.ctx = this.drawingCanvas.getContext('2d');
    this.bgCanvas = document.getElementById('backgroundCanvas');
    this.bgCtx = this.bgCanvas.getContext('2d');
    this.penBold = document.getElementById('penBold');
    this.eraserBl = document.getElementById('eraserBl');
    this.penBoldt = document.getElementById('penBoldt');
    this.col = document.getElementById('col');
    this.bgCol = document.getElementById('bgCol');
    this.foregroundPreview = document.getElementById('foregroundPreview');
    this.backgroundPreview = document.getElementById('backgroundPreview');
    this.swapColors = document.getElementById('swapColors');
    this.colorPickerPopup = document.getElementById('colorPickerPopup');
    this.colorArea = document.getElementById('colorArea');
    this.colorPickerPointer = document.getElementById('colorPickerPointer');
    this.hueSlider = document.getElementById('hueSlider');
    this.huePointer = document.getElementById('huePointer');
    this.opacitySlider = document.getElementById('opacitySlider');
    this.opacityPointer = document.getElementById('opacityPointer');
    this.pencil = document.getElementById('pencil');
    this.eraser = document.getElementById('eraser');
    this.btn = document.getElementById('btn');
    this.undoBtn = document.getElementById('undo');
    this.clearBtn = document.getElementById('clear');
    this.toggleToolbarBtn = document.getElementById('toggleToolbar');
    this.toolbar = document.getElementById('toolbar');
    this.history = [];
    this.historyIndex = -1;
    this.currentTool = 'pencil';
    this.selectedColorInput = this.col;
    this.currentHue = 0;
    this.opacities = {
      col: 100,
      bgCol: 0
    };
    this.storageReady = false;
    this.init();
  }

  async init() {
    this.resizeCanvas();
    this.updateBackgroundColor();
    this.setupEventListeners();
    this.currentTool = 'pencil';
    document.body.style.cursor = "url(./cur/pencil.cur) 2 28,auto";
    this.drawingCanvas.style.cursor = "url(./cur/pencil.cur) 2 28,auto";
    this.updateToolButtonState();
    this.setupDrawingEvent();
    console.log('初始背景色:', this.bgCol.value);
    console.log('初始背景色透明度:', this.opacities.bgCol);
    console.log('初始前景色:', this.col.value);
    console.log('初始前景色透明度:', this.opacities.col);
    this.updateColorArea();
    await this.loadFromStorage();
    this.storageReady = true;
  }

  async saveToStorage() {
    if (!this.storageReady) return;
    try {
      const historyData = this.history.map(imgData => imgData.data.buffer);
      await localforage.setItem('drawingHistory', historyData);
      await localforage.setItem('historyIndex', this.historyIndex);
      const settings = {
        col: this.col.value,
        bgCol: this.bgCol.value,
        penBold: this.penBold.value,
        eraserBl: this.eraserBl.value,
        opacities: this.opacities,
        currentTool: this.currentTool
      };
      await localforage.setItem('drawingSettings', settings);
      console.log('数据已保存到 localforage');
    } catch (e) {
      console.error('保存到 localforage 失败:', e);
    }
  }

  async loadFromStorage() {
    try {
      const historyData = await localforage.getItem('drawingHistory');
      const historyIndex = await localforage.getItem('historyIndex');
      const settings = await localforage.getItem('drawingSettings');
      if (historyData && historyIndex !== null) {
        this.history = historyData.map(buffer => {
          const imgData = this.ctx.createImageData(
            this.drawingCanvas.width || window.innerWidth,
            this.drawingCanvas.height || window.innerHeight
          );
          imgData.data.set(new Uint8ClampedArray(buffer));
          return imgData;
        });
        this.historyIndex = historyIndex;
        if (this.history.length > 0 && this.historyIndex >= 0) {
          this.ctx.putImageData(this.history[this.historyIndex], 0, 0);
        }
        console.log('历史记录已从 localforage 加载');
      }
      if (settings) {
        this.col.value = settings.col || '#000000';
        this.bgCol.value = settings.bgCol || '#ffffff';
        this.penBold.value = settings.penBold || 1;
        this.eraserBl.value = settings.eraserBl || 10;
        this.penBoldt.value = this.penBold.value;
        this.opacities = settings.opacities || { col: 100, bgCol: 0 };
        this.currentTool = settings.currentTool || 'pencil';
        this.foregroundPreview.style.backgroundColor = this.col.value;
        this.backgroundPreview.style.backgroundColor = this.bgCol.value;
        this.updateToolButtonState();
        this.updateColorPickerFromInput();
        this.updateBackgroundColor();
        console.log('设置已从 localforage 加载');
      }
    } catch (e) {
      console.error('从 localforage 加载失败:', e);
    }
  }

  resizeCanvas() {
    let currentImageData = null;
    try {
      currentImageData = this.ctx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    } catch (e) {
    }

    this.drawingCanvas.width = window.innerWidth;
    this.drawingCanvas.height = window.innerHeight;
    this.bgCanvas.width = window.innerWidth;
    this.bgCanvas.height = window.innerHeight;

    if (currentImageData) {
      try {
        this.ctx.putImageData(currentImageData, 0, 0);
      } catch (e) {
      }
    }

    this.updateBackgroundColor();
  }

  updateColorArea() {
    // 根据当前色相更新颜色选择区域的背景
    // 实现标准颜色选择器布局：
    // 左上角：白色
    // 右上角：纯色相
    // 右下角：黑色
    // 左下角：深色
    this.colorArea.style.background = `linear-gradient(to bottom, #ffffff, #888888, #000000), radial-gradient(circle at right top, hsl(${this.currentHue}, 100%, 50%), transparent)`;
    // this.colorArea.style.background = `linear-gradient(to bottom, #ffffff, #888888, #000000),
    // radial-gradient(circle at right center, hsl(${this.currentHue}, 100%, 50%) -5%, transparent)`;
    this.colorArea.style.backgroundBlendMode = 'multiply';
  }

  updateColorPickerFromInput() {
    // 从输入框获取颜色值
    const color = this.selectedColorInput.value;
    console.log('updateColorPickerFromInput:', color);
    console.log('selectedColorInput:', this.selectedColorInput);
    console.log('selectedColorInput.id:', this.selectedColorInput.id);
    // 解析颜色值
    let r, g, b;
    if (color.startsWith('#')) {
      // 十六进制颜色
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      // 其他颜色格式，使用默认值
      r = 0;
      g = 0;
      b = 0;
    }
    
    // 转换为HSL
    const hsl = this.rgbToHsl(r, g, b);
    this.currentHue = hsl[0];
    console.log('HSL:', hsl);
    
    // 更新颜色选择区域
    this.updateColorArea();
    
    // 更新颜色选择器指针位置
    const saturation = hsl[1] * 100;
    const lightness = hsl[2] * 100;
    this.colorPickerPointer.style.left = `${saturation}%`;
    this.colorPickerPointer.style.top = `${100 - lightness}%`;
    console.log('指针位置:', saturation, lightness);
    
    // 更新色相滑块指针位置
    this.huePointer.style.left = `${(this.currentHue / 360) * 100}%`;
    
    // 更新透明度滑块指针位置，使用当前选中颜色的透明度
    const currentOpacity = this.opacities[this.selectedColorInput.id];
    console.log('当前透明度值:', this.opacities);
    console.log('当前选中颜色的透明度:', currentOpacity);
    this.opacityPointer.style.left = `${currentOpacity}%`;
    // 更新透明度滑块值，确保滑块值与透明度值同步
    this.opacitySlider.value = currentOpacity;
    console.log('透明度:', currentOpacity);
  }

  updateColorFromArea(e) {
    // 获取颜色选择区域的位置和大小
    const rect = this.colorArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log('updateColorFromArea:', x, y);
    
    // 使用 HSB 颜色模型
    const saturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const lightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    const brightness = lightness;
    
    // 更新颜色选择器指针位置
    this.colorPickerPointer.style.left = `${saturation}%`;
    this.colorPickerPointer.style.top = `${100 - brightness}%`;
    console.log('指针位置:', saturation, brightness);
    
    // 转换为RGB
    const rgb = this.hsbToRgb(this.currentHue, saturation / 100, brightness / 2 / 100);
    const hex = this.rgbToHex(rgb[0], rgb[1], rgb[2]);
    
    // 更新选中的颜色输入框
    this.selectedColorInput.value = hex;
    
    // 更新颜色预览，应用当前选中颜色的透明度
    const currentOpacity = this.opacities[this.selectedColorInput.id] / 100;
    const rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${currentOpacity})`;
    if (this.selectedColorInput === this.col) {
      this.foregroundPreview.style.backgroundColor = rgba;
    } else if (this.selectedColorInput === this.bgCol) {
      this.backgroundPreview.style.backgroundColor = rgba;
      this.updateCanvasColor();
    }
  }

  updateHueFromSlider(e) {
    // 获取色相滑块的位置和大小
    const rect = this.hueSlider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // 计算色相
    this.currentHue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    
    // 更新色相滑块指针位置
    this.huePointer.style.left = `${(this.currentHue / 360) * 100}%`;
    
    // 更新颜色选择区域
    this.updateColorArea();
    
    // 重新计算颜色
    const colorAreaRect = this.colorArea.getBoundingClientRect();
    const pointerLeft = parseInt(this.colorPickerPointer.style.left) || 0;
    const pointerTop = parseInt(this.colorPickerPointer.style.top) || 0;
    this.updateColorFromArea({ 
      clientX: colorAreaRect.left + (pointerLeft / 100) * colorAreaRect.width, 
      clientY: colorAreaRect.top + (pointerTop / 100) * colorAreaRect.height
    });
  }

  updateOpacityFromSlider(e) {
    let opacity;
    // 检查事件类型，处理不同的事件
    if (e.type === 'input') {
      // 对于input事件，直接使用滑块的值
      opacity = parseFloat(this.opacitySlider.value);
    } else {
      // 对于鼠标事件，计算透明度
      const rect = this.opacitySlider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      opacity = Math.max(0, Math.min(100, (x / rect.width) * 100));
      // 更新滑块的值，确保滑块位置与透明度值同步
      this.opacitySlider.value = opacity;
    }
    
    // 更新当前选中颜色的透明度值
    this.opacities[this.selectedColorInput.id] = opacity;
    console.log('更新透明度:', this.selectedColorInput.id, ':', opacity);
    console.log('当前透明度值:', this.opacities);
    
    // 更新透明度滑块指针位置
    this.opacityPointer.style.left = `${opacity}%`;
    
    // 直接更新颜色预览，应用新的透明度
    const color = this.selectedColorInput.value;
    let r, g, b;
    if (color.startsWith('#')) {
      // 十六进制颜色
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      // 其他颜色格式，使用默认值
      r = 0;
      g = 0;
      b = 0;
    }
    
    // 更新颜色预览，应用新的透明度
    const rgba = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    console.log('更新颜色预览:', rgba);
    if (this.selectedColorInput === this.col) {
      this.foregroundPreview.style.backgroundColor = rgba;
      console.log('更新前景色预览');
    } else if (this.selectedColorInput === this.bgCol) {
      this.backgroundPreview.style.backgroundColor = rgba;
      console.log('更新背景色预览');
      // 直接更新画布背景，不保存和恢复内容
      // 因为透明度变化应该影响整个画布，包括背景
      this.updateCanvasColor();
    }
  }

  // 实现 hue 转换为 rgb
  hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  hsbToRgb(h, s, brightness) {
    let r, g, b;
    if (s === 0) {
      r = g = b = brightness; // 灰色
    } else {
      // 接着实现 HSB 转换为 RGB 的逻辑
      const q = brightness < 0.5 ? brightness * (1 + s) : brightness + s - brightness * s;
      const p = 2 * brightness - q;
      r = this.hue2rgb(p, q, h/360 + 1/3);
      g = this.hue2rgb(p, q, h/360);
      b = this.hue2rgb(p, q, h/360 - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // 灰色
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h/360 + 1/3);
      g = hue2rgb(p, q, h/360);
      b = hue2rgb(p, q, h/360 - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // 灰色
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return [Math.round(h * 360), s, l];
  }

  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  setupEventListeners() {
    // 窗口大小改变事件
    window.addEventListener('resize', () => {
      console.log('窗口大小改变');
      this.resizeCanvas();
      // 窗口大小改变后，重新保存当前状态
      this.saveState();
    });

    // 铅笔粗细滑块事件
    this.penBold.addEventListener('input', () => {
      this.penBoldt.value = this.penBold.value;
      this.saveToStorage();
    });

    // 铅笔粗细输入框事件
    this.penBoldt.addEventListener('blur', () => {
      this.penBold.value = this.penBoldt.value;
    });

    this.penBoldt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.penBold.value = this.penBoldt.value;
      }
    });

    this.eraserBl.addEventListener('input', () => {
      this.saveToStorage();
    });

    // 铅笔工具事件
    this.pencil.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentTool = 'pencil';
      document.body.style.cursor = "url(./cur/pencil.cur) 2 28,auto";
      this.drawingCanvas.style.cursor = "url(./cur/pencil.cur) 2 28,auto";
      this.updateToolButtonState();
      this.setupDrawingEvent();
    });

    // 橡皮擦工具事件
    this.eraser.addEventListener('click', (e) => {
      e.stopPropagation();
      this.currentTool = 'eraser';
      document.body.style.cursor = "url(./cur/eraser.cur) 2 28,auto";
      this.drawingCanvas.style.cursor = "url(./cur/eraser.cur) 2 28,auto";
      this.updateToolButtonState();
      this.setupDrawingEvent();
      this.saveToStorage();
    });

    // 鼠标抬起事件
    window.addEventListener('mouseup', (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'IMG') {
        console.log('鼠标抬起，保存状态');
        document.onmousedown = null;
        document.onmousemove = null;
        this.ctx.globalCompositeOperation = 'source-over';
        this.saveState();
      }
    });

    // 下载按钮事件
    this.btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.downloadImage();
    });

    // 清屏按钮事件
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearCanvas();
      });
    }

    // 撤销按钮事件
    this.undoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('撤销按钮被点击');
      this.undo();
    });

    // 前景色预览点击事件
    this.foregroundPreview.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('前景色预览被点击');
      this.selectedColorInput = this.col;
      // 显示颜色选择器
      this.colorPickerPopup.classList.add('show');
      // 更新颜色选择器状态
      this.updateColorPickerFromInput();
      console.log('颜色选择器已显示');
    });

    // 背景色预览点击事件
    this.backgroundPreview.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('背景色预览被点击');
      this.selectedColorInput = this.bgCol;
      // 显示颜色选择器
      this.colorPickerPopup.classList.add('show');
      // 更新颜色选择器状态
      this.updateColorPickerFromInput();
      console.log('颜色选择器已显示');
    });

    // 点击页面其他地方关闭颜色选择器
    document.addEventListener('click', (e) => {
      if (!this.colorPickerPopup.contains(e.target) && 
          e.target !== this.foregroundPreview && 
          e.target !== this.backgroundPreview) {
        this.colorPickerPopup.classList.remove('show');
      }
    });

    // 颜色区域点击事件
    this.colorArea.addEventListener('click', (e) => {
      e.stopPropagation();
      this.updateColorFromArea(e);
    });

    // 颜色区域移动事件
    this.colorArea.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const _this = this; // 保存this指向
      const handleMouseMove = (event) => {
        _this.updateColorFromArea(event);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      this.updateColorFromArea(e);
    });

    // 色相滑块点击事件
    this.hueSlider.addEventListener('click', (e) => {
      e.stopPropagation();
      this.updateHueFromSlider(e);
    });

    // 色相滑块移动事件
    this.hueSlider.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const _this = this; // 保存this指向
      const handleMouseMove = (event) => {
        _this.updateHueFromSlider(event);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      this.updateHueFromSlider(e);
    });

    // 透明度滑块点击事件
    this.opacitySlider.addEventListener('click', (e) => {
      e.stopPropagation();
      this.updateOpacityFromSlider(e);
    });

    // 透明度滑块移动事件
    this.opacitySlider.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const _this = this; // 保存this指向
      const handleMouseMove = (event) => {
        _this.updateOpacityFromSlider(event);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      this.updateOpacityFromSlider(e);
    });

    // 透明度滑块输入事件（用于支持键盘操作）
    this.opacitySlider.addEventListener('input', (e) => {
      e.stopPropagation();
      this.updateOpacityFromSlider(e);
    });

    // 前景色输入框事件
    this.col.addEventListener('change', (e) => {
      e.stopPropagation();
      const color = e.target.value;
      this.foregroundPreview.style.backgroundColor = color;
      this.saveToStorage();
    });

    // 背景色输入框事件
    this.bgCol.addEventListener('change', (e) => {
      e.stopPropagation();
      const color = e.target.value;
      this.backgroundPreview.style.backgroundColor = color;
      this.updateCanvasColor();
      this.saveToStorage();
    });

    // 颜色切换按钮事件
    this.swapColors.addEventListener('click', (e) => {
      e.stopPropagation();
      const tempColor = this.col.value;
      this.col.value = this.bgCol.value;
      this.bgCol.value = tempColor;
      this.foregroundPreview.style.backgroundColor = this.col.value;
      this.backgroundPreview.style.backgroundColor = this.bgCol.value;
      this.updateCanvasColor();
      this.saveToStorage();
    });



    // 工具栏切换事件
    this.toggleToolbarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toolbar.classList.toggle('open');
    });
  }

  setupDrawingEvent() {
    const _this = this;
    this.drawingCanvas.onmousedown = (e) => {
      const rect = _this.drawingCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (_this.currentTool === 'pencil') {
        const hexColor = _this.col.value;
        const opacity = _this.opacities.col / 100;
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        _this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        _this.ctx.lineWidth = _this.penBold.value;
        _this.ctx.globalCompositeOperation = 'source-over';
      } else if (_this.currentTool === 'eraser') {
        _this.ctx.globalCompositeOperation = 'destination-out';
        _this.ctx.lineWidth = _this.eraserBl.value;
      }

      _this.ctx.beginPath();
      _this.ctx.moveTo(x, y);

      document.onmousemove = (e) => {
        const rect = _this.drawingCanvas.getBoundingClientRect();
        const x1 = e.clientX - rect.left;
        const y1 = e.clientY - rect.top;

        if (_this.currentTool === 'pencil') {
          const hexColor = _this.col.value;
          const opacity = _this.opacities.col / 100;
          const r = parseInt(hexColor.slice(1, 3), 16);
          const g = parseInt(hexColor.slice(3, 5), 16);
          const b = parseInt(hexColor.slice(5, 7), 16);
          _this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          _this.ctx.lineWidth = _this.penBold.value;
          _this.ctx.globalCompositeOperation = 'source-over';
        } else if (_this.currentTool === 'eraser') {
          _this.ctx.globalCompositeOperation = 'destination-out';
          _this.ctx.lineWidth = _this.eraserBl.value;
        }

        _this.ctx.lineTo(x1, y1);
        _this.ctx.stroke();
      };
    };
  }

  saveState() {
    try {
      const imageData = this.ctx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(imageData);
      this.historyIndex++;
      console.log('保存状态，当前historyIndex:', this.historyIndex, '历史记录长度:', this.history.length);
      this.saveToStorage();
    } catch (e) {
      console.error('保存状态失败:', e);
    }
  }

  undo() {
    console.log('执行撤销操作，当前historyIndex:', this.historyIndex, '历史记录长度:', this.history.length);
    if (this.historyIndex > 0) {
      this.historyIndex--;
      console.log('撤销到索引:', this.historyIndex);
      try {
        const imageData = this.history[this.historyIndex];
        if (this.drawingCanvas.width === imageData.width && this.drawingCanvas.height === imageData.height) {
          this.ctx.putImageData(imageData, 0, 0);
        } else {
          console.error('画布大小与历史记录不匹配，无法撤销');
        }
      } catch (e) {
        console.error('撤销操作失败:', e);
      }
    } else {
      console.log('没有更多可撤销的操作');
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
    this.saveState();
  }

  updateBackgroundColor() {
    this.bgCtx.clearRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

    const color = this.bgCol.value;
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      r = 0;
      g = 0;
      b = 0;
    }

    const opacity = this.opacities.bgCol / 100;
    if (opacity > 0) {
      this.bgCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);
    }
  }

  updateCanvasColor() {
    this.updateBackgroundColor();
  }

  downloadImage() {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = this.drawingCanvas.width;
    compositeCanvas.height = this.drawingCanvas.height;
    const compositeCtx = compositeCanvas.getContext('2d');

    compositeCtx.drawImage(this.bgCanvas, 0, 0);
    compositeCtx.drawImage(this.drawingCanvas, 0, 0);

    const dataURL = compositeCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    link.click();
  }

  updateToolButtonState() {
    // 移除所有工具按钮的激活状态
    this.pencil.classList.remove('active');
    this.eraser.classList.remove('active');
    
    // 为当前工具添加激活状态
    if (this.currentTool === 'pencil') {
      this.pencil.classList.add('active');
    } else if (this.currentTool === 'eraser') {
      this.eraser.classList.add('active');
    }
  }
}

// 初始化画板
window.addEventListener('DOMContentLoaded', () => {
  new DrawingBoard();
});