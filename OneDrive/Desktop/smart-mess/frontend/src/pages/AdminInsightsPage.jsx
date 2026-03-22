// ============================================================
//  pages/AdminInsightsPage.jsx  — AI insights + email reports
// ============================================================

import { useState, useEffect } from 'react'
import { getInsights, sendReport } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function AdminInsightsPage() {
  const { user }              = useAuth()
  const isAdmin               = user?.role === 'admin'

  const [insights,  setInsights]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  // Email form state
  const [emails,     setEmails]     = useState('')
  const [frequency,  setFrequency]  = useState('weekly')
  const [sending,    setSending]    = useState(false)
  const [emailMsg,   setEmailMsg]   = useState(null)

  useEffect(() => {
    getInsights()
      .then(d => setInsights(d.insights || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSendReport() {
    const recipientList = emails.split(',').map(e => e.trim()).filter(Boolean)
    if (recipientList.length === 0) { setEmailMsg({ type: 'error', msg: 'Enter at least one email.' }); return }

    setSending(true); setEmailMsg(null)
    try {
      const res = await sendReport({ recipients: recipientList, frequency })
      setEmailMsg({ type: 'success', msg: `✅ Report sent to ${res.sent_to.length} recipient(s)!` })
    } catch (err) {
      setEmailMsg({ type: 'error', msg: err.message })
    } finally {
      setSending(false)
    }
  }

  const statusColor = {
    '✅ Excellent':         'var(--green)',
    '⚠️ Needs Improvement': 'var(--orange)',
    '🚨 Critical':          'var(--red)',
    '⚪ No Data':           'var(--grey)',
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" /><span>Analysing data...</span></div>
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>🤖 AI Insights</h1>
      <p style={{ color: 'var(--grey)', fontSize: 14, marginBottom: 28 }}>
        Rule-based analysis of mess performance. {isAdmin ? 'You can send reports via email.' : 'Read-only view.'}
      </p>

      {/* Insights cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {insights.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: 40 }}>📊</div>
            <p style={{ marginTop: 12, color: 'var(--grey)' }}>No insights yet. Add mess locations and collect feedback first.</p>
          </div>
        ) : insights.map((ins, i) => (
          <div key={i} className="card" style={{ border: `2px solid ${(statusColor[ins.status] || 'var(--border)')}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>{ins.mess}</h3>
              <span style={{ fontSize: 22 }}>
                {ins.status?.includes('Excellent') ? '✅' : ins.status?.includes('Needs') ? '⚠️' : ins.status?.includes('Critical') ? '🚨' : '⚪'}
              </span>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                background: `${(statusColor[ins.status] || '#999')}20`,
                color: statusColor[ins.status] || 'var(--grey)',
              }}>
                {ins.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Overall',  value: ins.overall_avg  },
                { label: 'Hygiene',  value: ins.hygiene_score },
                { label: 'Taste',    value: ins.taste_score   },
                { label: 'Feedback', value: ins.total_feedback },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--grey)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--dark)' }}>{value ?? '—'}</div>
                </div>
              ))}
            </div>

            {ins.recommendation && (
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--dark)' }}>
                💡 {ins.recommendation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Email report sender (admin only) */}
      {isAdmin && (
        <div className="card" style={{ maxWidth: 560 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>📧 Send Analytics Report</h2>
          <p style={{ fontSize: 13, color: 'var(--grey)', marginBottom: 20 }}>
            Email the full analytics report to one or more addresses. Supports weekly, monthly, and yearly reports.
          </p>

          {emailMsg && (
            <div className={`alert alert-${emailMsg.type}`} style={{ marginBottom: 16 }}>{emailMsg.msg}</div>
          )}

          <div className="form-group">
            <label className="label">Recipient Emails (comma-separated)</label>
            <textarea className="input" rows={3}
              placeholder="admin@college.edu, principal@college.edu, mess@college.edu"
              value={emails} onChange={e => setEmails(e.target.value)} />
            <div style={{ fontSize: 11, color: 'var(--grey)', marginTop: 4 }}>
              You can enter multiple email addresses separated by commas.
            </div>
          </div>

          <div className="form-group">
            <label className="label">Report Frequency</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['weekly', 'monthly', 'yearly'].map(f => (
                <button key={f} onClick={() => setFrequency(f)} className={`btn btn-sm ${frequency === f ? 'btn-primary' : 'btn-ghost'}`}>
                  {f === 'weekly' ? '📅 Weekly' : f === 'monthly' ? '🗓️ Monthly' : '📆 Yearly'}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-green" onClick={handleSendReport} disabled={sending}>
            {sending ? <><span className="spinner" /> Sending...</> : '📤 Send Report Now'}
          </button>

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--grey)' }}>
            ⚙️ Configure SMTP settings in the backend <code>.env</code> file to enable email sending.
          </div>
        </div>
      )}
    </div>
  )
}
