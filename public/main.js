const audioElement = document.getElementById('audio-player');
const playButton = document.querySelector(".player-play-btn");
const playIcon = document.querySelector(".player-icon-play");
const pauseIcon = document.querySelector(".player-icon-pause");
const progress = document.querySelector(".player-progress");
const progressFilled = document.querySelector(".player-progress-filled");
const playerCurrentTime = document.querySelector(".player-time-current");
const playerDuration = document.querySelector(".player-time-duration");
const previousBtn = document.querySelector(".player-icon-previous");
const nextBtn = document.querySelector(".player-icon-next");
const searchValue = document.getElementById('search-input');
const playList = document.getElementById('playlist');

let songs = [];
let currentSongIndex = 0;
let previousSongIndex = currentSongIndex;
audioElement.src = "";
let songDetails = "";

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the list of songs from the server
    fetch('/public/songs')
        .then(response => {
            if(!response){
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();

        }) 
        .then(songList => {
            songs = songList;
            // Get the <ul> element where the songs will be displayed
        
            playList.classList.add("bg-gray-600", "p-4");
            
            audioElement.addEventListener("timeupdate", () => {
                setTimes();
                progressUpdate();
            });

            // Loop through each song in the array
            songs.forEach((song , index) => {
                
                // Create a new <li> element
                const listItem = document.createElement('li');
                listItem.classList.add(
                'list-of-songs',
                'grid',
                'grid-col-1',
                'bg-green-500',
                'p-2',
                'mt-4',
                'text-white',
                'hover:cursor-pointer',
                'hover:bg-green-600'    
                );
                // Create a new <p> element for the song
                songDetails = document.createElement('p');
                //songDetails.classList.add();
                // Append the <p> element to the <li> element
                listItem.appendChild(songDetails);
                let songName = song.replace('.mp3','');
               
                // Set the text content of the <p> to the song name
                songDetails.textContent = songName;
              
                // Append the <li> element to the <ul> element
                playList.appendChild(listItem);
               
                // Add click event listener to play audio when clicked
                listItem.addEventListener('dblclick', () => {
                    // Create a new <audio> element
                    previousSongIndex = currentSongIndex;
                    currentSongIndex = index;
                    playSong(`/songs/${encodeURIComponent(song)}`);
                });
                
                audioElement.addEventListener("ended", playNextSong);
            });
        })
        
        // Handle any errors that occur during the fetch operation
        .catch(error => console.error('Error fetching songs:', error));

   
});

searchValue.addEventListener("input", () => {
   
    let listOfSongs = playList.getElementsByTagName("li");
    let filter = searchValue.value.toUpperCase();
    for (i = 0; i < listOfSongs.length; i++) {
        let songName = listOfSongs[i].getElementsByTagName("p")[0];
        let textValue = songName.textContent || songName.innerText;
        if(textValue.toUpperCase().indexOf(filter) > -1){
            listOfSongs[i].style.display = "";
        }else{
            listOfSongs[i].style.display = "none"
        }
    }
});

playButton.addEventListener("click", () => {

    if (playButton.dataset.playing === "false") {
        playSong(audioElement.src);
    } else if (playButton.dataset.playing === "true") {
        pauseSong(audioElement);
    }
});

nextBtn.addEventListener("click", playNextSong);
previousBtn.addEventListener("click", playPreviousSong);

function playSong(path){
    //set source to that mp3 file if it isn't the same source
    let listOfSongs = playList.getElementsByTagName("li");
    if(audioElement.src !== path) {
        audioElement.src = path;
    }
 
    listOfSongs[previousSongIndex].classList.remove('bg-green-600');
    listOfSongs[previousSongIndex].classList.add('bg-green-500');
    listOfSongs[currentSongIndex].classList.add('bg-green-500');
    listOfSongs[currentSongIndex].classList.add('bg-green-600');
    
    // Play the audio
    audioElement.play();
    playButton.dataset.playing = "true";
    playIcon.classList.add("hidden");
    pauseIcon.classList.remove("hidden");
}

function pauseSong(audio){
    audio.pause();
    playButton.dataset.playing = "false";
    playIcon.classList.remove("hidden");
    pauseIcon.classList.add("hidden");
}

function setTimes() {
    const newCurrentTime = new Date(audioElement.currentTime * 1000);
    const newDuration = new Date(audioElement.duration * 1000);
    playerCurrentTime.textContent = newCurrentTime.getMinutes() + ':' + newCurrentTime.getSeconds();
    playerDuration.textContent = newDuration.getMinutes() + ':' + newDuration.getSeconds();
}

function progressUpdate() {
    const percent = (audioElement.currentTime / audioElement.duration) * 100;
    progressFilled.style.flexBasis = `${percent}%`;
}

function scrub (event) {
    const scrubTime = (event.offsetX / progress.offsetWidth) * audioElement.duration;
    audioElement.currentTime = scrubTime;
}

progress.addEventListener("click", scrub);
progress.addEventListener("mousemove", (e) => mousedown && scrub(e));
progress.addEventListener("mousedown", () => (mousedown = true));
progress.addEventListener("mouseup", () => (mousedown = false));

function playNextSong() {
    previousSongIndex = currentSongIndex;
    currentSongIndex = (currentSongIndex + 1) % songs.length;
  
    playSong(`/songs/${encodeURIComponent(songs[currentSongIndex])}`);
}

function playPreviousSong() {
    previousSongIndex = currentSongIndex;
    currentSongIndex = (currentSongIndex - 1) % songs.length;
    playSong(`/songs/${encodeURIComponent(songs[currentSongIndex])}`);
}
