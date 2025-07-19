const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const upload = multer();

app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend

app.post('/api/suggestion', upload.single('file'), async (req, res) => {
    const discordId = req.body.content?.split(':')?.[1]?.trim();
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    const form = new FormData();
    form.append('content', `New suggestion from Discord ID: ${discordId}`);

    if (req.file) {
        form.append('file', req.file.buffer, req.file.originalname);
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        if (!response.ok) {
            return res.status(500).send('Failed to submit to Discord.');
        }

        res.status(200).send('Success');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
