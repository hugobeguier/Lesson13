const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

console.log('Server started');

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    next();
});

// Define a route to get the list of songs
app.get('/public/songs', (req, res) => {
    
    const songsDirectory = path.join(__dirname, 'public/songs');
    //console.log('Fetching songs from:', songsDirectory);

    fs.readdir(songsDirectory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return res.status(500).send('Unable to scan directory of songs folder');
        }
        const songs = files.filter(file => file.endsWith('.mp3'));
        //console.log('Found songs:', songs);
        res.json(songs);
    });
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});