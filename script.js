// DOM Elements
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const favoriteIcon = document.getElementById('favorite-icon');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressThumb = document.getElementById('progress-thumb');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const songTitleEl = document.getElementById('song-title');
const artistEl = document.getElementById('artist');
const albumCover = document.getElementById('album-cover');
const backgroundPoster = document.getElementById('background-poster');
const volumeSlider = document.getElementById('volume-slider');
const playlistBtn = document.getElementById('playlist-btn');
const playlistModal = document.getElementById('playlist-modal');
const playlistFavorites = document.getElementById('playlist-favorites');
const playlistAll = document.getElementById('playlist-all');
const closePlaylist = document.getElementById('close-playlist');

// Music Data
const songs = [
    {
        title: 'Stereo Love',
        artist: 'Edward Maya & Vika Jigulina',
        src: 'streo.mp3',
        cover: 'streo.jpg'
    },
    {
        title: 'Hotel California',
        artist: 'Eagles',
        src: 'Hotel.mp3',
        cover: 'hotel.jpg'
    },
    {
        title: 'Come and Get Your Love',
        artist: 'Redbone',
        src: 'Redbone.mp3',
        cover: 'redbone.jpeg'
    },
    {
        title: 'I Was Made For Lovin\' You',
        artist: 'Kiss',
        src: 'kiss.mp3',
        cover: 'kiss.jpg'
    }
];

let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeated = false;
let shuffleHistory = [];

// Initialize Player
function initPlayer() {
    loadSong(songs[currentSongIndex]);
    renderPlaylist();
    audio.volume = volumeSlider.value;
    updateFavoriteButton();
    
    // Set tabindex for all focusable elements
    document.querySelectorAll('button, [tabindex]').forEach(el => {
        el.setAttribute('tabindex', '0');
    });
}

// Load Song
function loadSong(song) {
    songTitleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    audio.src = song.src;
    
    // Set album art and background
    albumCover.src = song.cover;
    albumCover.onerror = () => {
        albumCover.src = 'default-cover.jpg';
    };
    backgroundPoster.style.backgroundImage = `url('${song.cover}')`;
    
    // Update playlist highlight
    updatePlaylistHighlight();
    updateFavoriteButton();
    
    // Reset progress
    progressBar.style.width = '0%';
    progressThumb.style.left = '0%';
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    
    // If already playing, continue playback
    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Playback prevented:", error);
                isPlaying = false;
                playIcon.classList.replace('fa-pause', 'fa-play');
            });
        }
    }
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            playIcon.classList.replace('fa-play', 'fa-pause');
        }).catch(error => {
            console.log("Playback prevented:", error);
        });
    }
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    playIcon.classList.replace('fa-pause', 'fa-play');
}

// Navigation
function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = songs.length - 1;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) playSong();
}

function nextSong() {
    if (isShuffled) {
        shuffleSong();
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) playSong();
}

function shuffleSong() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentSongIndex && songs.length > 1);
    
    shuffleHistory.push(currentSongIndex);
    if (shuffleHistory.length > 10) shuffleHistory.shift();
    
    currentSongIndex = randomIndex;
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
    if (!isShuffled) shuffleHistory = [];
}

function toggleRepeat() {
    isRepeated = !isRepeated;
    repeatBtn.classList.toggle('active', isRepeated);
}

// Favorites System
function toggleFavorite() {
    const favorites = getFavorites();
    const currentSongId = songs[currentSongIndex].src;
    
    if (favorites.includes(currentSongId)) {
        favorites.splice(favorites.indexOf(currentSongId), 1);
        favoriteBtn.classList.remove('pulse');
    } else {
        favorites.push(currentSongId);
        favoriteBtn.classList.add('pulse');
    }
    
    localStorage.setItem('musicPlayerFavorites', JSON.stringify(favorites));
    updateFavoriteButton();
    renderPlaylist();
    
    // Remove pulse class after animation
    setTimeout(() => {
        favoriteBtn.classList.remove('pulse');
    }, 500);
}

function getFavorites() {
    return JSON.parse(localStorage.getItem('musicPlayerFavorites') || '[]');
}

