import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Layout from '../components/Layout'

export default function ProfilePage({ user, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    api.getProfile()
      .then(res => setProfile(res))
      .catch(err => setError('Erreur de chargement: ' + err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await api.updateProfile(profile)
      setSuccess('Profil mis à jour avec succès.')
      if (res.username && res.username !== user) {
        sessionStorage.setItem('tf_user', res.username)
        window.location.reload() // reload to update global user state
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Layout user={user} onLogout={onLogout}>
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        Chargement de votre profil...
      </div>
    </Layout>
  )

  if (!profile && error) return (
    <Layout user={user} onLogout={onLogout}>
      <div style={{ padding: 60, textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
        <div style={{ fontSize: 40, marginBottom: 20 }}>⚠️</div>
        <div style={{ color: '#FCA5A5', marginBottom: 20, fontWeight: 600 }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>Réessayer</button>
      </div>
    </Layout>
  )

  if (!profile) return null;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Mon Profil</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Gérez vos informations et votre plan d'abonnement.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 280px', gap: 32 }}>
          {/* Main Form */}
          <div style={{ background: 'var(--surface)', padding: 32, borderRadius: 20, border: '1px solid var(--border)' }}>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}
            {success && <div style={{ background: 'rgba(0,229,196,0.1)', color: 'var(--accent)', padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid rgba(0,229,196,0.3)' }}>{success}</div>}
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface2)', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                  {profile.avatar ? <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--text-muted)' }}>{user?.charAt(0).toUpperCase() || 'U'}</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>URL de l'avatar</label>
                  <input name="avatar" value={profile.avatar || ''} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Nom d'utilisateur</label>
                <input name="username" value={profile.username || ''} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Email</label>
                <input name="email" type="email" value={profile.email || ''} onChange={handleChange} required style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Entreprise</label>
                  <input name="company" value={profile.company || ''} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Téléphone</label>
                  <input name="phone" value={profile.phone || ''} onChange={handleChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Biographie</label>
                <textarea name="bio" value={profile.bio || ''} onChange={handleChange} rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={saving} style={{
                background: 'var(--accent)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', width: '100%'
              }}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>

          {/* Plan Info */}
          <div>
            <div style={{ background: 'var(--surface2)', padding: 24, borderRadius: 20, border: '1px solid var(--border)', position: 'sticky', top: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.05em' }}>Abonnement Actuel</div>
              <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: profile.plan === 'expert' ? 'var(--accent)' : profile.plan === 'business' ? 'var(--accent2)' : 'var(--text)', marginBottom: 16, textTransform: 'capitalize' }}>
                {profile.plan === 'expert' ? 'Expert Pro' : profile.plan}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                {profile.plan === 'starter' && 'Limité à 1 analyse CSV et 500 clients maximum.'}
                {profile.plan === 'expert' && 'Analyses illimitées, exports PDF et campagnes Mailchimp actives.'}
                {profile.plan === 'business' && 'Accès intégral à toutes les fonctionnalités et API.'}
              </div>
              <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px', width: '100%', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Mettre à niveau
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
