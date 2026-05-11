let capture;
let faceMesh;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let earringImg;

function preload() {
  // 載入耳環圖片
  earringImg = loadImage('pic/acc1_ring.png');
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏預設生成的 video 標籤，避免重疊
  capture.hide();

  // 初始化 faceMesh 並開始偵測
  faceMesh = ml5.faceMesh(options);
  faceMesh.detectStart(capture, gotFaces);
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小以維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  push();
  // 將座標原點移至畫面中心
  translate(width / 2, height / 2);
  // 水平翻轉影像（達成左右顛倒效果）
  scale(-1, 1);
  // 設定影像繪製模式為中心點對齊
  imageMode(CENTER);
  // 顯示影像，寬高為全螢幕寬高的 50%
  let dw = width * 0.5;
  let dh = height * 0.5;
  image(capture, 0, 0, dw, dh);

  // 檢查攝影機是否正常運作的提示
  if (capture.width === 0) {
    fill(0);
    textAlign(CENTER);
    scale(-1, 1); // 因為上面用了 scale(-1, 1)，文字需要轉回來否則會變反的
    text("正在啟動攝影機或未偵測到裝置...", 0, 0);
    return;
  }

  // 繪製耳垂上的圓圈
  if (faces.length > 0) {
    let face = faces[0];
    // MediaPipe FaceMesh 索引：177 為左耳垂附近, 401 為右耳垂附近
    let indices = [177, 401];
    
    for (let index of indices) {
      let keypoint = face.keypoints[index];
      if (keypoint) {
        // 將偵測到的座標映射到縮放後的影像位置
        let x = map(keypoint.x, 0, capture.width, -dw / 2, dw / 2);
        let y = map(keypoint.y, 0, capture.height, -dh / 2, dh / 2);
        // 顯示耳環影像，大小設定為 40x40
        image(earringImg, x, y, 40, 40);
      }
    }
  }
  pop();
}
