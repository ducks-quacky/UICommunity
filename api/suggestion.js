// /api/suggestion.js
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookUrl = process.env.DISCORD_WEBHOOK_URL; // Stored securely

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send('Form parsing error');
    }

    const discordId = fields.discordId;
    const file = files.file;

    const formData = new FormData();
    formData.append('content', `New suggestion from Discord ID: ${discordId}`);
    
    if (file) {
      formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).send(errorText);
      }

      return res.status(200).send('Success');
    } catch (err) {
      return res.status(500).send(`Server error: ${err.message}`);
    }
  });
}
