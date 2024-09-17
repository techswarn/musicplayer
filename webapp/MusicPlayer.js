class MusicPlayer{
    constructor(config){

        this.timePlayed = 0
        this.songDuration = 0

        this.playlist = {}
        this.playlistPlayingIndex = 0

        this.serverList = {}

        const serverList = localStorage.getItem('serverList')
        if(serverList){
            this.serverList = JSON.parse(serverList)
        }
        
        if(config.elements){
            const {audio, songDuration, timeSlider, timePlayed, playButton, volumeSlider, volumeText, muteButton, coverImage, playNextSongButton, playPrevSongButton, playingSongText} = config.elements

            this.audioEl = document.querySelector(audio)
            this.songDurationEl = songDuration ? document.querySelector(songDuration) : songDuration
            this.songSliderEl = timeSlider ? document.querySelector(timeSlider) : timeSlider
            this.timePlayedEl = timePlayed ? document.querySelector(timePlayed) : timePlayed
            this.playButtonEl = playButton ? document.querySelector(playButton) : playButton
            this.volumeSliderEl = volumeSlider ? document.querySelector(volumeSlider) : volumeSlider
            this.volumeTextEl = volumeText ? document.querySelector(volumeText) : volumeText
            this.muteButtonEl = muteButton ? document.querySelector(muteButton) : muteButton
            this.coverImageEl = coverImage ? document.querySelector(coverImage) : coverImage
            this.playNextEl = playNextSongButton ? document.querySelector(playNextSongButton) : playNextSongButton
            this.playPrevEl = playPrevSongButton ? document.querySelector(playPrevSongButton) : playPrevSongButton
            this.playingSongTextEl = playingSongText ? document.querySelector(playingSongText) : playingSongText

            this.muteButtonEl?.addEventListener('click', () => {
                if(this.audioEl.muted === false){
                    this.audioEl.muted = true
                }else{
                    this.audioEl.muted = false
                }
            })
    
            this.volumeSliderEl?.addEventListener('input', (e) => {
                const value = e.target.value
    
                this.volumeTextEl.textContent = value
                this.audioEl.volume = value / 100
            })
    
            this.songSliderEl?.addEventListener('change', () => {
                this.audioEl.currentTime = this.songSliderEl.value
            })
    
            this.audioEl?.addEventListener('timeupdate', () => {
                const timePlayed = Math.floor(this.audioEl.currentTime)
                this.timePlayed = this.calcTime(timePlayed)
                
                this.songSliderEl.value = timePlayed
                this.timePlayedEl.textContent = this.timePlayed
            })
    
            this.playButtonEl?.addEventListener('click', () => {
                if(this.audioEl.paused){
                    this.play()
                }else{
                    this.pause()
                }
            })
    
            this.audioEl?.addEventListener('loadedmetadata', () => {
                this.songDuration = this.calcTime(this.audioEl.duration)
                this.songDurationEl.textContent = this.songDuration
                this.songSliderEl.max = Math.floor(this.audioEl.duration)
    
                this.audioEl.buffered.end(this.audioEl.buffered.length-1)
                this.audioEl.seekable.end(this.audioEl.seekable.length-1)
    
                this.songSliderEl.value = 0
            })
    
            this.songSliderEl?.addEventListener('input', () => {
                this.timePlayedEl.textContent = this.timePlayed
            })
    
            this.audioEl.addEventListener('ended', (e) => {
                if(this.playlist.songs.length > 1){
                    this.playlistPlayingIndex++
                    const songIndex = this.playlistPlayingIndex
                    const nextSongPath = this.playlist.songs[songIndex]
                    this.play(nextSongPath)
                }
            })

            this.playNextEl?.addEventListener('click', () => this.playNextSong())

            this.playPrevEl?.addEventListener('click', () => this.playPrevSong())
    
            if(this.audioEl.readyState > 0){
                this.songDurationEl.textContent = this.songDuration
                this.songSliderEl.max = Math.floor(this.audioEl.duration)
            }
        }
    }

    static normalizeName(text){
        return text.replace("-", " - ").replaceAll("_", " ").replace('.flac', "")
    }

    static extractArtistAlbumSongname(text){
        const splitPath = text.split('/')

        let [artist, album] = splitPath.at(-2).split('-')
        artist = artist.replaceAll("_", " ")
        album = album.replaceAll("_", " ")

        const song = splitPath.at(-1).split(' ').splice(1).join(' ').split('.')[0]

        return { artist, album, song }
    }

    static sortCoverAndSongs(paths){
        let cover = ""
        const songs = []

        paths.forEach(path => {
            const extName = path.split('.').at(-1)
            if(extName === 'jpg'){
                cover = path
            }else if(['flac'].includes(extName)){
                songs.push(path)
            }
        })

        return { cover, songs }
    }

    static join(){
        return Array.from(arguments).map(s => s[0] === "/" ? s.slice(1) : s).join('/')
    }

    calcTime(seconds){
        const min = Math.floor(seconds / 60)
        const sec = Math.floor(seconds % 60)
        const returnedSec = sec < 10 ? `0${sec}` : sec
        return `${min}:${returnedSec}`
    }

    play(songPath = ""){
        if(songPath){
            this.audioEl.src = this.apiUrl ? this.apiUrl + songPath : songPath
            this.showPlayingSongName(songPath)
        }

        if(this.audioEl.src != ""){
            this.audioEl.play()
            if(this.playButtonEl.classList.contains("musicplayer-icon-play")){
                this.playButtonEl.classList.replace("musicplayer-icon-play", "musicplayer-icon-pause")
            }
        }
    }

    pause(){
        this.audioEl.pause()
        this.isPlaying === false
        this.playButtonEl.classList.replace("musicplayer-icon-pause", "musicplayer-icon-play")
    }

    setAlbumCoverBase64(code){
        this.coverImageEl.style.backgroundImage = `url("${code}")`
    }

    loadPlaylist(paths){
        this.playlist = MusicPlayer.sortCoverAndSongs(paths)

        this.setAlbumCover()

        this.play(this.playlist.songs[0])
    }

    setApiUrl(url){
        this.apiUrl = url
    }

    playNextSong(){
        if(this.playlist.songs.length-1 > this.playlistPlayingIndex){
            this.playlistPlayingIndex++
        }

        const songIndex = this.playlistPlayingIndex
        const nextSongPath = this.playlist.songs[songIndex]
        this.play(nextSongPath)
    }

    playPrevSong(){
        if(this.playlistPlayingIndex > 0){
            this.playlistPlayingIndex--
        }

        const songIndex = this.playlistPlayingIndex
        const nextSongPath = this.playlist.songs[songIndex]
        this.play(nextSongPath)
    }

    showPlayingSongName(fullSongPath){
        const {artist, album, song} = MusicPlayer.extractArtistAlbumSongname(fullSongPath)
        this.playingSongTextEl.textContent = `${artist} - ${song}`
    }

    highlightSongElement(element){
        const selector = "musicplayer-highlight-song"

        Array.from(document.getElementsByClassName(selector)).forEach(e => e.classList.remove(selector))
        element.classList.add(selector)
    }

    highlightAlbumElement(element){
        const selector = "musicplayer-highlight-album"

        Array.from(document.getElementsByClassName(selector)).forEach(e => e.classList.remove(selector))
        element.classList.add(selector)
    }

    saveToLocalStorage(){
        const serverListJson = JSON.stringify(this.serverList)
        localStorage.setItem('serverList', serverListJson)
    }

    addServer(config){
        const {url, token, musicListRoute} = config

        this.serverList[url] = {
            url,
            token,
            musicListRoute: MusicPlayer.join(url, musicListRoute)
        }

        this.saveToLocalStorage()
    }

    async getAlbumsFromServer(apiUrl){
        const {token, musicListRoute} = this.serverList[apiUrl]

        const fetchConfig = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*"
            }
        }

        const albums = await fetch(musicListRoute, fetchConfig).then(async (res) => await res.json())

        this.serverList[apiUrl].albums = albums

        return albums
    }

    async getAlbumsFromAllServers(){
        const servers = Object.values(this.serverList)
        const albumsFromServers = await Promise.all(servers.map(server => this.getAlbumsFromServer(server.url)))

        for(let i = 0; i < servers.length; i++){
            const {url} = servers[i]
            const albums = albumsFromServers[i]
            this.serverList[url].albums = albums
        }
    }

    getAlbums(){
        const servers = Object.values(this.serverList)
        const albums = servers.map(server => server.albums)

        return [].concat(...albums)
    }
}