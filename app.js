document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.getElementById('search-bar');
    const appContainer = document.querySelector('.app-container');
    let filteredSongs = songs.slice();

    // Create search results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    appContainer.insertBefore(resultsContainer, appContainer.querySelector('.player'));

    function renderSearchResults() {
        resultsContainer.innerHTML = '';
        if (!searchBar.value.trim()) {
            resultsContainer.style.display = 'none';
            return;
        }
        resultsContainer.style.display = 'block';
        filteredSongs.forEach((song, idx) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `<span>${song.title}</span> <span class="search-artist">${song.artist}</span>`;
            item.onclick = () => {
                currentSongIndex = songs.indexOf(song);
                loadSong(currentSongIndex);
                resultsContainer.style.display = 'none';
                searchBar.value = '';
            };
            resultsContainer.appendChild(item);
        });
    }

    if (searchBar) {
        searchBar.addEventListener('input', function () {
            const query = searchBar.value.trim().toLowerCase();
            filteredSongs = songs.filter(song =>
                song.title.toLowerCase().includes(query) ||
                song.artist.toLowerCase().includes(query)
            );
            renderSearchResults();
        });
    }
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    const albumArt = document.getElementById('album-art');

    let isPlaying = false;
    let currentSongIndex = 0;

    // default playlist (used if no assets/manifest.json is present)
    let songs = [
        {
            title: 'Trendsetter',
            artist: 'Connor Price & Haviah Mighty',
            url: 'assets/mp3/Trendsetter.mp3',
            albumArtUrl: 'assets/Covers/Trendsetter'
        },
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

    // Try to load a generated manifest (assets/manifest.json). If present, it overrides the songs list.
    (async function tryLoadManifest() {
        try {
            const resp = await fetch('assets/manifest.json');
            if (!resp.ok) return;
            const data = await resp.json();
            if (!data || !Array.isArray(data.songs)) return;
            // Map manifest entries into the expected songs shape
            songs = data.songs.map(s => ({
                title: s.title || (s.mp3 || '').split('/').pop().replace(/\.[^/.]+$/, ''),
                artist: s.artist || '',
                url: s.mp3,
                albumArtUrl: s.cover || null
            }));
            // Reinitialize filteredSongs and audio
            filteredSongs = songs.slice();
            currentSongIndex = 0;
            audio = new Audio(songs[currentSongIndex].url);
            loadSong(currentSongIndex);
        } catch (err) {
            console.warn('No manifest or failed to load manifest:', err);
        }
    })();

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

        // attempt to resolve cover paths that may not include an extension (e.g. 'assets/Covers/Trendsetter')
        trySetAlbumArt(songs[songIndex].albumArtUrl);
        audio.src = songs[songIndex].url;
        audio.load();
    }

    // Try common image extensions if the provided cover path has no extension.
    function trySetAlbumArt(basePath) {
        const placeholder = 'https://via.placeholder.com/200?text=Album+Art+Unavailable';
        if (!basePath) {
            albumArt.src = placeholder;
            return;
        }

        // If the basePath already has an extension, use it directly.
        if (/\.[a-zA-Z0-9]{2,5}$/.test(basePath)) {
            albumArt.src = basePath;
            return;
        }

        const exts = ['.jpg', '.png', '.webp', '.jpeg', '.gif'];

        (async () => {
            for (let ext of exts) {
                const tryUrl = basePath + ext;
                try {
                    const res = await fetch(tryUrl, { method: 'HEAD' });
                    if (res && res.ok) {
                        const ct = res.headers.get('content-type') || '';
                        if (ct.startsWith('image')) {
                            albumArt.src = tryUrl;
                            return;
                        }
                    }
                } catch (e) {
                    // ignore and try next
                }
            }
            console.warn('No cover found for', basePath);
            albumArt.src = placeholder;
        })();
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
