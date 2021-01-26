import React from 'react'
import {connect} from 'react-redux'
import SpotifyWebApi from 'spotify-web-api-node'
import generateRandomString from '../../server/utils'
import querystring from 'querystring'
import {setData} from '../store/data'
import {setUser} from '../store/user'

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URI} = require('../../secrets')
const client_id = CLIENT_ID || process.env.CLIENT_ID
const client_secret = CLIENT_SECRET || process.env.CLIENT_SECRET
const redirect_uri = REDIRECT_URI || process.env.REDIRECT_URI

const scope = 'user-read-private user-read-recently-played'
const state = generateRandomString(16)

const credentials = {
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
}

const spotifyApi = new SpotifyWebApi(credentials)
const authorizeURL =
  'https://accounts.spotify.com/authorize?' +
  querystring.stringify({
    // response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
    response_type: 'token',
    show_dialog: 'true'
  })

// const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state) -> doesnt work on client side bc exposes secrets
// const code = this.getQueryVariable('code')
// const authGrantCode = spotifyApi.authorizationCodeGrant(code) -> doesnt work on client side bc exposes secrets

class Home extends React.Component {
  constructor(props) {
    super(props)
    const params = this.getHashParams()
    console.log('params:', params)
    const token = params.access_token
    if (token) {
      spotifyApi.setAccessToken(token)
    }
    this.state = {loggedIn: !!token, tracksFeaturesAvg: ''}
  }

  getHashParams() {
    let hashParams = {}
    let e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1)
    e = r.exec(q)
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2])
      e = r.exec(q)
    }
    return hashParams
  }

  async componentDidMount() {
    const data = await this.getRecentTracksData()
    this.props.setData(data)
    const user = await this.getUserId()
    this.props.setUser(user)

    this.props.history.push('/mood')
  }

  async getUserId() {
    const me = await spotifyApi.getMe()
    const userId = me.body.id
    return userId
  }

  async getRecentTracksData() {
    const recentTracksData = await spotifyApi.getMyRecentlyPlayedTracks({
      limit: 50
    })
    const trackIdsArr = recentTracksData.body.items.map(track => track.track.id)

    const tracksFeaturesData = await spotifyApi.getAudioFeaturesForTracks(
      trackIdsArr
    )
    const trackFeaturesArr = tracksFeaturesData.body.audio_features

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
        //   convert -60db to 0db to 0 to 1 scale
        (trackFeaturesArr.reduce(
          (accumulator, track) => accumulator + track.loudness,
          0
        ) /
          trackFeaturesArr.length +
          60) /
        60,
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

    return tracksFeaturesAvg
  }

  render() {
    return (
      <div className="home-page">
        <h3 className="title">Music Mood Ring</h3>
        <div className="description-container">
          <p className="description">What's your current vibe?</p>
          <br />
          <p className="description">This music mood ring can interpret what</p>
          <p className="description">you have been recently listening to</p>
          <p className="description">and give you a moody color.</p>
        </div>
        <a className="btn btn-primary start-button" href={authorizeURL}>
          Let's Get Started!
        </a>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    data: state.data
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setData: data => dispatch(setData(data)),
    setUser: user => dispatch(setUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
