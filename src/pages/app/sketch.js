/*
Colophon
ML5JS FaceMesh for face detection.
Music: Hiroshi Yoshimura "Wet Land" from his Wet Land (1993) album.
 */
import songPath from '../../assets/01-Wet-Land-Min.mp3';
import fontRegular from '../../assets/PPMondwest-Regular.otf';

// Facemesh indexes for midpoint top and bottom eyelids of each eye, see:
// https://raw.githubusercontent.com/tensorflow/tfjs-models/refs/heads/master/face-landmarks-detection/mesh_map.jpg
console.log('sketch loaded');
export const sketch = function(p) {
  const LEFT_TOP = 159;
  const LEFT_BOT = 145;
  const LEFT_LEFT = 33;
  const LEFT_RIGHT = 133;
  const RIGHT_TOP = 386;
  const RIGHT_BOT = 374;
  const RIGHT_LEFT = 362;
  const RIGHT_RIGHT = 263;
  
  // Ratio of horizontal eye to vertical eye distance to be considered 'closed'
  // Ratio is used because it considers the users distance from webcam. 
  const CLOSED_THRESHOLD_RATIO = 0.13
  
  let eyeCloseStartTime = 0; // Timestamp when eyes were first detected as closed
  const CLOSE_DURATION_THRESHOLD = 300; // Minimum duration (ms) for eyes to be considered closed
  
  let faceMesh;
  let video;
  let faces = [];
  let options = { maxFaces: 1, refineLandmarks: true, flipHorizontal: false };
  let leftEyeTop = [246, 161, 160, 159, 158, 157, 173];
  let leftEyeBot = [ 7, 163, 144, 145, 153, 154, 155];
  let rightEyeTop = [398, 384, 385, 386, 387, 388, 466];
  let rightEyeBot = [382, 381, 380, 374, 373, 390, 249];
  let song;
  let isEyeOpen = true;
  
  let isModelReady = false;
  
  let cnvWidth = 640;
  let cnvHeight = 480;
  let myFont;
  p.preload = function () {
    // Load the faceMesh model
    song = p.loadSound(songPath, () => {
      console.log('song loaded');
      const progressContainer = document.getElementById("sound-loading-progress");
      if (progressContainer) {
        progressContainer.classList.add('hide');
      }
    }, (error) => {
      console.error('error loading song', error)
    }, (progress) => { // Loading progress
      const percentage = Math.ceil(progress * 100)
      const progressBar = document.getElementById('progress-bar');
      const progressText = document.getElementById('progress-text');
      if (progressBar && progressText) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`
      }
      console.log('sound loading progress: ', percentage)
    });
    faceMesh = ml5.faceMesh(options, () => {
      isModelReady = true;
      console.log('model ready');
    }
    );
  }
  p.setup = function () {
    console.log('setup')
    myFont = p.loadFont(fontRegular);
  
    let canvas = p.createCanvas(cnvWidth, cnvHeight);
    canvas.parent('sketch-container');
  
    // Create the webcam  and hide it
    video = p.createCapture(p.VIDEO);
    console.log('video', video);
    video.size(p.width, p.height);
    video.hide();
    // Start detecting faces from the webcam video
    if (faceMesh) {
      faceMesh.detectStart(video, gotFaces);
    }
    p.frameRate(24);
    p.imageMode(p.CENTER);
  
    // let gradient = p.drawingContext.createRadialGradient(
    //   p.width/2, p.height/2, p.width/8,  // inner circle
    //   p.width/2, p.height/2, p.width/4  // outer circle
    // );
    // gradient.addColorStop(0, 'rgba(0,0,0,0)');
    // gradient.addColorStop(1, 'rgba(255,255,255,1)');
    
    // p.drawingContext.fillStyle = gradient;
    // p.drawingContext.fillRect(0, 0, p.width, p.height);
    
    
  }
  
  p.draw = function () {
    if (isModelReady == false) {
      console.log('model not ready')
      return;
    }

    p.image(video, cnvWidth/2, cnvHeight/2, cnvWidth, cnvHeight);
  
    // Draw all the tracked face points
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
  
  //  Drawing face points
      for (let j = 0; j < leftEyeTop.length; j++) {
        let keypointLET = face.keypoints[leftEyeTop[j]]
        let keypointRET = face.keypoints[rightEyeTop[j]]
  
        let keypointLEB = face.keypoints[leftEyeBot[j]]
        let keypointREB = face.keypoints[rightEyeBot[j]]
        p.noStroke();
        p.fill(0, 255, 0);
        p.circle(keypointLET.x, keypointLET.y, 2);
        p.circle(keypointRET.x, keypointRET.y, 2);
  
        p.fill(255, 0, 0);
        p.circle(keypointLEB.x, keypointLEB.y, 2);    
        p.circle(keypointREB.x, keypointREB.y, 2);     
      }
      
  
  //  ––––––––––––––
      
  // left eye landmark points
      let lt = face.keypoints[LEFT_TOP]; //left top
      let lb = face.keypoints[LEFT_BOT]; //left bottom
      let ll = face.keypoints[LEFT_LEFT]; //left left
      let lr = face.keypoints[LEFT_RIGHT]; //left right
    
  // right eye landmark points
      let rt = face.keypoints[RIGHT_TOP]; //right top
      let rb = face.keypoints[RIGHT_BOT]; //right bottom
      let rl = face.keypoints[RIGHT_LEFT]; //right left
      let rr = face.keypoints[RIGHT_RIGHT]; //right right

      let lh = calcDistance(ll, lr);
      let lv = calcDistance(lt, lb);
      let rh = calcDistance(rl, rr);
      let rv = calcDistance(rt, rb);

      let leftEyeRatio = lv / lh;
      let rightEyeRatio = rv / rh;
      let avgRatio = (leftEyeRatio + rightEyeRatio) / 2;
  
      const elems = document.querySelectorAll('.header-text');
  //     Preventing blinks from registering
  //     Eyes must be closed for at least 500ms for sound to trigger. 
      if (avgRatio < CLOSED_THRESHOLD_RATIO) {

      //  Eyes are closed
        if (isEyeOpen) {
        isEyeOpen = false;
        eyeCloseStartTime = p.millis();
        } else {
        //  Eye is closed

          if (p.millis() - eyeCloseStartTime >= CLOSE_DURATION_THRESHOLD ) {
            playSound();
            document.getElementById('blackout').style.opacity = '0.95';
            document.getElementById('textInput').removeAttribute("disabled")
            document.getElementById('textInput').click();
            document.getElementById('textInput').focus();
            elems.forEach(elem => {
              elem.classList.remove = 'text-black';
              elem.classList.add = 'text-white';

            });
  
          }
        }
      } else {
        
      //  eyes are open. 
        if (!isEyeOpen) {
          isEyeOpen = true;
          pauseSound();
          document.getElementById('blackout').style.opacity = '0.0  ';
          // document.querySelectorAll('header-text').style.color = 'black';
          document.getElementById('textInput').setAttribute("disabled","")
          elems.forEach(elem => {
            elem.classList.remove = 'text-white';
            elem.classList.add = 'text-black';
          });
  
  
        }
      }
    }
    // Inner Shadow Dreamy Effect
    // let gradient = p.drawingContext.createRadialGradient(
    //   p.width/2, p.height/2, p.width/8,  // inner circle
    //   p.width/2, p.height/2, p.width/4  // outer circle
    // );
    // gradient.addColorStop(0, 'rgba(255,255,255,0)');
    // gradient.addColorStop(1, 'rgba(255,255,255,1)');
    
    // p.drawingContext.fillStyle = gradient;
    // p.drawingContext.fillRect(0, 0, p.width, p.height);
    
  }
  
  // Callback function for when faceMesh outputs data
  function gotFaces(results) {
    // Save the output to the faces variable
    // console.log('gotFaces', results)
    faces = results;
  }
  
  // Calculates euclidian distance
  function calcDistance (a, b) {
    return p.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
  }
  
  function playSound () {
    if (!song.isPlaying()) {
      console.log('playing')
      song.setVolume(1)
      song.play();
      
    }
  }
  
  function pauseSound() {
  // This is meant to fade out sound but doesn't work as intended... oh well
    if (song.isPlaying()) {
      song.setVolume(0, 1, 1);
      
      setTimeout(function () {
        song.pause();
        console.log('pausing')
      }, 1000)
    }
  }
  
  }
  