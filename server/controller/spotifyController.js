const SpotifyWebApi = require('spotify-web-api-node')
const generateRandomString = require('../utils')

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} = require('../../secrets')
const client_id = CLIENT_ID || process.env.CLIENT_ID
const client_secret = CLIENT_SECRET || process.env.CLIENT_SECRET
const redirect_uri = REDIRECT_URI || process.env.REDIRECT_URI
const scopes = ['user-read-private', 'user-read-recently-played']
const stateKey = 'spotify_auth_state'
const state = generateRandomString(16)

const credentials = {
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
}

const spotifyApi = new SpotifyWebApi(credentials)

const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state)

const spotifyLogin = (req, res) => {
  // your application requests authorization
  //   redirect to '/callback' route
  console.log('auth URL:', authorizeURL)
  res.redirect(authorizeURL)
}

const spotifyCallback = (req, res) => {
  const code = req.query.code

  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      console.log('The token expires in ' + data.body.expires_in)
      console.log('The access token is ' + data.body.access_token)
      console.log('The refresh token is ' + data.body.refresh_token)

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body.access_token)
      spotifyApi.setRefreshToken(data.body.refresh_token)

      //   console.log('spotifyApi', spotifyApi)
      //   return spotifyApi.getMe()
    },
    function(err) {
      console.log('Something went wrong!', err)
    }
  )

  res.redirect('/')
}

const spotifyRefreshToken = (req, res) => {
  // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
  spotifyApi.refreshAccessToken().then(
    function(data) {
      console.log('The access token has been refreshed!')

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body.access_token)
    },
    function(err) {
      console.log('Could not refresh access token', err)
    }
  )
}

const getData = async (req, res) => {
  try {
    console.log('test route init')
    console.log('spotify api (test):', spotifyApi)

    const me = await spotifyApi.getMe()
    // req.session.me = me
    console.log('me:', me.body.id)
    // me.body.id ='thejanetlam'

    const recentTracksData = await spotifyApi.getMyRecentlyPlayedTracks({
      limit: 50
    })
    const trackIdsArr = recentTracksData.body.items.map(track => track.track.id)
    // console.log('tracks:', trackIdsArr)

    const tracksFeaturesData = await spotifyApi.getAudioFeaturesForTracks(
      trackIdsArr
    )
    const trackFeaturesArr = tracksFeaturesData.body.audio_features
    // console.log('trackFeatures Array:', trackFeaturesArr)
    // console.log('trackFeatures[0]:', trackFeaturesArr[0])
    // console.log('trackFeatures len:', trackFeaturesArr.length)

    const tracksFeaturesAvg = {
      danceability:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.danceability,
          0
        ) / trackFeaturesArr.length,
      energy:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.energy,
          0
        ) / trackFeaturesArr.length,
      key:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.key,
          0
        ) / trackFeaturesArr.length,
      loudness:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.loudness,
          0
        ) / trackFeaturesArr.length,
      mode:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.mode,
          0
        ) / trackFeaturesArr.length,
      speechiness:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.speechiness,
          0
        ) / trackFeaturesArr.length,
      acousticness:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.acousticness,
          0
        ) / trackFeaturesArr.length,
      instrumentalness:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.instrumentalness,
          0
        ) / trackFeaturesArr.length,
      liveness:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.liveness,
          0
        ) / trackFeaturesArr.length,
      valence:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.valence,
          0
        ) / trackFeaturesArr.length,
      tempo:
        trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.tempo,
          0
        ) / trackFeaturesArr.length
    }
    console.log('track features avg:', tracksFeaturesAvg)
    return tracksFeaturesAvg
  } catch (err) {
    console.log('Error:', err)
  }
}

module.exports = {
  spotifyApi,
  spotifyLogin,
  spotifyCallback,
  spotifyRefreshToken,
  getData
}
