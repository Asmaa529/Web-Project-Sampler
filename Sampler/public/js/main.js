// About imports and exports in JavaScript modules
// see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
// and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

// default imports of classes from waveformdrawer.js and trimbarsdrawer.js
import Sound from './sound.js';
import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
// "named" imports from utils.js and soundutils.js
import { loadAndDecodeSound, playSound } from './soundutils.js';
import { pixelToSeconds } from './utils.js';
import SamplerEngine from './samplerengine.js';
import SamplerGUI from './samplergui.js';


// The AudioContext object is the main "entry point" into the Web Audio API
let ctx;
const serverURL = 'http://localhost:3001';
let decodedSounds;
let index = 0;
let waveformDrawer, trimbarsDrawer;
let engine, gui;
let currentSelectedPreset = null;

window.onload = async function init() {
    // Fetch DOM objects
    const presetSelected = document.getElementById("preset-select");
    const container = document.getElementById("wrapper");
    const loadAllBtn = this.document.getElementById("load-button");

    // Initialisation
    ctx = new AudioContext();
    engine = new SamplerEngine(ctx);
    gui = new SamplerGUI(engine, container);

    try{
        // Fetch the data from the presets in the server
        const response = await fetch(`${serverURL}/api/presets`);
        const presets = await response.json();
        presets.map((preset) => preset.samples.map((sound) => console.log(sound.url)));

        // Fill the dropDownMenu
        fillDropDownMenu(presets, presetSelected);

        // Fetch the preset selected
        let selectedPreset;
        presetSelected.onchange = (e) =>{
            let idPresetSelected = presetSelected.value;
            for(let i = 0; i < presets.length; i++){
                if(presets[i].name == idPresetSelected){
                    selectedPreset = presets[i];
                }
            }
            renderPreset(selectedPreset, engine, gui, container);
        }
    }catch(err){
        console.log("Failed to initialize sampler: "+err);
        this.document.getElementById("wrapper").innerHTML = `<p>Error loading sounds</p>`;
    }
};

function fillDropDownMenu(presets, presetSelected){
    presets.forEach((preset) =>{
        const option = document.createElement("option");
        option.value = preset.name;
        option.textContent = preset.name;
        presetSelected.appendChild(option);
    });
}

async function renderPreset(selectedPreset, engine, gui, container){
    const soundURLs = selectedPreset.samples.map((sound) =>{
        let cleanUrl = sound.url;
        if(cleanUrl.startsWith('./')){
            cleanUrl = cleanUrl.substring(2);
        }
        const encodedUrl = encodeURI(cleanUrl);
        return `${serverURL}/presets/${encodedUrl}`;
    });
    const soundNames = selectedPreset.samples.map((sound) =>{
        return sound.name;
    });
    console.log("URLs à charger :", soundURLs);
    await engine.loadSounds(soundURLs,soundNames);
    gui = new SamplerGUI(engine, container);
    gui.render();
}


