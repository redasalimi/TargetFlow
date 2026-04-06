export const BASE = 'http://127.0.0.1:8000'

function getToken() {
  return localStorage.getItem('tf_access_token') || sessionStorage.getItem('tf_access_token')
}

export function setToken(token) {
  localStorage.setItem('tf_access_token', token)
  sessionStorage.setItem('tf_access_token', token)
}

export function clearToken() {
  localStorage.removeItem('tf_access_token')
  sessionStorage.removeItem('tf_access_token')
}

async function request(method, path, body, isForm = false) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let bodyData
  if (isForm) {
    bodyData = body // FormData
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    bodyData = JSON.stringify(body)
  }

  const res = await fetch(BASE + path, { method, headers, body: bodyData })

  if (res.status === 401 || res.status === 403) {
    clearToken()
    sessionStorage.removeItem('tf_user')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `Erreur ${res.status}: ${res.statusText}` }))
    throw new Error(err.detail || JSON.stringify(err))
  }

  return res.json()
}

export const api = {
  register: (username, password) =>
    request('POST', '/auth/register/', { username, password }),

  login: (username, password) =>
    request('POST', '/auth/login/', { username, password }),

  uploadCSV: (file, nClusters, generatePersonas = false) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('n_clusters', nClusters)
    formData.append('generate_personas', generatePersonas)
    return request('POST', '/analysis/upload/', formData, true)
  },

  dashboard: () => request('GET', '/analysis/dashboard/'),

  insights: () => request('GET', '/analysis/insights/'),

  startupAI: (data) => request('POST', '/ai/startup/', data),
  getStartupHistory: () => request('GET', '/ai/startup/history/'),

  getProfile: () => request('GET', '/auth/profile/'),
  updateProfile: (data) => request('PATCH', '/auth/profile/', data),

  getNotifications: () => request('GET', '/analysis/notifications/'),
  markNotificationRead: (id) => request('POST', id ? `/analysis/notifications/${id}/read/` : '/analysis/notifications/read/'),

  getUsers: () => request('GET', '/auth/users/'),
  updateUserRole: (id, data) => request('PATCH', `/auth/users/${id}/`, data),

  downloadPDF: async () => {
    const token = getToken()
    // Force absolute URL for Vercel
    const fullUrl = `${BASE}/analysis/export/pdf/`
    const res = await fetch(fullUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Echec du telechargement PDF (Vercel Fix)')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TargetFlow_Rapport.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  },

  downloadCSV: async () => {
    const token = getToken()
    const fullUrl = `${BASE}/analysis/export/csv/`
    const res = await fetch(fullUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Echec du telechargement CSV')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TargetFlow_Data.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
  },

  predictCampaign: (segment, campaign) => 
    request('POST', '/analysis/simulate/', { segment, campaign }),
  
  compareCampaigns: (segment, campaigns) => 
    request('POST', '/analysis/campaigns/compare/', { segment, campaigns }),
}
