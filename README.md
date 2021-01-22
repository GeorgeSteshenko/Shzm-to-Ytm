# Transfer Shazam list to YouTube music / Spotify

NodeJS Puppetier based app to go through the whole list of Shazam'ed songs and add them into either YouTube Music or Spotify.

## The problem

Before Shazam was acquired by Apple, there was an ability to add song
from the app into Google Play Music.<br>
Now when it's gone, both, an ability to transfer and GPM too, the only
possible way to listen those songs is to add/buy them via Apple Music.
To which I'm not a subscriber and not a fan of.<br>
By the time this happend, I've Shazam'ed more than 200 songs.<br>
And a single thought about going through them manually left me with anxiety.<br>
But been a music lover and passionate listener, as well as been able
to write some code, helped me to came up with an idea.

## The solution

Basically the whole app is split into several modules:

- `facebook.js` - to log into Shazam as I used to [feature that about to be
  removed from the platform].
  - **Side note:** the cookies from facebook are saved into `fb-cookies.json` durring the development, to avoid continious logging in, so I've just saved it into a separate file and then simply injected them into the page, so I don't have to go through FB login step every time. Also FB gonna spam your email with a "new suspicious login" every login. This is also could be omitted: <br>
    - `index.js` line: 17, 18
    - `facebook.js` line: 65, 67
    - `shazam.js` line: 14, 16
- `shazam.js` - to extract Shazam'ed songs into the `songs.json` file. All songs are then looped through and added to `Set` object, to avoid duplications. <br>
  Read [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) about JavaScript Set.<br>
  So don't be supprised if there is gonna be less songs than Shazam will tell you. There might be songs that you've aready Shazam'ed.
  - **Side note:** Shazam uses "lazyload" to display the list of songs (20 songs at
    a time), so in order to load them all, there is an action performed in code
    to scroll throgh the page and make it load songs until there is no more.<br>
    The scroll speed is set to 5 sec (roughly) so there is enogth time to load
    next 20 songs. [`shazam.js` line: 33]
- `google-auth.js` - created to log into YouTube music. Achieved with google third party login [at that point through the stackoverflow google login, because you have to pay a tribute to it, you know].<br>
  This workaround will help to overcome direct google login issue,
  google will prevent you from login via puppetier [because
  of 'attempt to login with automated software'].
  - **Side note:** Which wasn't actually bad, TBH. Use it on your own risk, that method probably caused my email to burst with tones of spam.
- `youtube-music.js` & `spotify.js` to search and save songs into the playlist.

  - The playlist should be created beforehand. For YTM it's called "My shazams Private" if it's private, or just "My shazams" if it's not. Feel free to name
    it whatever you like. [`youtube-music.js` line: 52].

  - For Spotify name does not matter, just create same, e.g. "My shazams" playlist,
    it'll be the first one under "Add to playlist" --> "Create playlist" list item.<br>
    It's where all the songs will go. [`spotify.js` line: 96 - 102].

- Songs that were not found will go into `ytm-missing-songs.json` and `spotify-missing-songs.json` so you might wanna go and look them up again manually.<br>
  The app might miss some of them.

Before start, make sure to rename `.env_sample` into `.env` and
add all needed credentials:

```
FB_USERNAME=YOUR_FACEBOOK_USERNAME_HERE
FB_PASSWORD=YOUR_FACEBOOK_PASSWORD_HERE

GGL_USERNAME=YOUR_GOOGLE_USERNAME_HERE
GGL_PASSWORD=YOUR_GOOGLE_PASSWORD_HERE

SPOTIFY_USERNAME=YOUR_SPOTIFY_USERNAME_HERE
SPOTIFY_PASSWORD=YOUR_SPOTIFY_PASSWORD_HERE
```

Those are gonna be stored as env vars and used later to login.

Also I'm a bit paranoid and I have two step verification enabled almost everywhere,
so the code related to it might be omitted.<br>
Verification codes could be entered via terminal, it's echoed as hidden text with `******`

- `facebook.js` - Line: 30 - 45
- `google-auth.js` - Line: 43 - 53

## How to

1. Run `npm i`
2. Rename `.env_sample` into `.env`
3. Add creds (Login/Password info) inside `.env`
4. Alter code in `index.js` if needed
5. Alter scroll speed for `shazam.js` if needed [Line: 33]
6. Create playlists in YTM & Spotify
7. Finally run `node index`

## Known issue(s)

There are times when the whole album gets added. It happens with YouTube Music and only when song has the same title as an album. I just took the top search result from the page and didn't differentiate whether it was a song or an album. Yeah...<br>
And there might be several versions of the song like year related or live performance, or whatever. I didn't really go into details, YTM markup is quite loaded and extremly nested. I just got lazy at that point )

## What else?

Well, that's it, hope it's gonna be useful.<br>
Obviously the is more simple way to extract songs from Shazam,
such as fetching the request URL directly like:<br>
`https://www.shazam.com/discovery/...bla-bla-bla...?limit=20&token=...bla-bla-bla...` [Look inside Devtools Network tab]<br>
where `limit=20` could be set to amount of songs you have.<br>
Or by using resenlty added `Download CSV` feature and then working with `.csv` file right away.<br>
But the initial goal was to practise with Puppetier library a bit.<br>

Also this app written in a so called "success scenario", meaning there is no error handling or fallbacks if something went wrong durring execution. So just tweak the code and re-run it if it breaks ¯\\\_(ツ)\_/¯
