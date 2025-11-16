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
            albumArtUrl: 'https://via.placeholder.com/200?text=Blinding+Lights'
        },
        {
            title: 'Levitating',
            artist: 'Dua Lipa',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            albumArtUrl: 'https://via.placeholder.com/200?text=Levitating'
        },
        {
            title: 'Save Your Tears',
            artist: 'The Weeknd',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            albumArtUrl: 'https://via.placeholder.com/200?text=Save+Your+Tears'
        }
    ];

    let audio = new Audio(songs[currentSongIndex].url);

    function loadSong(songIndex) {
        songTitle.textContent = songs[songIndex].title;
        artistName.textContent = songs[songIndex].artist;
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
