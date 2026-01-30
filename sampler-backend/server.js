import express from "express";
import cors from "cors";
import fs from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const app = express();
app.use(express.json());
app.use(cors());

const port = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(PUBLIC_DIR, "presets");

try {
    await fs.mkdir(DATA_DIR, { recursive: true });
} catch (e) {}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, PUBLIC_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.use(express.static(PUBLIC_DIR));

const readJSON = async (filePath) => JSON.parse(await fs.readFile(filePath, "utf8"));
// Assainit un nom pour un usage sûr comme nom de fichier sous Windows et POSIX
const sanitizeName = (n) => (n || '').toString().replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim();

app.get("/api/presets", async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR).catch(() => []);
        const jsonFiles = files.filter((f) => f.endsWith(".json"));
        let items = await Promise.all(jsonFiles.map((f) => readJSON(path.join(DATA_DIR, f))));

        // Normalisation : garantir que la réponse contient toujours un tableau `samples`
        items = items.map(item => {
            if (!Array.isArray(item.samples) && Array.isArray(item.sounds)) {
                item.samples = item.sounds;
            } else if (!Array.isArray(item.samples)) {
                item.samples = [];
            }
            return item;
        });

        res.json(items);
    } catch (e) {
        res.status(500).json({ error: "Erreur lecture" });
    }
});

// Endpoint pour vérifier si un nom de preset est déjà utilisé
app.get('/api/presets/exists/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const safe = sanitizeName(decodeURIComponent(name));
        const files = await fs.readdir(DATA_DIR);
        const exists = files.includes(`${safe}.json`);
        res.json({ exists });
    } catch (e) {
        console.error('Error checking preset exists:', e);
        res.status(500).json({ error: e.message || 'Erreur serveur' });
    }
});

// Remplace la ligne du POST par celle-ci
app.post("/api/presets", upload.array("files"), async (req, res) => {
    try {
        const { name, category } = req.body;
        const files = req.files; // Remarque le 's' à files
        if (!files || files.length === 0) return res.status(400).json({ error: "Fichier manquant" });

        const newPreset = {
            name: name,
            category: category,
            samples: files.map((file, index) => ({
                id: Date.now() + index,
                name: `${name}_${index}`,
                category: category,
                url: `./${file.filename}`,
                startTime: 0,
                endTime: 1,
                playbackSpeed: 1,
                volume: 1,
                loop: false
            }))
        };

        const safeName = sanitizeName(name); // Utilise la fonction de nettoyage
        await fs.writeFile(path.join(DATA_DIR, `${safeName}.json`), JSON.stringify(newPreset, null, 2));
        res.status(201).json(newPreset);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.put("/api/presets/:oldName", async (request, response) => {
    const oldName = decodeURIComponent(request.params.oldName);
    const newName = request.body.name;

    if (!newName) return response.status(400).json({ error: "Nouveau nom requis" });

    try {
        const files = await fs.readdir(DATA_DIR);
        let oldFileName = "";
        let presetData = null;

        for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const data = await readJSON(path.join(DATA_DIR, file));
            if (data.name === oldName) {
                oldFileName = file;
                presetData = data;
                break;
            }
        }

        if (!presetData) return response.status(404).json({ error: "Preset introuvable" });

        const oldPath = path.join(DATA_DIR, oldFileName);
        const safeNewName = sanitizeName(newName);
        const newPath = path.join(DATA_DIR, `${safeNewName}.json`);

        if (oldPath.toLowerCase() !== newPath.toLowerCase()) {
            try {
                await fs.access(newPath);
                return response.status(409).json({ error: "Un fichier avec ce nom existe déjà" });
            } catch { }
        }

        presetData.name = newName;
        const tempPath = `${newPath}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(presetData, null, 2));
        await fs.rename(tempPath, newPath);

        if (oldPath.toLowerCase() !== newPath.toLowerCase()) {
            try {
                await fs.unlink(oldPath);
            } catch (err) {
                console.error('Failed to remove old preset file:', err);
            }
        }

        response.json({ success: true });
    } catch (e) {
        console.error('Error in rename:', e);
        response.status(500).json({ error: e.message || 'Erreur serveur' });
    }
});

// Pour supprimer des sons d'un preset
app.put("/api/presets/update", async (req, res) => {
    const updatedPreset = req.body; // L'objet envoyé par Angular
    const filePath = path.join(DATA_DIR, `${updatedPreset.name}.json`);

    try {
        await fs.writeFile(filePath, JSON.stringify(updatedPreset, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du preset" });
    }
});

// Supprimer plusieurs sons par identifiants
app.delete('/api/presets/sounds', async (req, res) => {
    try {
        const identifiers = Array.isArray(req.body?.ids) ? req.body.ids : [];
        console.log('DELETE /api/presets/sounds called with identifiers:', identifiers);
        if (identifiers.length === 0) return res.status(400).json({ error: 'No ids provided' });

        const files = await fs.readdir(DATA_DIR);
        let modifiedFiles = 0;

        for (const file of files) {
            if (!file.endsWith('.json')) continue;
            const filePath = path.join(DATA_DIR, file);
            const data = await readJSON(filePath);

            /// Déterminer la clé du tableau de samples
            const samplesKey = Array.isArray(data.samples) ? 'samples' : Array.isArray(data.sounds) ? 'sounds' : null;
            if (!samplesKey) continue;

            const originalLen = data[samplesKey].length;
            data[samplesKey] = data[samplesKey].filter(s => {
                // Garder les samples qui ne correspondent à aucun identifiant
                return !identifiers.some(id => {
                    // Correspondance stricte numérique
                    if ((typeof id === 'number' || (!isNaN(Number(id)) && String(id).trim() !== '')) && s.id !== undefined && s.id !== null) {
                        return Number(id) === Number(s.id);
                    }
                    // Correspondance chaîne (url ou nom)
                    return (typeof id === 'string' && (id === s.url || id === s.name));
                });
            });

            if (data[samplesKey].length !== originalLen) {
                await fs.writeFile(filePath, JSON.stringify(data, null, 2));
                modifiedFiles++;
            }
        }

        res.json({ success: true, modifiedFiles });
    } catch (e) {
        console.error('Error deleting sounds:', e);
        res.status(500).json({ error: e.message });
    }
});

app.delete("/api/presets/:name", async (request, response) => {
    // On décode le nom reçu (ex: "Basic%20Kit" devient "Basic Kit")
    const nameToDelete = decodeURIComponent(request.params.name);
    
    try {
        const files = await fs.readdir(DATA_DIR);
        let fileToDelete = "";

        // On cherche le fichier qui contient le bon "name" à l'intérieur
        for (const file of files) {
            if (!file.endsWith(".json")) continue;
            
            const filePath = path.join(DATA_DIR, file);
            const data = await readJSON(filePath);
            
            if (data.name === nameToDelete) {
                fileToDelete = file;
                break;
            }
        }

        if (fileToDelete) {
            await fs.unlink(path.join(DATA_DIR, fileToDelete));
            console.log(`Supprimé : ${fileToDelete} (Nom interne: ${nameToDelete})`);
            response.json({ success: true });
        } else {
            console.log(` Impossible de trouver le fichier pour : ${nameToDelete}`);
            response.status(404).json({ error: "Fichier introuvable sur le disque" });
        }
    } catch (e) {
        console.error("Erreur suppression:", e);
        response.status(500).json({ error: "Erreur lors de la suppression" });
    }
});

app.listen(port, () => {
    console.log(` SERVEUR COMPLET SUR http://localhost:${port}`);
});