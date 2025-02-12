import { exec } from "child_process";
import fs from "fs";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";

// Middleware function to use with Next.js API routes
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const handler = async (req, res) => {
  await runMiddleware(req, res, cors());
  await runMiddleware(req, res, bodyParser.json());

  if (req.method === "POST") {
    const { url } = req.body;

    if (!url) {
      return res.json({ success: false, message: "No URL provided" });
    }

    const outputFile = path.join("public", "downloads", `${Date.now()}.mp3`);

    // Use yt-dlp to fetch and convert the SoundCloud track
    const command = `yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error:", error);
        return res.json({ success: false, message: "Conversion failed" });
      }
      console.log("Download complete:", stdout);
      return res.json({ success: true, file: `/downloads/${path.basename(outputFile)}` });
    });
  } else {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
};

export default handler;
