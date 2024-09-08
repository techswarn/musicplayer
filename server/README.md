## Fossapp.com - MusicPlayer - Server
Before starting the server you must install the node modules with `npm install`.

Next step should be creating a `.env` file inside the `/server` folder with the following content

```
MUSICFOLDER="C:/PathToYourMusicFolder"
```

You can also use a secret KEY for your API with
```
KEY="mysecretkey"
```

The currently supported folder structure is as follows:
```
/musicFolder
- /Snoop_Dogg-The_Masterpiece
- / - /01-01 (Intro) I Love To Give You Light.flac
- / - /01-02 Bang Out.flac
- / - /01-03 Drop It Like Its Hot.flac
```