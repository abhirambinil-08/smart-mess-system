// ============================================================
//  pages/FeedbackPage.jsx  — Public MCQ feedback form
//  Works without login. Time-slot enforced on backend.
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getAllMess, getTodaysQuestions, submitFeedback, uploadImage } from '../utils/api'

// Emoji options for staff behaviour rating
const STAFF_EMOJIS = ['😡', '😐', '🙂', '😍']
const STAFF_LABELS = ['Very Rude', 'Unfriendly', 'Polite', 'Very Helpful']

// Time slot info shown to users
const SLOT_INFO = [
  { label: 'Morning',   time: '7:00 AM – 11:00 AM', icon: '🌅' },
  { label: 'Afternoon', time: '1:00 PM – 3:00 PM',  icon: '☀️' },
  { label: 'Evening',   time: '7:00 PM – 10:00 PM', icon: '🌙' },
]

export default function FeedbackPage() {
  const [params]     = useSearchParams()
  const messIdParam  = params.get('mess')  || ''
  const messName     = params.get('name')  || ''

  const [messList,   setMessList]   = useState([])
  const [questions,  setQuestions]  = useState([])
  const [answers,    setAnswers]    = useState({})      // { questionId: { selected_option, emoji, ... } }
  const [staffRating, setStaffRating] = useState(null)  // 1–4
  const [comment,    setComment]    = useState('')
  const [imageFile,  setImageFile]  = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedMess, setSelectedMess] = useState(messIdParam)
  const [mealType,   setMealType]   = useState('')

  const [loading,    setLoading]    = useState(false)
  const [status,     setStatus]     = useState(null)    // { type, msg }
  const [submitted,  setSubmitted]  = useState(false)
  const [reward,     setReward]     = useState(null)    // milestone reward info

  const fileRef = useRef()

  // Load mess list on mount
  useEffect(() => {
    getAllMess().then(d => setMessList(d.mess || [])).catch(() => {})
  }, [])

  // Load today's questions when meal type changes
  useEffect(() => {
    if (!mealType) return
    getTodaysQuestions(mealType)
      .then(d => { setQuestions(d.questions || []); setAnswers({}) })
      .catch(() => {})
  }, [mealType])

  // Handle image selection
  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Record an answer for a question
  function recordAnswer(q, optionIndex) {
    setAnswers(prev => ({
      ...prev,
      [q.id || q.question_text]: {
        question_id:     q.id || '',
        question_text:   q.question_text,
        selected_option: q.options[optionIndex],
        emoji:           q.emoji_scale[optionIndex],
        category:        q.category,
      },
    }))
  }

  // Submit handler
  async function handleSubmit() {
    if (!selectedMess) { setStatus({ type: 'error', msg: 'Please select a mess.' }); return }
    if (!mealType)     { setStatus({ type: 'error', msg: 'Please select a meal type.' }); return }
    if (questions.length > 0 && Object.keys(answers).length < questions.length) {
      setStatus({ type: 'error', msg: 'Please answer all questions before submitting.' }); return
    }
    if (staffRating === null) { setStatus({ type: 'error', msg: 'Please rate the staff behaviour.' }); return }

    setLoading(true); setStatus(null)

    try {
      // Optional: upload image first
      let imageUrl = ''
      if (imageFile) {
        const imgRes = await uploadImage(imageFile)
        imageUrl = imgRes.url || ''
      }

      const payload = {
        mess_id:         selectedMess,
        meal_type:       mealType,
        answers:         Object.values(answers),
        staff_behaviour: staffRating + 1,   // convert 0-index to 1-4
        image_url:       imageUrl,
        comment:         comment,
      }

      const res = await submitFeedback(payload)

      setSubmitted(true)
      setReward({
        tokens_earned:    res.tokens_earned,
        total_tokens:     res.total_tokens,
        milestone_reward: res.milestone_reward,
        level_info:       res.level_info,
      })
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setLoading(false)
    }
  }

  // ── Submitted success screen ──────────────────────────────
  if (submitted && reward) {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #1A56A0 0%, #1ABC9C 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--dark)', marginBottom: 4 }}>
              Feedback Submitted!
            </h2>
            <p style={{ color: 'var(--grey)', fontSize: 14, marginBottom: 24 }}>
              Thank you for helping improve the mess experience.
            </p>

            {/* Token earned */}
            <div style={{
              background: 'linear-gradient(135deg, #1A56A0, #1ABC9C)',
              borderRadius: 12, padding: '18px 24px', color: 'white', marginBottom: 16,
            }}>
              <div style={{ fontSize: 32 }}>🪙 +{reward.tokens_earned} Token{reward.tokens_earned > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
                Total: <b>{reward.total_tokens}</b> tokens
              </div>
              {reward.tokens_earned === 10 && (
                <div style={{ marginTop: 8, fontSize: 13, background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 12px' }}>
                  ✨ RARE REWARD! You got the jackpot 10 tokens!
                </div>
              )}
            </div>

            {/* Level info */}
            {reward.level_info && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{reward.level_info.level_name}</div>
                <div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 2 }}>{reward.level_info.reward_desc}</div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--grey)', marginBottom: 4 }}>
                    Progress to next level: {reward.level_info.progress_pct}%
                  </div>
                  <div className="level-bar-wrap">
                    <div className="level-bar-fill" style={{ width: `${reward.level_info.progress_pct}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Milestone reward popup */}
            {reward.milestone_reward && (
              <div style={{
                background: '#FFF3E0', border: '2px solid var(--orange)',
                borderRadius: 10, padding: '14px 18px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--orange)' }}>
                  🏆 Milestone Unlocked!
                </div>
                <div style={{ fontSize: 14, color: 'var(--dark)', marginTop: 4 }}>
                  {reward.milestone_reward}
                </div>
                <div style={{ fontSize: 12, color: 'var(--grey)', marginTop: 4 }}>
                  Visit your token page to redeem this reward.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setReward(null); setAnswers({}); setComment(''); setStaffRating(null); setImageFile(null); setImagePreview('') }}>
                Submit Another
              </button>
              <Link to="/login" className="btn btn-ghost">My Account</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main feedback form ────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1A56A0 0%, #1ABC9C 100%)',
      padding: '24px 16px',
    }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: 24 }}>
          <div style={{ fontSize: 52 }}>🍱</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '10px 0 4px' }}>SmartMess Feedback</h1>
          <p style={{ opacity: 0.85, fontSize: 14 }}>Your voice improves every meal 🚀</p>

          {/* Time slots info */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
            {SLOT_INFO.map(s => (
              <span key={s.label} style={{
                background: 'rgba(255,255,255,0.18)', color: 'white',
                padding: '5px 12px', borderRadius: 99, fontSize: 12,
              }}>
                {s.icon} {s.label} {s.time}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          {status && (
            <div className={`alert alert-${status.type}`} style={{ marginBottom: 18 }}>
              {status.msg}
            </div>
          )}

          {/* Step 1: Select Mess & Meal */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              📍 Step 1 — Select Mess & Meal
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Mess Location *</label>
                <select className="input" value={selectedMess} onChange={e => setSelectedMess(e.target.value)}>
                  <option value="">-- Select --</option>
                  {messList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">Meal Type *</label>
                <select className="input" value={mealType} onChange={e => setMealType(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="Breakfast">🌅 Breakfast</option>
                  <option value="Lunch">☀️ Lunch</option>
                  <option value="Dinner">🌙 Dinner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: MCQ Questions */}
          {questions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                ❓ Step 2 — Rate Your Meal
              </div>

              {questions.map((q, qi) => {
                const qKey      = q.id || q.question_text
                const answered  = answers[qKey]

                return (
                  <div key={qKey} style={{
                    background: 'var(--bg)', borderRadius: 10, padding: '16px',
                    marginBottom: 12, border: answered ? '2px solid var(--green)' : '2px solid transparent',
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                      Q{qi + 1}. {q.question_text}
                    </div>
                    {q.menu_item && (
                      <div style={{ fontSize: 12, color: 'var(--grey)', marginBottom: 10 }}>
                        🍛 Today's item: <b>{q.menu_item}</b>
                      </div>
                    )}

                    {/* Emoji + Option buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {q.options.map((opt, oi) => {
                        const isSelected = answered?.selected_option === opt
                        return (
                          <button
                            key={oi}
                            className={`emoji-btn${isSelected ? ' active' : ''}`}
                            onClick={() => recordAnswer(q, oi)}
                            title={opt}
                          >
                            <div style={{ fontSize: 28 }}>{q.emoji_scale[oi]}</div>
                            <div style={{ fontSize: 11, color: isSelected ? 'var(--primary)' : 'var(--grey)', marginTop: 4, fontWeight: 600 }}>
                              {opt}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 3: Staff Behaviour */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              🧑‍🍳 Step 3 — Rate Staff Behaviour *
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '16px' }}>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                How was the behaviour of mess staff during this meal?
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {STAFF_EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    className={`emoji-btn${staffRating === i ? ' active' : ''}`}
                    onClick={() => setStaffRating(i)}
                    title={STAFF_LABELS[i]}
                  >
                    <div style={{ fontSize: 32 }}>{emoji}</div>
                    <div style={{ fontSize: 11, color: staffRating === i ? 'var(--primary)' : 'var(--grey)', marginTop: 4, fontWeight: 600 }}>
                      {STAFF_LABELS[i]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 4: Optional image + comment */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              📎 Step 4 — Optional Extras
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="label">Upload a Photo (optional)</label>
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: '2px dashed var(--border)', borderRadius: 10, padding: '20px',
                  textAlign: 'center', cursor: 'pointer', background: 'var(--bg)',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ maxHeight: 140, borderRadius: 8, maxWidth: '100%' }} />
                ) : (
                  <>
                    <div style={{ fontSize: 32 }}>📸</div>
                    <div style={{ fontSize: 13, color: 'var(--grey)', marginTop: 6 }}>
                      Click to upload or capture photo
                    </div>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment"
                style={{ display: 'none' }} onChange={handleImageChange} />
              {imageFile && (
                <button onClick={() => { setImageFile(null); setImagePreview('') }}
                  style={{ marginTop: 6, fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ✕ Remove image
                </button>
              )}
            </div>

            {/* Comment */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">Additional Comment (optional)</label>
              <textarea className="input" placeholder="Any specific feedback or suggestions..."
                value={comment} maxLength={300}
                onChange={e => setComment(e.target.value)} />
              <div style={{ fontSize: 11, color: 'var(--grey)', textAlign: 'right', marginTop: 2 }}>
                {comment.length}/300
              </div>
            </div>
          </div>

          {/* Submit */}
          <button className="btn btn-green btn-full" onClick={handleSubmit} disabled={loading}
            style={{ padding: '14px', fontSize: 16, marginTop: 4 }}>
            {loading ? <><span className="spinner" /> Submitting...</> : '🚀 Submit & Earn Tokens!'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--grey)', marginTop: 12 }}>
            🪙 Each submission earns 1–10 tokens • 10 tokens is a rare reward!
          </p>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 16 }}>
          SmartMess · <Link to="/login" style={{ color: 'rgba(255,255,255,0.8)' }}>Sign in</Link> to track your tokens
        </p>
      </div>
    </div>
  )
}
