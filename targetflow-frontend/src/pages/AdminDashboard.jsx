import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Layout from '../components/Layout'

export default function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (targetId, newRole) => {
    try {
      await api.updateUserRole(targetId, { role: newRole })
      fetchUsers()
    } catch (err) {
      alert("Erreur: " + err.message)
    }
  }

  const handlePlanChange = async (targetId, newPlan) => {
    try {
      await api.updateUserRole(targetId, { plan: newPlan })
      fetchUsers()
    } catch (err) {
      alert("Erreur: " + err.message)
    }
  }

  if (loading) return <Layout user={user} onLogout={onLogout}><div style={{ padding: 40, color: 'var(--text-muted)' }}>Chargement...</div></Layout>
  if (error) return <Layout user={user} onLogout={onLogout}><div style={{ padding: 40, color: 'var(--danger)' }}>Erreur: {error}</div></Layout>

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    expert: users.filter(u => u.plan === 'expert').length,
    business: users.filter(u => u.plan === 'business').length,
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Administration</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Gestion globale des utilisateurs et statistiques.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          <StatBox label="Utilisateurs totaux" value={stats.total} />
          <StatBox label="Comptes actifs" value={stats.active} />
          <StatBox label="Plans Expert Pro" value={stats.expert} color="var(--accent)" />
          <StatBox label="Plans Business" value={stats.business} color="var(--accent2)" />
        </div>

        <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Nom</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Rôle</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                      <option value="viewer">Lecteur</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <select value={u.plan} onChange={(e) => handlePlanChange(u.id, e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none' }}>
                      <option value="starter">Starter</option>
                      <option value="expert">Expert Pro</option>
                      <option value="business">Business</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

function StatBox({ label, value, color = 'var(--text)' }) {
  return (
    <div style={{ background: 'var(--surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 800, color }}>{value}</div>
    </div>
  )
}
