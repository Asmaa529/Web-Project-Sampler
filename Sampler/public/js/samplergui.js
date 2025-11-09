import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
import { pixelToSeconds } from './utils.js';

export default class SamplerGUI{
    constructor(engine, container){
        this.engine = engine;
        this.container = container;

        this.waveformCanvas = document.getElementById("waveform-canvas");
        this.overlayCanvas = document.getElementById("overlay-canvas");

        this.waveformDrawer = new WaveformDrawer();
        this.trimbarsDrawer = null;
        this.activeSound = null;
    }

    render(){
        let divBtn = document.getElementById("div-btn");
        divBtn.innerHTML = '';

        const allSounds = this.engine.getSounds();
        allSounds.forEach(sound => {
            const btn = document.createElement("button");
            btn.textContent = `PLAY ${sound.name}`;
            btn.id = `button-${sound.id}`;
            divBtn.appendChild(btn);

            btn.onclick = () =>{
                sound.play();
                this.soundSelected(sound);
            }
        });
    }

    soundSelected(sound){
        this.activeSound = sound;
        
        const waveformctx = this.waveformCanvas.getContext('2d');
        waveformctx.fillStyle = '#000';
        waveformctx.fillRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);

        const overlayctx = this.overlayCanvas.getContext('2d');
        overlayctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

        this.waveformDrawer.init(sound.audioBuffer, this.waveformCanvas, '#83E83E');
        this.waveformDrawer.drawWave(0, this.waveformCanvas.height);

        const startX = (sound.startTime / sound.audioBuffer.duration) * this.overlayCanvas.width;
        const endX = (sound.endTime / sound.audioBuffer.duration) * this.overlayCanvas.width;

        this.trimbarsDrawer = new TrimbarsDrawer(this.overlayCanvas, startX, endX);
        this.trimbarsDrawer.draw();

        let mousePosition = {x: 0, y:0};
        
        this.overlayCanvas.onmousemove = (e) => {
            let rect = this.waveformCanvas.getBoundingClientRect();
            mousePosition.x = (e.clientX - rect.left);
            mousePosition.y = (e.clientY - rect.top);

            if(this.trimbarsDrawer) {
                this.trimbarsDrawer.moveTrimBars(mousePosition);
                this.trimbarsDrawer.clear();
                this.trimbarsDrawer.draw();
            }
        }

        this.overlayCanvas.onmousedown = (e) => {
            if(this.trimbarsDrawer) {
                this.trimbarsDrawer.startDrag(mousePosition);
            }
        }

        this.overlayCanvas.onmouseup = (e) => {
            if(this.trimbarsDrawer) {
                this.trimbarsDrawer.stopDrag();

                this.trimbarsDrawer.clear();
                this.trimbarsDrawer.draw();

                let start = pixelToSeconds(this.trimbarsDrawer.leftTrimBar.x, this.activeSound.audioBuffer.duration, this.waveformCanvas.width);
                let end = pixelToSeconds(this.trimbarsDrawer.rightTrimBar.x, this.activeSound.audioBuffer.duration, this.waveformCanvas.width);
                
                this.activeSound.setTrim(start, end);
            }
        }
    }
}