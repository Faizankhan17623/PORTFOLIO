const ITEMS = [
  'REACT', 'NODE.JS', 'MONGODB', 'EXPRESS', 'JAVASCRIPT', 'TYPESCRIPT',
  'TAILWIND', 'REST API', 'JWT AUTH', 'DOCKER', 'GIT', 'VITE',
  'FRAMER MOTION', 'MONGOOSE', 'CLOUDINARY', 'RAZORPAY', 'REDUX', 'SOCKET.IO',
]

const SEPARATOR = ' ◆ '

const track = [...ITEMS, ...ITEMS].join(SEPARATOR) + SEPARATOR

export default function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-label">// TECH_STACK</div>
      <div className="ticker-track-wrap">
        <div className="ticker-track">
          <span className="ticker-content">{track}</span>
          <span className="ticker-content" aria-hidden="true">{track}</span>
        </div>
      </div>
    </div>
  )
}
