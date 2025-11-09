import Sound from './sound.js';

export default class SamplerEngine{
    constructor(audioContext){
        this.audioContext = audioContext;
        this.sounds = [];
    }

    async loadSounds(urls, names){
        // fetch the sounds/samples
        const responses = await Promise.all(urls.map((url) => fetch(url)));
        const sons = await Promise.all(responses.map((response) => response.arrayBuffer()));
        const decodedSounds = await Promise.all(sons.map((sound) => this.audioContext.decodeAudioData(sound)));
        this.sounds = decodedSounds.map((sound, index) =>{
            const name = names[index];
            return new Sound(index, sound, this.audioContext, name);
        });
    }
    
    getSoundById(id){
        return this.sounds[id];
    }

    getSounds(){
        return this.sounds;
    }
}