const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Handle SoundCloud to MP3 conversion
app.post("/convert", async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.json({ success: false, message: "No URL provided" });
    }

    const outputFile = `downloads/${Date.now()}.mp3`;

    // Use yt-dlp to fetch and convert the SoundCloud track
    const command = `yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Error:", error);
            return res.json({ success: false, message: "Conversion failed" });
        }
        console.log("Download complete:", stdout);

        return res.json({ success: true, file: `/${outputFile}` });
    });
});

// Serve the downloaded files
app.use("/downloads", express.static("downloads"));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