function updateFavoriteButton() {
    const favorites = getFavorites();
    const currentSongId = songs[currentSongIndex].src;
    
    if (favorites.includes(currentSongId)) {
        favoriteIcon.classList.replace('far', 'fas');
        favoriteBtn.classList.add('favorited');
    } else {
        favoriteIcon.classList.replace('fas', 'far');
        favoriteBtn.classList.remove('favorited');
    }
}

// Playlist Management
function renderPlaylist() {
    const favorites = getFavorites();
    
    // Clear existing content
    playlistFavorites.innerHTML = '';
    playlistAll.innerHTML = '';
    
    // Add Favorites Section
    if (favorites.length > 0) {
        const favHeader = document.createElement('h4');
        favHeader.innerHTML = '<i class="fas fa-heart"></i> Favorites';
        playlistFavorites.appendChild(favHeader);
        
        favorites.forEach(fav => {
            const songIndex = songs.findIndex(s => s.src === fav);
            if (songIndex !== -1) {
                playlistFavorites.appendChild(createPlaylistItem(songs[songIndex], songIndex));
            }
        });
    }
    
    // Add All Songs Section
    const allHeader = document.createElement('h4');
    allHeader.innerHTML = '<i class="fas fa-music"></i> All Songs';
    playlistAll.appendChild(allHeader);
    
    songs.forEach((song, index) => {
        if (!favorites.includes(song.src)) {
            playlistAll.appendChild(createPlaylistItem(song, index));
        }
    });
}

function createPlaylistItem(song, index) {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    if (index === currentSongIndex) item.classList.add('playing');
    
    const isFavorited = getFavorites().includes(song.src);
    if (isFavorited) item.classList.add('favorited');
    
    item.innerHTML = `
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        </div>
        <i class="${isFavorited ? 'fas' : 'far'} fa-heart favorite-icon"></i>
    `;
    
    item.addEventListener('click', (e) => {
        // Don't trigger if clicking the favorite icon
        if (!e.target.classList.contains('favorite-icon')) {
            currentSongIndex = index;
            loadSong(songs[currentSongIndex]);
            playSong();
            togglePlaylist();
        }
    });
    
    // Add favorite toggle to the icon
    const favIcon = item.querySelector('.favorite-icon');
    favIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSongIndex = index;
        toggleFavorite();
    });
    
    return item;
}

function updatePlaylistHighlight() {
    document.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    const currentItems = document.querySelectorAll(`.playlist-item:nth-child(${currentSongIndex + 2})`);
    currentItems.forEach(item => {
        item.classList.add('playing');
    });
}

// Progress Bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressThumb.style.left = `${progressPercent}%`;
    
    // Duration display
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
    if (durationSeconds) durationEl.textContent = `${durationMinutes}:${durationSeconds}`;
    
    // Current time display
    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
    currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// Volume Control
function setVolume() {
    audio.volume = volumeSlider.value;
}

// Playlist Modal
function togglePlaylist() {
    playlistModal.style.display = playlistModal.style.display === 'flex' ? 'none' : 'flex';
    if (playlistModal.style.display === 'flex') {
        updatePlaylistHighlight();
    }
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
favoriteBtn.addEventListener('click', toggleFavorite);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
    if (isRepeated) {
        audio.currentTime = 0;
        audio.play();
    } else {
        nextSong();
    }
});
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);
playlistBtn.addEventListener('click', togglePlaylist);
closePlaylist.addEventListener('click', togglePlaylist);

// Close modal when clicking outside
playlistModal.addEventListener('click', (e) => {
    if (e.target === playlistModal) {
        togglePlaylist();
    }
});

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case ' ':
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                e.preventDefault();
                togglePlay();
            }
            break;
        case 'ArrowLeft':
            prevSong();
            break;
        case 'ArrowRight':
            nextSong();
            break;
        case 's':
            toggleShuffle();
            break;
        case 'r':
            toggleRepeat();
            break;
        case 'f':
            toggleFavorite();
            break;
        case 'p':
            togglePlaylist();
            break;
        case 'Escape':
            playlistModal.style.display = 'none';
            break;
    }
});

// Initialize
initPlayer();