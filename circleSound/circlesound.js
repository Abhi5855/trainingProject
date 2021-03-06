var numBands = 512;
function preload(){
   
}
function setup() {
    var soundFile = createAudio('say something.mp3');
    fft = new p5.FFT(0.9, numBands); //此值大小只允许在0-1；
    amplitude = new p5.Amplitude(0.1); //此处用于控制生成圆点的大小
    soundFile.connect(fft);
    soundFile.connect(amplitude);
    var thisCanvas = createCanvas(windowWidth, windowHeight); //windowWidth、windowHeight为全局变量
    thisCanvas.position(0, 0);
    background(0);
    soundFile.play();
    particles = [];
    for (var i = 0; i < 512; i++) {
        var _particle = new Particles(random(width), random(height));
        particles.push(_particle);
    }
}

function draw() {
    freqValues = fft.analyze();
    waveform = fft.waveform(512);

    volume = amplitude.getLevel();
    volume_left = amplitude.getLevel(0);
    fill(0, 0, 0, volume * 255);
    rect(0, 0, width, height);
    noStroke();
    fill(0, 123, 123, volume * 255);
    center();

    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var _speed = 1 + volume * 10 + freqValues[i] * i * .1 + waveform[i] * .1;
        p.maxSpeed = map(_speed, 0, +_speed, 0, 8);
        p.attraction(createVector(width * 0.5, height * 0.5))
        p.repulsion(createVector(width * 0.5, height * 0.5))
        p.wander(1);
        p.update();
        p.display(createVector(width * 0.5, height * 0.5));
    }
}

function center() {
    radius = volume * 1000;
    ellipse(windowWidth / 2, windowHeight / 2, radius, radius);
    radius = volume * 1200;
    ellipse(windowWidth / 2, windowHeight / 2, radius, radius);
    radius = volume_left * 600;
    ellipse(windowWidth / 2, windowHeight / 2, radius, radius);
}