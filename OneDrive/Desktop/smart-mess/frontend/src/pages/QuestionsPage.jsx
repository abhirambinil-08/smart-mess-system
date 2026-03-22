// ============================================================
//  pages/QuestionsPage.jsx  — Dynamic MCQ question management
//  Mess staff: add/edit   |   Admin: full CRUD
// ============================================================

import { useState, useEffect } from 'react'
import { getAllQuestions, addQuestion, updateQuestion, deleteQuestion } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const EMOJI_PRESETS = ['😡', '😐', '🙂', '😍']
const CATEGORIES = ['food_quality', 'taste', 'hygiene', 'portion', 'staff_behaviour', 'general']

const BLANK_FORM = {
  question_text: '',
  category:      'food_quality',
  meal_type:     'All',
  options:       ['Very Bad', 'Bad', 'Good', 'Excellent'],
  emoji_scale:   ['😡', '😐', '🙂', '😍'],
  menu_item:     '',
  date_str:      '',
}

export default function QuestionsPage() {
  const { user }              = useAuth()
  const isAdmin               = user?.role === 'admin'

  const [questions, setQuestions] = useState([])
  const [form,      setForm]      = useState({ ...BLANK_FORM })
  const [editId,    setEditId]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  useEffect(() => { loadQuestions() }, [])

  async function loadQuestions() {
    setLoading(true)
    try { setQuestions((await getAllQuestions()).questions || []) }
    catch {}
    finally { setLoading(false) }
  }

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function setOption(i, v) { setForm(f => { const o = [...f.options]; o[i] = v; return { ...f, options: o } }) }
  function setEmoji(i, v)  { setForm(f => { const e = [...f.emoji_scale]; e[i] = v; return { ...f, emoji_scale: e } }) }

  function startEdit(q) {
    setEditId(q.id)
    setForm({
      question_text: q.question_text,
      category:      q.category,
      meal_type:     q.meal_type,
      options:       [...q.options],
      emoji_scale:   [...q.emoji_scale],
      menu_item:     q.menu_item  || '',
      date_str:      q.date_str   || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() { setEditId(null); setForm({ ...BLANK_FORM }) }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.question_text) { setError('Question text is required.'); return }
    if (form.options.some(o => !o.trim())) { setError('All option fields must be filled.'); return }

    setSaving(true); setError(''); setSuccess('')
    try {
      if (editId) {
        await updateQuestion(editId, form)
        setSuccess('Question updated!')
        setEditId(null)
      } else {
        await addQuestion(form)
        setSuccess('Question added!')
      }
      setForm({ ...BLANK_FORM })
      loadQuestions()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this question?')) return
    try {
      await deleteQuestion(id)
      loadQuestions()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>❓ Question Management</h1>
      <p style={{ color: 'var(--grey)', fontSize: 14, marginBottom: 28 }}>
        Manage daily MCQ questions for the feedback form. Questions can be meal-specific or date-specific.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px,440px) 1fr', gap: 24, alignItems: 'start' }}>

        {/* Add/Edit Form */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>
            {editId ? '✏️ Edit Question' : '➕ Add Question'}
          </h2>

          {error   && <div className="alert alert-error"   style={{ marginBottom: 14 }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: 14 }}>{success}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="label">Question Text *</label>
              <textarea className="input" rows={2} placeholder="e.g. How was today's dal makhani?"
                value={form.question_text} onChange={e => setF('question_text', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Category</label>
                <select className="input" value={form.category} onChange={e => setF('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Meal Type</label>
                <select className="input" value={form.meal_type} onChange={e => setF('meal_type', e.target.value)}>
                  <option value="All">All Meals</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="label">Menu Item (optional)</label>
              <input className="input" placeholder="e.g. Dal Makhani, Paneer Butter Masala"
                value={form.menu_item} onChange={e => setF('menu_item', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="label">Date (leave blank = permanent)</label>
              <input className="input" type="date"
                value={form.date_str} onChange={e => setF('date_str', e.target.value)} />
            </div>

            {/* Options + emoji */}
            <div className="form-group">
              <label className="label">Options & Emoji Scale</label>
              {form.options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input className="input" value={form.emoji_scale[i]}
                    onChange={e => setEmoji(i, e.target.value)}
                    style={{ width: 54, textAlign: 'center', fontSize: 20, padding: '8px' }} />
                  <input className="input" value={opt} placeholder={`Option ${i + 1}`}
                    onChange={e => setOption(i, e.target.value)} />
                </div>
              ))}
              <div style={{ fontSize: 12, color: 'var(--grey)', marginTop: 4 }}>
                Tip: Paste any emoji in the emoji field 😡😐🙂😍
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spinner" /> Saving...</> : editId ? '✅ Update' : '➕ Add Question'}
              </button>
              {editId && (
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* Question list */}
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            All Questions
            <span style={{ fontSize: 13, color: 'var(--grey)', fontWeight: 400, marginLeft: 8 }}>
              ({questions.length})
            </span>
          </h2>

          {loading ? (
            <div className="page-loader"><div className="spinner spinner-dark" /></div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--grey)' }}>
              <p>No custom questions yet. The default questions will be used.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions.map(q => (
                <div key={q.id} style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{q.question_text}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span className="badge badge-blue">{q.category.replace('_', ' ')}</span>
                        <span className="badge badge-orange">{q.meal_type}</span>
                        {q.date_str && <span className="badge badge-purple">📅 {q.date_str}</span>}
                        {q.menu_item && <span className="badge badge-green">🍛 {q.menu_item}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {q.options.map((opt, i) => (
                          <span key={i} style={{ fontSize: 12, background: 'white', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 8px' }}>
                            {q.emoji_scale[i]} {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(q)}>✏️</button>
                      {isAdmin && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
                          onClick={() => handleDelete(q.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--grey)', marginTop: 6 }}>
                    Added by: {q.created_by} · {new Date(q.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
