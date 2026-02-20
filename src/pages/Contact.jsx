import { useState } from 'react'

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Message sent! (Demo)')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="page">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <h1>Get In <span>Touch</span></h1>
            <p>Have a project in mind? Let's talk!</p>
            <div className="contact-item">
              <div className="icon">📧</div>
              <div className="text">
                <span>Email</span>
                <span>your@email.com</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="icon">📱</div>
              <div className="text">
                <span>Phone</span>
                <span>+1 234 567 890</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="icon">📍</div>
              <div className="text">
                <span>Location</span>
                <span>Your City, Country</span>
              </div>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required placeholder="Your message..." />
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact
