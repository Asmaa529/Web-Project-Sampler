import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
import { loadAndDecodeSound, playSound } from './soundutils.js';

export default class Sound{
    constructor(id, audioBuffer, audioContext, name){
        this.id = id;
        this.name = name
        this.audioBuffer = audioBuffer;
        this.audioContext = audioContext;
        this.startTime = 0;
        this.endTime = audioBuffer.duration;
        this.isPlaying = false;
        this.source = null;
    }

    play(){
        // Stop the sound if it is being play
        if(this.source){
            this.source.stop();
        }

        // Play the sound
        this.source = playSound(this.audioContext,this.audioBuffer,this.startTime,this.endTime);
        this.isPlaying = true;
        console.log(`Playing sound ${this.id}`);
    }

    setTrim(start, end){
        this.startTime = start;
        this.endTime = end;
    }

    stop(){
        if(this.source){
            this.source.stop();
            this.isPlaying = false;
        }
    }

}