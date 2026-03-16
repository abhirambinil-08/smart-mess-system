// ============================================================
//  pages/FeedbackPage.jsx
//  Student-facing feedback form (opened after scanning QR)
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { submitFeedback, getAllMess } from '../utils/api'

// Simple browser fingerprint (device ID) — no library needed
const getFingerprint = () => {
  const key = 'mess_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}

export default function FeedbackPage() {
  const [params]       = useSearchParams()
  const autoMess       = params.get('mess') || ''   // from QR URL

  const startTime      = useRef(Date.now())          // track form open time

  const [messList, setMessList]   = useState([])
  const [loading,  setLoading]    = useState(false)
  const [status,   setStatus]     = useState(null)   // { type: 'success'|'error', msg }

  const [form, setForm] = useState({
    institution:  '',
    mess:         autoMess,
    meal_type:    '',
    food_quality: 0,
    taste:        0,
    hygiene:      0,
    portion_size: 0,
    comment:      '',
  })

  // Load mess list for dropdown
  useEffect(() => {
    getAllMess()
      .then(d => setMessList(d.mess || []))
      .catch(() => {})
  }, [])

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async () => {
    // Validate all required fields
    if (!form.institution || !form.mess || !form.meal_type) {
      setStatus({ type: 'error', msg: 'Please fill in Institution, Mess, and Meal Type.' })
      return
    }
    if ([form.food_quality, form.taste, form.hygiene, form.portion_size].includes(0)) {
      setStatus({ type: 'error', msg: 'Please give a star rating for all 4 categories.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      await submitFeedback({
        ...form,
        device_fingerprint: getFingerprint(),
        interaction_time:   (Date.now() - startTime.current) / 1000,
      })
      setStatus({ type: 'success', msg: '✅ Thank you! Your feedback has been submitted.' })
      // Reset form (keep mess from URL)
      setForm(f => ({ ...f, institution: '', meal_type: '', food_quality: 0,
        taste: 0, hygiene: 0, portion_size: 0, comment: '' }))
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1A56A0 0%, #1ABC9C 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>

      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24, color: '#fff' }}>
          <div style={{ fontSize: 48 }}>🍱</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>Mess Feedback</h1>
          <p style={{ opacity: 0.85, fontSize: 14 }}>Your feedback helps improve food quality</p>
        </div>

        <div className="card">

          {/* Status alert */}
          {status && (
            <div className={`alert alert-${status.type}`} style={{ marginBottom: 20 }}>
              {status.msg}
            </div>
          )}

          {/* Institution */}
          <div className="form-group">
            <label className="label">Institution *</label>
            <input className="input" placeholder="e.g. IILM University"
              value={form.institution} onChange={e => set('institution', e.target.value)} />
          </div>

          {/* Mess */}
          <div className="form-group">
            <label className="label">Mess *</label>
            <select className="input" value={form.mess} onChange={e => set('mess', e.target.value)}>
              <option value="">-- Select Mess --</option>
              {messList.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              {autoMess && !messList.find(m => m.name === autoMess) &&
                <option value={autoMess}>{autoMess}</option>}
            </select>
          </div>

          {/* Meal type */}
          <div className="form-group">
            <label className="label">Meal Type *</label>
            <select className="input" value={form.meal_type} onChange={e => set('meal_type', e.target.value)}>
              <option value="">-- Select Meal --</option>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 16px' }} />
          <p style={{ fontSize: 13, color: 'var(--grey)', marginBottom: 12 }}>Rate each category (1 = Poor, 5 = Excellent)</p>

          <StarRating label="🍕 Food Quality *" value={form.food_quality} onChange={v => set('food_quality', v)} />
          <StarRating label="😋 Taste *"        value={form.taste}        onChange={v => set('taste', v)} />
          <StarRating label="🧹 Hygiene *"      value={form.hygiene}      onChange={v => set('hygiene', v)} />
          <StarRating label="🥣 Portion Size *" value={form.portion_size} onChange={v => set('portion_size', v)} />

          {/* Comment */}
          <div className="form-group" style={{ marginTop: 8 }}>
            <label className="label">Comment (optional)</label>
            <textarea className="input" placeholder="Any specific feedback or suggestions..."
              value={form.comment} maxLength={200}
              onChange={e => set('comment', e.target.value)} />
            <div style={{ fontSize: 11, color: 'var(--grey)', textAlign: 'right', marginTop: 4 }}>
              {form.comment.length}/200
            </div>
          </div>

          <button className="btn btn-green btn-full" onClick={handleSubmit} disabled={loading}
            style={{ marginTop: 8, padding: '13px', fontSize: 15 }}>
            {loading ? <><span className="spinner" /> Submitting...</> : '🚀 Submit Feedback'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 16 }}>
          Anonymous feedback · Powered by SmartMess
        </p>
      </div>
    </div>
  )
}
