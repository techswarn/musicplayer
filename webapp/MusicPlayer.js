class MusicPlayer{
    constructor(config){
        this.apiUrl = ""

        this.timePlayed = 0
        this.songDuration = 0

        this.playlist = {}
        this.playlistPlayingIndex = 0
        
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