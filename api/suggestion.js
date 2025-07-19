// File: api/suggestion.js

import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1396002265487380512/yMGk_iFl1gcQvuLQmFw_SIc2l-zBx-h4aFzVcmF5tOitrKyY8ffl8Dhj-ZcsZ-0EAoXR';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).send('Could not parse form data');
    }

    const discordId = fields.discordId || 'Unknown ID';

    const formData = new FormData();
    formData.append('content', `New suggestion from Discord ID: ${discordId}`);

    // If a file was uploaded, add it
    if (files.file && files.file.filepath) {
      const file = fs.createReadStream(files.file.filepath);
      formData.append('file', file, files.file.originalFilename);
    }

    try {
      const response = await fetch(DISCORD_WEBHOOK, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Discord webhook error:', errorText);
        return res.status(response.status).send(errorText);
      }

      return res.status(200).send('Suggestion forwarded successfully!');
    } catch (error) {
      console.error('Webhook POST failed:', error);
      return res.status(500).send('Failed to send to Discord');
    }
  });
}
