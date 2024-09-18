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

    async function authImage(server, path){
        const token = musicPlayer.serverList[server].token

        return await fetch(path, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                'Access-Control-Allow-Origin': "*"
            }
        }).then(async (res) => {
            if(!res.ok){
                throw new Error(`AuthImage HTTP ERROR: ${res.status}`)
            }

            let blob = await res.blob()
            let blobObj = URL.createObjectURL(blob)
            console.log(`${blob.size / 1000}kb`)
            return blobObj
        })
    }

    const musicList = new VList("#musicList", {
        template: ({url, album}) => {
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
            const albumNameTxt = MusicPlayer.normalizeName(album)
            const albumNameEl = $("div", {className: "albumName"}, albumNameTxt)
            albumNameEl.dataset.server = url
            albumNameEl.dataset.album = album

            albumNameEl.addEventListener('click', async (e) => {
                const hasSongs = albumSongsEl.querySelector('.song') //e.target.children.length always returns 0

                if(!hasSongs){
                    const {server, album} = e.target.dataset
                    const songNames = await musicPlayer.getSongsFromAlbum(server, album)

                    const {cover, songs} = MusicPlayer.sortCoverAndSongs(songNames)

                    const img = await authImage(server, MusicPlayer.join(server, "/song", album, cover))

                    img.onload = () => URL.revokeObjectURL(img.src)

                    musicPlayer.setAlbumCoverBase64(img)

                    songs.forEach(songName => {
                        songsList.add(`${album}/${songName}`)
                    })
                }

                albumSongsEl.classList.toggle('hidden')
            })

            // Play whole album
            const playPlaylistBtn = $('button', {classList: "icon-s musicplayer-icon-play pointer"})
            playPlaylistBtn.dataset.album = album

            playPlaylistBtn.addEventListener('click', async (e) => {
                const albumFolder = e.target.dataset.album
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
            musicListRoute: '/music',
            albumRoute: '/album'
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