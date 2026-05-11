let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let earrings = [];
let selectedIndex = 0; // 預設顯示第一款耳環

function preload() {
  // 載入五種不同的耳環圖片
  earrings[0] = loadImage('pic/acc1_ring.png');
  earrings[1] = loadImage('pic/acc2_pearl.png');
  earrings[2] = loadImage('pic/acc3_tassel.png');
  earrings[3] = loadImage('pic/acc4_jade.png');
  earrings[4] = loadImage('pic/acc5_phoenix.png');
}

function gotFaces(results) {
  faces = results;
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像，並加入錯誤處理回呼
  capture = createCapture(VIDEO, function(stream) {
    console.log("攝影機啟動成功");
  });
  capture.size(640, 480);
  capture.hide();

  // 初始化 faceMesh 並開始偵測
  faceMesh = ml5.faceMesh(options);
  faceMesh.detectStart(capture, gotFaces);

  // 初始化 handPose 並開始偵測
  handPose = ml5.handPose({ flipHorizontal: false });
  handPose.detectStart(capture, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // 設定背景顏色為 e7c6ff
  background('#e7c6ff');

  // 在畫面上方正中間顯示文字
  fill(0); // 設定文字顏色為黑色
  noStroke();
  textSize(32); // 設定文字大小
  textAlign(CENTER, TOP);
  text("414XXX183 王O崴", width / 2, 20);

  // 檢查攝影機是否正常運作的提示
  if (capture.width === 0) {
    fill(100);
    textAlign(CENTER, CENTER);
    textSize(20);
    text("正在啟動攝影機，請確保已允許權限並使用伺服器(localhost)開啟...", width/2, height/2);
    return;
  }

  push();
  translate(width / 2, height / 2);
  scale(-1, 1); // 左右翻轉影像
  imageMode(CENTER);

  let dw = width * 0.5;
  let dh = height * 0.5;
  image(capture, 0, 0, dw, dh);

  // 手勢辨識切換邏輯
  if (hands.length > 0) {
    let hand = hands[0];
    let count = 0;
    
    // 簡單判斷手指是否伸直 (比較指尖 8, 12, 16, 20 與指節 6, 10, 14, 18 的 Y 座標)
    if (hand.keypoints[8].y < hand.keypoints[6].y) count++;   // 食指
    if (hand.keypoints[12].y < hand.keypoints[10].y) count++; // 中指
    if (hand.keypoints[16].y < hand.keypoints[14].y) count++; // 無名指
    if (hand.keypoints[20].y < hand.keypoints[18].y) count++; // 小指
    if (hand.keypoints[4].y < hand.keypoints[3].y) count++;   // 大拇指 (簡化判定)

    // 當偵測到 1~5 根手指時，切換對應的耳環索引
    if (count >= 1 && count <= 5) {
      selectedIndex = count - 1;
    }
  }

  // 繪製耳環
  if (faces && faces.length > 0) {
    let face = faces[0];
    // MediaPipe FaceMesh 索引：177 為左耳垂附近, 401 為右耳垂附近
    let indices = [177, 401];
    
    for (let index of indices) {
      let keypoint = (face.keypoints) ? face.keypoints[index] : null;
      if (keypoint) {
        // 將偵測到的座標映射到縮放後的影像位置
        let x = map(keypoint.x, 0, capture.width, -dw / 2, dw / 2);
        let y = map(keypoint.y, 0, capture.height, -dh / 2, dh / 2);
        
        let currentImg = earrings[selectedIndex];
        // 計算耳環比例：寬度 40，高度依比例縮放
        let eW = 60;
        let eH = eW * (currentImg.height / currentImg.width);
        
        // 將耳環位置向下偏移 (eH/2)，使耳環頂端對準耳垂偵測點
        image(currentImg, x, y + eH/2, eW, eH);
      }
    }
  }
  pop();
}
