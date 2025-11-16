document.addEventListener('DOMContentLoaded', function () {
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    const albumArt = document.getElementById('album-art');

    let isPlaying = false;
    let currentSongIndex = 0;

    let songs = [
        {
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            albumArtUrl: 'https://th.bing.com/th/id/OIP.CK8CD1lsD2149RhVqgQoXAHaNK?w=115&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
        },
        {
            title: 'Levitating',
            artist: 'Dua Lipa',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            albumArtUrl: 'https://th.bing.com/th/id/OIP.FKpRZjNNf7KGGDVdrcKWnAHaJQ?w=119&h=180&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
        },
        {
            title: 'Save Your Tears',
            artist: 'The Weeknd',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            albumArtUrl: 'https://th.bing.com/th/id/OIP.kUPoK8aXXF7dwd3F_yjjmwHaEa?w=323&h=193&c=7&r=0&o=7&cb=ucfimg2&dpr=1.3&pid=1.7&rm=3&ucfimg=1'
        }
    ];

    let audio = new Audio(songs[currentSongIndex].url);

    function loadSong(songIndex) {
        songTitle.textContent = songs[songIndex].title;
        artistName.textContent = songs[songIndex].artist;
        // set a crossOrigin to reduce CORS issues and attach error fallback
        try { albumArt.crossOrigin = 'anonymous'; } catch (e) {}
        albumArt.onerror = function () {
            console.warn('Failed to load album art:', songs[songIndex].albumArtUrl);
            albumArt.src = 'https://via.placeholder.com/200?text=Album+Art+Unavailable';
        };
        albumArt.src = songs[songIndex].albumArtUrl;
        audio.src = songs[songIndex].url;
        audio.load();
    }

    function playPauseSong() {
        if (isPlaying) {
            audio.pause();
            playPauseBtn.textContent = '▶️';
        } else {
            audio.play();
            playPauseBtn.textContent = '⏸️';
        }
        isPlaying = !isPlaying;
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) {
            audio.play();
        }
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) {
            audio.play();
        }
    }

    function updateProgressBar() {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
    }

    playPauseBtn.addEventListener('click', playPauseSong);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    audio.addEventListener('timeupdate', updateProgressBar);

    progressBar.addEventListener('input', function () {
        const newTime = (progressBar.value / 100) * audio.duration;
        audio.currentTime = newTime;
    });

    // File upload functionality
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');

    if (uploadBtn) {
        uploadBtn.addEventListener('click', function () {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            const files = e.target.files;
            for (let file of files) {
                if (file.type.startsWith('audio/')) {
                    const fileURL = URL.createObjectURL(file);
                    const newSong = {
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        artist: 'Custom Upload',
                        url: fileURL,
                        albumArtUrl: 'https://via.placeholder.com/200?text=Custom+Song'
                    };
                    songs.push(newSong);
                }
            }
            fileInput.value = '';
        });
    }

    loadSong(currentSongIndex);
});
