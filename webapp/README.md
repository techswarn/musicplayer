# Fossapp.com - MusicPlayer
Fossapp MusicPlayer is a webapplication that doesn't need to be installed but can be self hosted or used at https://fossapp.com/musicplayer

All you need is to deploy the server and you can use the https://fossapp.com/musicplayer to play your own music.

# MusicPlayer ( config :object )
You can pass either a valid "querySelector()" selector or a Element Node.
```
new  MusicPlayer({
	audio:  '#musicAudio', // Audio Element <audio>
	songDuration:  '#musicDuration', // Inserts Text(time) into an Element
	timeSlider:  '#musicTimeSlider', // Input Slider <input type="range">
	timePlayed:  '#musicTimePlayed', // Inserts Text(time) into an Element
	volumeSlider:  '#musicVolume', // Input Slider <input type="range">
	volumeText:  '#musicVolumeText', // Input Slider <input type="range">
	playButton:  '#musicPlay', // Play Button
	muteButton:  '#musicMute', // Mute Button
	playNextSongButton:  '#musicPlayNext', // Next Song Button
	playPrevSongButton:  '#musicPlayPrev', // Previous Song Button
	playingSongText:  '#nowPlaying', // Inserts artist and song title into an Element.
	coverImage:  '#musicList' // Sets the elements background to an Album Cover Image
})
```
## .setApiUrl( url :string )
Sets a API URL inside the player that will be used for the `.play( songPath )` method.

```
const musicplayer = new MusicPlayer(config)
musicplayer.setApiUrl("https://myapiserver.com")
```

## .play( songPath :string )
Can be either just the path like
`/song/snoopdogg-the_masterpiece/drop_it_like_its_hot.flac`
or the full path including the api URL
`https://myapiserver.com/song/snoopdogg-the_masterpiece/drop_it_like_its_hot.flac`

## .pause( )
It pauses the song 💀

## .setAlbumCover( url :string )
Sets the Album Cover image as an elements background image.
The target element is being set in the config.
```
const musicplayer = new MusicPlayer({
	coverImage: "#someElement"
})

musicplayer.setAlbumCover("https://myapiserver.com/song/snoopdogg-the_masterpiece/album_cover.jpg")
```
