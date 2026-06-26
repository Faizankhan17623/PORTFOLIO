export const defaultSkills = {
  frontend: ['HTML5', 'JavaScript (ES6+)', 'React'],
  styling: ['CSS3', 'Tailwind CSS'],
  libraries: ['Bootstrap', 'GSAP'],
  backend: ['Node.js', 'Express.js'],
  apis: ['REST API', 'FastAPI (Learning)'],
  database: ['MongoDB', 'MySQL'],
  tools: ['Git', 'GitHub', 'Postman', 'Docker'],
  ai: ['Prompt Engineering', 'Generative AI', 'RAG', 'MCP'],
  deployment: ['CI/CD', 'Vercel', 'AWS S3', 'Render'],
}

export const defaultProjects = [
  {
    id: 12,
    title: 'Personal GPT',
    description:
      'Full-stack RAG chat agent with a ChatGPT-style interface. Chat freely with AI or upload PDFs, Word & text files to get answers grounded in your own documents. Features word-by-word streaming (SSE), auto-titled chats, persistent history, and a document chunking + embedding pipeline.',
    tags: ['React', 'Node.js', 'Express', 'Groq', 'Pinecone', 'RAG', 'Redux'],
    category: 'AI / CV',
    emoji: '🤖',
    github: 'https://github.com/Faizankhan17623/personal-gpt',
    live: 'https://personal-gpt-beta.vercel.app/',
  },
  {
    id: 1,
    title: 'Cine Circuit',
    description:
      'Full-stack movie ticketing platform with multi-role dashboards (Admin, Theatre, Organizer, User), Razorpay payment integration, JWT auth, real-time seat booking and show management.',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Razorpay', 'JWT'],
    category: 'Full-Stack',
    emoji: '🎬',
    github: '',
    live: 'https://mw-bay.vercel.app/',
  },
  {
    id: 2,
    title: 'StudyNotion',
    description:
      'Full-stack EdTech platform where instructors can create & sell courses and students can purchase, track progress, and learn. Features Razorpay payments, Cloudinary media, OTP auth, and role-based dashboards.',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'Razorpay', 'Cloudinary'],
    category: 'Full-Stack',
    emoji: '📚',
    github: '',
    live: 'https://study-notion-project-phi.vercel.app/',
  },
  {
    id: 3,
    title: 'Razorpay Clone',
    description:
      'Pixel-perfect clone of the Razorpay landing page built with React and Tailwind CSS. Focuses on responsive design, component architecture, and modern UI layout techniques.',
    tags: ['React', 'Tailwind CSS'],
    category: 'Frontend',
    emoji: '💳',
    github: '',
    live: '',
  },
  {
    id: 4,
    title: 'Weather Predictor',
    description:
      'A clean weather forecasting app that fetches real-time weather data based on city search. Built with vanilla JavaScript and CSS — no frameworks, just core web fundamentals.',
    tags: ['JavaScript', 'CSS', 'OpenWeather API'],
    category: 'Frontend',
    emoji: '🌤️',
    github: '',
    live: '',
  },
  {
    id: 5,
    title: 'Calculator',
    description:
      'A fully functional calculator with a clean UI built using vanilla JavaScript and CSS. Supports all basic arithmetic operations with keyboard support and error handling.',
    tags: ['JavaScript', 'CSS', 'HTML5'],
    category: 'Frontend',
    emoji: '🧮',
    github: '',
    live: '',
  },
  {
    id: 8,
    title: 'ByteFeed',
    description:
      'Free, open-source blog aggregator that collects real-time posts from 22 top AI, ML & software engineering blogs via RSS feeds. Features search, bookmarks, trending posts, dark mode, and zero login required.',
    tags: ['React', 'Vite', 'RSS', 'Axios', 'Vercel'],
    category: 'Full-Stack',
    emoji: '📡',
    github: 'https://github.com/Faizankhan17623/ByteFeed',
    live: 'https://byte-feed-two.vercel.app/',
  },
  {
    id: 7,
    title: 'Eye Blink & Finger Counter',
    description:
      'Real-time computer vision app that tracks eye blinks per minute, calculates attention/focus score (0–100%), detects drowsiness, counts raised fingers, and recognizes hand gestures — all from a live webcam feed.',
    tags: ['Python', 'OpenCV', 'MediaPipe', 'NumPy', 'Computer Vision'],
    category: 'AI / CV',
    emoji: '👁️',
    github: 'https://github.com/Faizankhan17623/eye-blink-finger-counter',
    live: '',
  },
  {
    id: 6,
    title: 'Second Brain / Knowledge Base',
    description:
      'A personal wiki built with Obsidian and Claude — covering dev notes, learnings, research, and ideas all in one place. My external memory system for everything I learn.',
    tags: ['Obsidian', 'Claude', 'Knowledge Management', 'Markdown'],
    category: 'Tools',
    emoji: '🧠',
    github: '',
    live: 'https://faizankhan17623.github.io/Quarts/',
  },
  {
    id: 10,
    title: 'GTA Clone',
    description:
      'Open-world GTA-style action game running entirely in the browser with Three.js and zero build step. Features driving, helicopters, weapons, a 5-star wanted system with police chase AI, day/night cycle, and procedural sound.',
    tags: ['Three.js', 'JavaScript', 'WebGL', 'Game Dev', 'Web Audio'],
    category: 'Games',
    emoji: '🚗',
    github: 'https://github.com/Faizankhan17623/Gta-Clone',
    live: 'https://faizankhan17623.github.io/Gta-Clone/',
  },
  {
    id: 11,
    title: 'Neon Blaster',
    description:
      'Neon arcade space shooter in a single HTML file — pilot a rocket against pixel-art alien invaders. Combos, boss fights, power-ups, particle explosions, and synthesized Web Audio sound. Pure HTML/CSS/JS with zero dependencies.',
    tags: ['JavaScript', 'HTML5 Canvas', 'CSS', 'Game Dev', 'Web Audio'],
    category: 'Games',
    emoji: '🚀',
    github: 'https://github.com/Faizankhan17623/Neon-Blaster',
    live: 'https://faizankhan17623.github.io/Neon-Blaster/',
  },
]
