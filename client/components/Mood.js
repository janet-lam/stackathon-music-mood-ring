import React from 'react'
import {connect} from 'react-redux'
import Chart from 'chart.js'

class Mood extends React.Component {
  constructor(props) {
    super(props)
    this.chartRef = React.createRef()
  }

  componentDidMount() {
    const spotifyData = {
      labels: [
        'acousticness',
        'danceability',
        'energy',
        'loudness',
        'positiveness'
      ],
      datasets: [
        {
          label: '',
          backgroundColor: 'rgba(29,185,84,.35)',
          data: [
            this.props.data.acousticness,
            this.props.data.danceability,
            this.props.data.energy,
            this.props.data.loudness,
            this.props.data.valence
          ]
        }
      ]
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scale: {
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 1
          // stepSize: 0.2,
        },
        pointLabels: {
          fontSize: 18
        }
      }
    }

    this.myChart = new Chart(this.chartRef.current, {
      type: 'radar',
      data: spotifyData,
      options: chartOptions
    })
  }

  getMoodColorClass() {
    const acousticness = this.props.data.acousticness
    const danceability = this.props.data.danceability
    const energy = this.props.data.energy
    const loudness = this.props.data.loudness
    const valence = this.props.data.valence

    //
    let colorClass
    let num = Math.round(Math.random()) + 1
    if (danceability > 0.7 && energy > 0.7 && valence > 0.7) {
      colorClass = `happy${num}`
    } else if (valence < 0.5 && energy > 0.55) {
      colorClass = `sad${num}`
    } else {
      colorClass = `chill${num}`
    }

    return colorClass
  }

  render() {
    const colorClass = this.getMoodColorClass()

    return (
      <div className={`mood-page ${colorClass}`}>
        <p className="username">{this.props.user}</p>
        <div className="radar-chart-container">
          <canvas
            id="spotify-radar"
            ref={this.chartRef}
            width="100"
            height="70"
          />
        </div>
        <p className="bpm">{Math.round(this.props.data.tempo)} BPM</p>
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

export default connect(mapStateToProps)(Mood)
