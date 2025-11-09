# Web-Project-Sampler

This web-based audio sampler application was developed as part of a Web development course. It enables users to load sound collections (presets) from a server, play them, visualize their waveforms, and interactively define start and end points for trimming.

## Features

* **Preset Loading**: Dynamically loads sound presets from a server.
* **Audio Playback**: Plays audio samples using the Web Audio API.
* **Waveform Visualization**: Renders the waveform of the selected sound on an HTML canvas.
* **Interactive Trimming**: Allows users to click and drag start/end markers on the waveform to trim the sound.

## How to Use

1.  Wait for the application to load.
2.  Select a preset from the dropdown menu.
3.  Click the "PLAY" button for any sound to hear it and see its waveform.
4.  On the waveform, click and drag the two vertical white bars (at the start and end) to define a new playback region.

## Technologies Used

* **Frontend**: HTML5, CSS3, JavaScript
* **Core API**: Web Audio API
* **Backend**: Node.js for serving the presets and audio files.

## Project Structure

The project code is organized as follows:

```txt
Sampler/
│
├── .gitignore       <-- Files to be ignored by Git
├── ci.yml           <-- Configuration file for Continuous Integration
├── package.json     <-- Project metadata and dependencies (for Node.js)
|
│
├── public/          <-- Folder containing all static files (client-side) statiques (côté client)
│   ├── index.html   <-- Main HTML entry point
│   ├── css/
│   │   └── styles.css   <-- All application styles
│   ├── js/            <-- All client-side JavaScript modules client
│   │   ├── main.js             <-- Main script (initialization, event listeners)
│   │   ├── samplerengine.js    <-- Core logic for loading/managing sounds
│   │   ├── samplergui.js       <-- Handles all UI/DOM manipulation
│   │   ├── sound.js            <-- Class representing a single sound
│   │   ├── soundutils.js       <-- Helper functions for Web Audio API
│   │   ├── trimbarsdrawer.js   <-- Class for drawing interactive trim bars
│   │   ├── utils.js            <-- General utility functions
│   │   └── waveformdrawer.js   <-- Class for drawing the audio waveform
│   └── presets/       <-- Folder containing audio samples
│
├── src/             <-- Folder containing server-side source code
│   └── app.mjs      <-- Main server file
│
└── tests/           <-- Folder for project tests
```

## Getting Started

Before you begin, ensure you have the following installed on your machine:

* **Node.js**: This project requires Node.js (which includes npm) to run the server. You can download it [here](https://nodejs.org/). (Ex: v22.20.0 or later).
* **A modern web browser**: Such as Chrome, Firefox, Safari, or Edge, to run the client application and use the Web Audio API.

## Installation and Running

1.  Clone the repository to your local machine:
    ```bash
    git clone [https://github.com/Asmaa529/Web-Project-Sampler.git](https://github.com/Asmaa529/Web-Project-Sampler.git)
    cd Web-Project-Sampler/Sampler
    ```

2.  Install the server dependencies:
    ```bash
    npm i
    ```

3.  Run the server:
    ```bash
    npm run start
    ```

4.  Open the application in your browser by navigating to:
    **`http://localhost:3001`**
    The server should now be running and serving the application on this port.

    Or, if you're using Visual Studio Code:
    right-click on the `index.html` file and select `Open with Live Server`

## Authors

  * **Asmaa BEL HADJ**
  * **Mounia AREZZOUG**
  * Master 1 Informatique, Université Côte d'Azur
  * Superviseur: Michel BUFFA
