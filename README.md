# Web-Project-Sampler

This project is a full web-based audio sampler composed of three modules: a main sampler application, an administration interface, and a Node.js  backend. Users can load preset sound collections from the server, play them, visualize their waveforms, adjust playback parameters, and trim audio regions interactively. The admin panel allows creating, renaming, deleting, and updating presets, including uploading or removing individual sound files. The backend manages the REST API, file storage, and automatic generation of preset metadata.

## AI Contribution
* **CSS**: Most of the CSS styling was generated with the help of AI. 
* **server.js**: Most parts of the server logic were assisted by AI. 
* **Debugging**: AI was used to help identify and fix bugs during development (front-end, back-end, and Angular admin panel).
* **Structure of this README**: The overall organization and formatting were optimized with the assistance of AI.


## Features

1. FRONT-END

* **Dynamic Menu**: Automatic loading of the preset list from the back-end through a GET request.
* **Separate Audio Engine**: Architecture separating the graphical user interface (GUI) from the audio management engine (Audio Service).
* **Interactive Loading**: The sounds of a preset are loaded and assigned to their corresponding pads (Kick on pad 0, snare to its right, etc.).
* **Sound Parameters**: Individual control of volume, playback speed (pitch), and looping for each sound.
* **Keyboard Mapping**: Ability to trigger sounds using the computer keyboard.
* **Waveform Visualization**: Display of the audio waveform in a Canvas during playback.
* **Trimming & Individual Controls**: For each sound, adjustment of volume, pitch, and precise selection of start and end points.
* **Microphone Recording**: Live audio capture, immediate visualization, and assignment to a pad for trimming.
* **Web Components**: The user interface is encapsulated as a Web Component.

2. BACK-END

* **REST API**: A NodeJS server providing endpoints for reading, creating, updating, and deleting presets.
* **File Management**: Physical storage of audio files (.mp3, .wav) and automatic generation of metadata files (.json) on the server.
* **Synchronization Route**: A dedicated endpoint (/api/presets/update) that allows modifying the internal content of an existing JSON file without affecting the other files.

3. ANGULAR PART

* **Display All Presets**: Fetches and shows the complete list of presets stored on the server.
* **Preset Renaming**: Updates both the internal preset name and its corresponding file name on the server.
* **Preset Deletion**: Allows removing an entire preset from the server.
* **Sound Deletion**: Enables deleting one or multiple sounds from a selected preset.
* **Preset Creation**: New presets can be created directly from the Angular interface.
* **Sound File Upload**: Supports uploading one or multiple audio files when creating a new preset.


## How to Use

On the SamplerPro (http://localhost:4200/)
1. Wait for the application to finish loading.  
2. Select a preset from the dropdown menu.  
3. Click the **PLAY** button on any sound to listen to it and view its waveform.  
4. On the waveform display, click and drag the two vertical white bars to define a new playback region.  
5. Adjust the volume and/or playback speed (pitch) as needed and/or loop the sound.  
6. Click **Automatic Test** to load all sounds and play them sequentially.  
7. Click **Record** to record audio using your computer’s microphone, then play it back and view its waveform.
8. Press the keyboard keys to play the sounds.

On the SamplerAdmin (http://localhost:4201/)
1. Wait for the application to finish loading.  
2. Click **Preset List**, **Add Sound**, or **Delete Sounds from a Preset**, depending on what you want to do.  
3. In **Preset List**, you can rename or delete any preset.  
4. In **Add Sound**, enter the name of the preset you want to create, choose a category, upload the sound files, and click **Create Preset**.  
5. In **Delete Sounds from a Preset**, select a preset to load all its sounds. Choose the sounds you want to remove, then click **Delete Selection**.


## Technologies Used

* **Frontend**: Angular (v17/18+), Angular Material, HTML5, CSS3, JavaScript/TypeScript, Web Components, Web Audio API
* **Backend**: Node.js, Express, Multer, fs/promises, CORS, JSON

## Project Structure

The project code is organized as follows:

```txt
/ (repo root)
    |
├─ sampler-pro/                # Main sampler application (Angular)
│  ├─ angular.json
│  ├─ package.json
│  └─ src/
│     ├─ main.ts               # Angular bootstrap
│     └─ app/
│        ├─ components/        # UI components (pad, sampler, waveform…)
│        ├─ services/          # Audio service, presets, etc.
│        └─ models/            # Sound and Preset interfaces
    │
├─ sampler-backend/            # Backend server (Node.js + Express)
│  ├─ package.json
│  ├─ server.js                # REST API, uploads and static file serving
│  └─ public/
│     └─ presets/              # Stored preset .json files and uploaded audio
    │
├─ sampler-admin/              # Admin interface (Angular)
│  ├─ angular.json
│  ├─ package.json
│  └─ src/
│     ├─ main.ts
│     └─ app/
│        ├─ components/
│        │  ├─ add-sound/      # Create preset & upload audio
│        │  ├─ delete-sound/   # Remove sounds from a preset
│        │  └─ preset-list/    # List, rename, and delete presets
│        ├─ services/         # AdminServices (HTTP client)
│        └─ models/
    │
    .gitignore                           



```

## Getting Started

Before you begin, make sure the following tools are installed on your machine:

* **Node.js**: Required to run the backend server and manage dependencies through npm. You can download it from the official website.  
* **Angular CLI**: Needed to run and build the Angular frontend. Install it globally using `npm install -g @angular/cli`.  
* **A modern web browser**: Chrome, Firefox, Edge, or Safari, to run the client application and support the Web Audio API.  
* **Git**: For cloning the repository.

## Installation and Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Asmaa529/Web-Project-Sampler.git
   cd Web-Project-Sampler/Sampler
   ```

2. **Install the server dependencies:**
   ```bash
   npm i
   ```

3. **Start the project** by opening **three terminals**, one for each module:

   - **Backend (`sampler-backend`)**
     ```bash
     node server.js
     ```

   - **Main Sampler App (`sampler-pro`)**
     ```bash
     ng serve
     ```

   - **Admin Interface (`sampler-admin`)**
     ```bash
     ng serve --port 4201
     ```
     (Port **4201** is required because **4200** is already used by the main sampler.)

4. Once everything is running, open your browser and navigate to:
   - **Main Sampler:** `http://localhost:4200/`
   - **Admin Sampler:** `http://localhost:4201/`

## Authors

  * **Asmaa BEL HADJ**
  * **Mounia AREZZOUG**
  * Master 1 Informatique, Université Côte d'Azur
  * Superviseur: Michel BUFFA
