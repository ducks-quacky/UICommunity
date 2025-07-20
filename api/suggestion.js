// /api/suggestion.js

import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false, // required for formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).send('Form parsing error');
    }

    const discordId = fields.discordId || 'Unknown';
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).send('Missing webhook URL');
    }

    const formData = new FormData();
    formData.append('content', `New suggestion from Discord ID: ${discordId}`);

    if (files.file) {
      const file = files.file;
      formData.append('file', fs.createReadStream(file.filepath), file.originalFilename);
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).send(errorText);
      }

      res.status(200).send('Suggestion submitted successfully!');
    } catch (err) {
      console.error('Fetch error:', err);
      res.status(500).send(`Server error: ${err.message}`);
    }
  });
}
