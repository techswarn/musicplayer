async function main(){
    const musicPlayer = new MusicPlayer({
        audio: '#musicAudio',
        songDuration: '#musicDuration',
        timeSlider: '#musicTimeSlider',
        timePlayed: '#musicTimePlayed',
        volumeSlider: '#musicVolume',
        volumeText: '#musicVolumeText',
        playButton: '#musicPlay',
        muteButton: '#musicMute',
        playNextSongButton: '#musicPlayNext',
        playPrevSongButton: '#musicPlayPrev',
        playingSongText: '#nowPlaying',
        coverImage: '#musicList'
    })

    const musicList = new VList("#musicList", {
        template: (folderName) => {
            // Song List inside Albums
            const albumSongsEl = $("div", {className: "albumSongs hidden"})
            const songsList = new VList(albumSongsEl, {
                template: (filepath) => {
                    const songName = MusicPlayer.normalizeName(filepath.split('/')[1])
                    const songNameEl = $("div", {className: "song"}, songName)
                    songNameEl.dataset.filepath = filepath

                    songNameEl.addEventListener('click', async (e) => {
                        const audioPath = `/song/${e.target.dataset.filepath}`
                        musicPlayer.loadPlaylist([audioPath])
                    })

                    return songNameEl
                }
            })

            // Album List
            const albumNameTxt = MusicPlayer.normalizeName(folderName)
            const albumNameEl = $("div", {className: "albumName"}, albumNameTxt)
            albumNameEl.dataset.folder = folderName

            albumNameEl.addEventListener('click', async (e) => {
                const hasSongs = albumSongsEl.querySelector('.song') //e.target.children.length always returns 0

                if(!hasSongs){
                    const albumFolder = e.target.dataset.folder
                    const key = document.getElementById('key').value
                    const apiUrl = document.getElementById('api-url').value
                    const getSongs = await fetch(`${apiUrl}/album/${albumFolder}`, {
                        method: "GET",
                        headers: {
                            'Authorization': `bearer ${key}`,
                            'Content-Type': 'application/json',
                            'origin': "*"
                        }
                    })
                    const songNames = await getSongs.json()

                    const {cover, songs} = MusicPlayer.sortCoverAndSongs(songNames)

                    songs.forEach(songName => {
                        songsList.add(`${albumFolder}/${songName}`)
                    })
                }

                albumSongsEl.classList.toggle('hidden')
            })

            // Play whole album
            const playPlaylistBtn = $('button', {classList: "icon-s icon-play pointer"})
            playPlaylistBtn.dataset.folder = folderName

            playPlaylistBtn.addEventListener('click', async (e) => {
                const albumFolder = e.target.dataset.folder
                const key = document.getElementById('key').value
                const apiUrl = document.getElementById('api-url').value
                const getSongs = await fetch(`${apiUrl}/album/${albumFolder}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `bearer ${key}`,
                        'Content-Type': 'application/json',
                        'origin': "*"
                    }
                })
                const songNames = await getSongs.json()
                const songPaths = songNames.map(songPath => `/song/${albumFolder}/${songPath}`)
                musicPlayer.loadPlaylist(songPaths)
            })

            // Return Album to Music List
            return $("div", {className: "album"}, [
                $("div", {className: "albumHeader"}, [
                    albumNameEl,
                    playPlaylistBtn
                ]),
                albumSongsEl
            ])
        }
    })

    const getMusic = async () => {
        const key = document.getElementById('key').value
        const apiUrl = document.getElementById('api-url').value

        if(key && apiUrl){
            const musicFolder = await fetch(`${apiUrl}/music`, {
                method: "GET",
                headers: {
                    'Authorization': `bearer ${key}`,
                    'Content-Type': 'application/json',
                    'origin': "*"
                }
            })

            musicPlayer.setApiUrl(apiUrl)

            const musicAlbums = await musicFolder.json()
        
            musicList.addAll(musicAlbums)
        }
    }
    
    getMusic()

    const settingsBtn = document.getElementById('settings-save')
    settingsBtn.addEventListener('click', getMusic)


    const settings = document.getElementById('settings')
    document.getElementById('settingsBtn').addEventListener('click', () => {
        settings.classList.toggle('hidden')
    })
}

main()