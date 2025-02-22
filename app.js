require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/synthesize", async (req, res) => {
  const text = req.body.text;

  // Updated this based on Elias feedback
  // As this change will allow the user to pass 0 as a value, if no text is set in the text variable,
  // text will be 0 and the condition will be false so "0" will be used to do TTS.

  // Previous condition
  // if (text === undefined || text === null || text === '' || text == 0) {

  if (!text) {
    res.status(400).send({ error: "è richiesto un testo" });
    return;
  }

  const voice =
    req.body.voice == 0
      ? "zcAOhNBS3c14rBihAFp1"
      : req.body.voice || "zcAOhNBS3c14rBihAFp1";

  const voice_settings =
    req.body.voice_settings == 0
      ? {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      : req.body.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.5,
        };

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/zcAOhNBS3c14rBihAFp1`,
      {
        text: text,
        model_id: "eleven_multilingual_v1",
        voice_settings: voice_settings,
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "audio/mpeg",
          "xi-api-key": "610ca6481e36b8cad266260a02690222", //`${process.env.ELEVENLABS_API_KEY}`
        },
        responseType: "arraybuffer",
      }
    );

    const audioBuffer = Buffer.from(response.data, "binary");
    const base64Audio = audioBuffer.toString("base64");
    const audioDataURI = `data:audio/mpeg;base64,${base64Audio}`;
    res.send({ audioDataURI });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while processing the request.");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
