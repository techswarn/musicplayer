class MusicPlayer{
    constructor(config){
        this.apiUrl = ""

        this.timePlayed = 0
        this.songDuration = 0

        this.playlist = {}
        this.playlistPlayingIndex = 0
        
        if(config){
            this.audioEl = document.querySelector(config.audio)
            this.songDurationEl = config.songDuration ? document.querySelector(config.songDuration) : config.songDuration
            this.songSliderEl = config.timeSlider ? document.querySelector(config.timeSlider) : config.timeSlider
            this.timePlayedEl = config.timePlayed ? document.querySelector(config.timePlayed) : config.timePlayed
            this.playButtonEl = config.playButton ? document.querySelector(config.playButton) : config.playButton
            this.volumeSliderEl = config.volumeSlider ? document.querySelector(config.volumeSlider) : config.volumeSlider
            this.volumeTextEl = config.volumeText ? document.querySelector(config.volumeText) : config.volumeText
            this.muteButtonEl = config.muteButton ? document.querySelector(config.muteButton) : config.muteButton
            this.coverImageEl = config.coverImage ? document.querySelector(config.coverImage) : config.coverImage
            this.playNextEl = config.playNextSongButton ? document.querySelector(config.playNextSongButton) : config.playNextSongButton
            this.playPrevEl = config.playPrevSongButton ? document.querySelector(config.playPrevSongButton) : config.playPrevSongButton
            this.playingSongTextEl = config.playingSongText ? document.querySelector(config.playingSongText) : config.playingSongText

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
        }
    }

    pause(){
        this.audioEl.pause()
        this.isPlaying === false
    }

    setAlbumCover(url){
        if(this.playlist.cover){
            this.coverImageEl.style.backgroundImage = `url("${this.apiUrl + this.playlist.cover}")`
        }else if(this.apiUrl && url){
            this.coverImageEl.style.backgroundImage = `url("${this.apiUrl + url}")`
        }else{
            this.coverImageEl.style.backgroundImage = ""
            this.coverImageEl.style.backgroundColor = "#151515"
        }
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
}