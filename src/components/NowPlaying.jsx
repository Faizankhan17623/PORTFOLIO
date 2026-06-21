import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function NowPlaying() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let timer
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/now-playing`)
        setData(await res.json())
      } catch {
        setData({ isPlaying: false, configured: false })
      }
    }
    load()
    timer = setInterval(load, 20000) // refresh every 20s
    return () => clearInterval(timer)
  }, [])

  // Hide entirely if Spotify isn't configured yet.
  if (!data || data.configured === false) return null

  const playing = data.isPlaying

  return (
    <motion.a
      className="now-playing"
      href={playing ? data.songUrl : 'https://open.spotify.com'}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className={`np-art ${playing ? 'spin' : ''}`}>
        {playing && data.albumArt ? (
          <img src={data.albumArt} alt={data.album} />
        ) : (
          <span className="np-spotify">♪</span>
        )}
      </div>
      <div className="np-info">
        <div className="np-label">
          {playing ? (
            <>
              <span className="np-bars"><span /><span /><span /></span> Now playing
            </>
          ) : (
            'Not playing right now'
          )}
        </div>
        {playing ? (
          <>
            <div className="np-title">{data.title}</div>
            <div className="np-artist">{data.artist}</div>
          </>
        ) : (
          <div className="np-title">on Spotify</div>
        )}
      </div>
    </motion.a>
  )
}
