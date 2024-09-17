async function main(){
    const musicPlayer = new MusicPlayer({
        elements: {
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
        },
        authToken: localStorage.getItem('apikey')
    })

    const FETCH_CONFIG = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${localStorage.getItem('apikey')}`,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*"
        }
    }

    async function authImage(path, token){
        const apiKey = localStorage.getItem('apikey')
        const apiUrl = localStorage.getItem('apiurl')

        return await fetch(`${apiUrl}/${path}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'image/jpeg',
                'Access-Control-Allow-Origin': "*"
            }
        }).then(res => {
            if(!res.ok){
                throw new Error(`AuthImage HTTP ERROR: ${res.status}`)
            }

            let buffer = res.arrayBuffer()
            let uint = new Uint8Array(buffer)
            let raw = String.fromCharCode.apply(null, uint)
            return `data:image;base64,${btoa(raw)}`
        })
    }

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
                        musicPlayer.highlightSongElement(e.target)
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
                    const apiUrl = localStorage.getItem('apiurl')
                    const getSongs = await fetch(`${apiUrl}/album/${albumFolder}`, FETCH_CONFIG)
                    const songNames = await getSongs.json()

                    const {cover, songs} = MusicPlayer.sortCoverAndSongs(songNames)

                    songs.forEach(songName => {
                        songsList.add(`${albumFolder}/${songName}`)
                    })
                }

                albumSongsEl.classList.toggle('hidden')
            })

            // Play whole album
            const playPlaylistBtn = $('button', {classList: "icon-s musicplayer-icon-play pointer"})
            playPlaylistBtn.dataset.folder = folderName

            playPlaylistBtn.addEventListener('click', async (e) => {
                const albumFolder = e.target.dataset.folder
                const apiUrl = localStorage.getItem('apiurl')
                const getSongs = await fetch(`${apiUrl}/album/${albumFolder}`, FETCH_CONFIG)
                const songNames = await getSongs.json()
                const songPaths = songNames.map(songPath => `/song/${albumFolder}/${songPath}`)
                musicPlayer.loadPlaylist(songPaths)
                musicPlayer.highlightAlbumElement(e.target.parentElement.querySelector('.albumName'))
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

    const settings = document.getElementById('settings')

    document.getElementById('settings-save').addEventListener('click', async () => {
        const apiKey = document.getElementById('api-key').value
        const apiUrl = document.getElementById('api-url').value

        const server = {
            url: apiUrl,
            token: apiKey,
            musicListRoute: '/music'
        }

        musicPlayer.addServer(server)

        await musicPlayer.getAlbumsFromServer(apiUrl)

        settings.classList.add('hidden')
    })

    document.getElementById('settingsBtn').addEventListener('click', () => {
        settings.classList.toggle('hidden')
    })

    await musicPlayer.getAlbumsFromAllServers()

    const albums = musicPlayer.getAlbums()
    musicList.addAll(albums)
}

main()