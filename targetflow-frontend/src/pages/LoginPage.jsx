import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api/client'

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.login(form.username, form.password)
      setToken(data.access_token)
      sessionStorage.setItem('tf_role', data.role || 'viewer')
      sessionStorage.setItem('tf_plan', data.plan || 'starter')
      onLogin(form.username, data.access_token)
      nav('/app')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -200, right: -200,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,229,196,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -300, left: -200,
        width: 700, height: 700,
        background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{
        width: '100%',
        maxWidth: 420,
        padding: '0 24px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 32,
            color: 'var(--accent)',
            letterSpacing: '-0.03em',
          }}>
            Target<span style={{ color: 'var(--text)' }}>Flow</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6, letterSpacing: '0.05em' }}>
            MARKETING INTELLIGENCE PLATFORM
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '36px 32px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 6,
          }}>Connexion</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>
            Accédez à votre tableau de bord analytique
          </p>

          <form onSubmit={handle}>
            <Field
              label="Nom d'utilisateur"
              type="text"
              value={form.username}
              onChange={v => setForm(f => ({ ...f, username: v }))}
              placeholder="votre_username"
            />
            <Field
              label="Mot de passe"
              type="password"
              value={form.password}
              onChange={v => setForm(f => ({ ...f, password: v }))}
              placeholder="••••••••"
              style={{ marginBottom: 24 }}
            />

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: '#FCA5A5',
                marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%',
              padding: '13px',
              borderRadius: 10,
              background: loading ? 'var(--border)' : 'var(--accent)',
              border: 'none',
              color: loading ? 'var(--text-muted)' : '#060A14',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, style }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text)',
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
