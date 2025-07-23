1// DOM Elements
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
        src: 'songs/streo.mp3',
        cover: 'imge/streo.jpg'
    },
    {
        title: 'Hotel California',
        artist: 'Eagles',
        src: 'songs/Hotel.mp3',
        cover: 'imge/hotel.jpg'
    },
    {
        title: 'Come and Get Your Love',
        artist: 'Redbone',
        src: 'songs/Redbone.mp3',
        cover: 'imge/redbone.jpeg'
    },
    {
        title: 'I Was Made For Lovin\' You',
        artist: 'Kiss',
        src: 'songs/kiss.mp3',
        cover: 'imge/kiss.jpg'
    }
];

let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeated = false;

// Initialize Player
function initPlayer() {
    loadSong(songs[currentSongIndex]);
    renderPlaylist();
    audio.volume = volumeSlider.value;
    updateFavoriteButton();
}

// Load Song
function loadSong(song) {
    songTitleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    audio.src = song.src;
    
    // Reset album art
    albumCover.style.display = 'block';
    albumCover.parentElement.classList.remove('fallback');
    
    // Set album cover with fallback
    albumCover.onerror = () => {
        albumCover.style.display = 'none';
        albumCover.parentElement.classList.add('fallback');
    };
    albumCover.src = song.cover;
    
    // Set background poster
    const bgImg = new Image();
    bgImg.onload = () => {
        backgroundPoster.style.backgroundImage = `url('${song.cover}')`;
    };
    bgImg.onerror = () => {
        backgroundPoster.style.backgroundImage = '';
    };
    bgImg.src = song.cover;
    
    // Reset progress
    progressBar.style.width = '0%';
    progressThumb.style.left = '0%';
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
    
    // Play if already playing
    if (isPlaying) {
        audio.play().catch(error => {
            console.log("Playback prevented:", error);
            isPlaying = false;
            updatePlayButton();
        });
    }
}

// Play/Pause Controls
function togglePlay() {
    if (audio.paused) {
        playSong();
    } else {
        pauseSong();
    }
}

function playSong() {
    audio.play()
        .then(() => {
            isPlaying = true;
            updatePlayButton();
        })
        .catch(error => {
            console.log("Playback error:", error);
            isPlaying = false;
            updatePlayButton();
        });
}

function pauseSong() {
    audio.pause();
    isPlaying = false;
    updatePlayButton();
}

function updatePlayButton() {
    playIcon.classList.toggle('fa-play', !isPlaying);
    playIcon.classList.toggle('fa-pause', isPlaying);
}

// Navigation Controls
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentSongIndex]);
    if (isPlaying) playSong();
}

function nextSong() {
    if (isShuffled) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === currentSongIndex && songs.length > 1);
        currentSongIndex = newIndex;
    } else {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
    }
    loadSong(songs[currentSongIndex]);
    if (isPlaying) playSong();
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
}

function toggleRepeat() {
    isRepeated = !isRepeated;
    repeatBtn.classList.toggle('active', isRepeated);
}

// Progress Bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressThumb.style.left = `${progressPercent}%`;
    
    // Update time display
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
    if (durationSeconds) durationEl.textContent = `${durationMinutes}:${durationSeconds}`;
    
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

// Favorites System
function toggleFavorite() {
    const favorites = getFavorites();
    const currentSongId = songs[currentSongIndex].src;
    
    if (favorites.includes(currentSongId)) {
        favorites.splice(favorites.indexOf(currentSongId), 1);
    } else {
        favorites.push(currentSongId);
    }
    
    localStorage.setItem('musicPlayerFavorites', JSON.stringify(favorites));
    updateFavoriteButton();
    renderPlaylist();
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
    
    item.innerHTML = `
        <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        </div>
        <i class="${isFavorited ? 'fas' : 'far'} fa-heart favorite-icon"></i>
    `;
    
    item.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(songs[currentSongIndex]);
        playSong();
        togglePlaylist();
    });
    
    const favIcon = item.querySelector('.favorite-icon');
    favIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSongIndex = index;
        toggleFavorite();
    });
    
    return item;
}

// Playlist Modal
function togglePlaylist() {
    playlistModal.style.display = playlistModal.style.display === 'flex' ? 'none' : 'flex';
    if (playlistModal.style.display === 'flex') {
        renderPlaylist();
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

playlistModal.addEventListener('click', (e) => {
    if (e.target === playlistModal) {
        togglePlaylist();
    }
});

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlay();
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
    }
});

// Initialize Player
initPlayer();
