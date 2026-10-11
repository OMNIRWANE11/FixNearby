import React, { useState, useEffect } from 'react';
import { formatDateTime, formatDistance } from '../utils/formatters';
import { getTelLink, getWhatsAppLink } from '../utils/contactLinks';
import RatingStars from './RatingStars';
import { useToast } from './Toast';
import api from '../services/api';

export function RequestHistoryModal({ request, onClose, onReviewSubmitted }) {
  const { showToast } = useToast();
  if (!request) return null;

  const [activeReview, setActiveReview] = useState(request.review || null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveReview(request.review || null);
  }, [request]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) {
      showToast('Please select a star rating.', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.requests.review(request.id, {
        rating: Number(rating),
        comment: comment.trim() || undefined,
      });
      if (res.success && res.data) {
        setActiveReview(res.data);
        showToast('Thank you! Your review has been submitted successfully.', 'success');
        if (onReviewSubmitted) {
          onReviewSubmitted(request.id, res.data);
        }
      }
    } catch (err) {
      showToast(err.error?.message || err.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted = request.status === 'COMPLETED';
  const isCancelled = request.status === 'CANCELLED';

  const whatsappUrl = request.technician
    ? getWhatsAppLink(request.technician.whatsappNumber || request.technician.phone, {
        category: request.categoryName || 'Emergency',
        problem: request.problemName || 'Emergency service',
        requestId: request.id?.slice(0, 8),
      })
    : null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '1.75rem' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          ✕
        </button>

        {/* Modal Top Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className={`badge-tag ${
                isCompleted ? 'badge-verified' : isCancelled ? 'badge-unverified' : 'badge-warning'
              }`}
              style={{ fontSize: '0.85rem', fontWeight: 700 }}
            >
              {isCompleted ? '✅ Service Completed' : isCancelled ? '❌ Request Cancelled' : request.status}
            </span>
            <span
              className="badge-tag"
              style={{
                background:
                  request.severity === 'CRITICAL' ? 'var(--alert-red-dim)' : 'var(--warning-dim)',
                color: request.severity === 'CRITICAL' ? 'var(--alert-red)' : 'var(--warning)',
              }}
            >
              {request.severity} PRIORITY
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ref: {request.id?.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', margin: '0.25rem 0' }}>
            {request.problemName || request.categoryName || 'Emergency Service Call'}
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Requested on {formatDateTime(request.createdAt)}
            {request.updatedAt && isCompleted && ` • Completed on ${formatDateTime(request.updatedAt)}`}
          </div>
        </div>

        {/* Service Details & What Was Done */}
        <div
          style={{
            background: 'var(--surface-2)',
            padding: '1.1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            border: '1px solid var(--border)',
          }}
        >
          <h4
            style={{
              fontSize: '0.95rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-primary)',
            }}
          >
            📋 Service & Breakdown Summary
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>
                Service Category & Issue:
              </span>
              <strong>{request.categoryName || 'General Emergency'}</strong> —{' '}
              <span>{request.problemDescription || request.problemName || 'Emergency assistance requested'}</span>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>
                Service Location:
              </span>
              <span>📍 {request.customerAddress || 'Kolhapur GPS area'}</span>
            </div>

            {request.distanceKm && (
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>
                    Response Distance:
                  </span>
                  <strong style={{ color: 'var(--accent-aqua)' }}>{formatDistance(request.distanceKm)}</strong>
                </div>
                {request.estimatedEtaMinutes && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>
                      Arrival Time:
                    </span>
                    <strong>{request.estimatedEtaMinutes} min dispatch</strong>
                  </div>
                )}
              </div>
            )}

            {isCancelled && request.cancellationReason && (
              <div style={{ background: 'var(--alert-red-dim)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--alert-red)', fontSize: '0.85rem' }}>
                  Reason for cancellation: {request.cancellationReason}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Technician Details */}
        {request.technician ? (
          <div
            style={{
              background: 'var(--surface-2)',
              padding: '1.1rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              border: '1px solid var(--border)',
            }}
          >
            <h4
              style={{
                fontSize: '0.95rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-primary)',
              }}
            >
              🛠️ Serviced By Technician
            </h4>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img
                src={request.technician.profileImageUrl || '/images/technicians/tech-default.svg'}
                alt={request.technician.name}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-aqua)',
                }}
              />
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{request.technician.name}</h3>
                  <span className="badge-tag badge-verified" style={{ fontSize: '0.75rem' }}>
                    🛡️ Verified
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-aqua)', fontWeight: 600 }}>
                  {request.technician.trade}
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.2rem', fontSize: '0.8rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                    Badge: {request.technician.badgeCode}
                  </span>
                  {request.technician.shopName && (
                    <span style={{ color: 'var(--text-muted)' }}>• {request.technician.shopName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem' }}>
              <a
                href={getTelLink(request.technician.phone)}
                className="btn-primary"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.8rem',
                  textDecoration: 'none',
                  minHeight: 'auto',
                }}
              >
                📞 Call {request.technician.name.split(' ')[0]}
              </a>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    textDecoration: 'none',
                    minHeight: 'auto',
                  }}
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--surface-2)',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
            }}
          >
            ℹ️ No technician assigned for this record.
          </div>
        )}

        {/* Review & Rating Section */}
        {isCompleted && request.technician && (
          <div
            style={{
              background: 'var(--surface-2)',
              padding: '1.1rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              border: '1px solid var(--border)',
            }}
          >
            <h4
              style={{
                fontSize: '0.95rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--text-primary)',
              }}
            >
              ⭐ Customer Review & Rating
            </h4>

            {activeReview ? (
              <div
                style={{
                  background: 'var(--surface-1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Your Rating:</span>
                    <RatingStars rating={activeReview.rating} />
                  </div>
                  <span className="badge-tag badge-verified" style={{ fontSize: '0.75rem' }}>
                    ✓ Review Published
                  </span>
                </div>
                {activeReview.comment ? (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{activeReview.comment}"
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    (No written feedback provided)
                  </p>
                )}
                {activeReview.createdAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Reviewed on {formatDateTime(activeReview.createdAt)}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem 0' }}>
                  Share your experience with {request.technician.name} so others in Kolhapur can choose with confidence.
                </p>

                {/* Star rating selector */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Select Rating *
                  </label>
                  <div style={{ display: 'flex', gap: '0.35rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '0 0.15rem',
                          fontSize: '1.8rem',
                          color: (hoverRating || rating) >= star ? '#FFB020' : 'var(--text-muted)',
                          cursor: 'pointer',
                          minHeight: 'auto',
                          lineHeight: 1,
                        }}
                        aria-label={`${star} star`}
                      >
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, alignSelf: 'center', marginLeft: '0.5rem', color: '#FFB020' }}>
                      {hoverRating || rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment textarea */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    Your Feedback / Comment (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g., Quick arrival within 15 mins, polite behavior, and fixed the circuit breaker problem cleanly!"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--surface-1)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ width: '100%', minHeight: '44px', fontSize: '0.95rem' }}
                >
                  {isSubmitting ? 'Submitting Review...' : '⭐ Submit Technician Review'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Modal Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{ minHeight: '40px', padding: '0 1.25rem' }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestHistoryModal;

