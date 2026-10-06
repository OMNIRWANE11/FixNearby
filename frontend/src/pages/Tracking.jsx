import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import TrackingPanel from '../components/TrackingPanel';
import Modal from '../components/Modal';
import RatingStars from '../components/RatingStars';
import Loader from '../components/Loader';
import { useSocket } from '../hooks/useSocket';
import { useToast } from '../components/Toast';
import api from '../services/api';

export function Tracking() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [techPosition, setTechPosition] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  
  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Initial Fetch of Request & Tracking Data
  useEffect(() => {
    async function fetchTracking() {
      try {
        const res = await api.tracking.getTracking(requestId);
        if (res.success && res.data) {
          setTrackingData(res.data);
          if (res.data.technician) {
            setTechPosition({
              latitude: res.data.technician.currentLatitude,
              longitude: res.data.technician.currentLongitude,
              name: res.data.technician.name,
              trade: res.data.technician.trade,
            });
          }
          if (res.data.routeCoordinates) {
            setRouteCoords(res.data.routeCoordinates);
          }
        }
      } catch (err) {
        showToast('Unable to load live tracking details for this request.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchTracking();
  }, [requestId]);

  // Real-time Socket.IO Listeners
  useSocket(requestId, {
    onLocationUpdate: (payload) => {
      setTechPosition({
        latitude: payload.latitude,
        longitude: payload.longitude,
        name: trackingData?.technician?.name || 'Technician',
        trade: trackingData?.technician?.trade || 'On the way',
      });
      setTrackingData((prev) =>
        prev
          ? {
              ...prev,
              distanceRemainingKm: payload.distanceRemainingKm,
              etaMinutes: payload.etaMinutes,
            }
          : prev
      );
    },
    onStatusChange: (statusPayload) => {
      setTrackingData((prev) =>
        prev
          ? {
              ...prev,
              status: statusPayload.status,
            }
          : prev
      );
      if (statusPayload.status === 'ARRIVED') {
        showToast('🚨 Technician has arrived at your location!', 'success');
      } else if (statusPayload.status === 'COMPLETED') {
        showToast('Job marked as completed. Please submit your review.', 'info');
        setShowReviewModal(true);
      }
    },
    onEtaUpdate: (etaPayload) => {
      setTrackingData((prev) =>
        prev
          ? {
              ...prev,
              distanceRemainingKm: etaPayload.distanceRemainingKm,
              etaMinutes: etaPayload.etaMinutes,
            }
          : prev
      );
    },
  });

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this emergency request?')) return;
    try {
      await api.requests.updateStatus(requestId, {
        status: 'CANCELLED',
        cancellationReason: 'Cancelled by customer',
      });
      showToast('Emergency request cancelled.', 'info');
      navigate('/');
    } catch (err) {
      showToast('Failed to cancel request.', 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.requests.review(requestId, {
        rating: ratingVal,
        comment: reviewComment.trim(),
      });
      showToast('Thank you! Your verified review has been published.', 'success');
      setShowReviewModal(false);
      navigate('/requests');
    } catch (err) {
      showToast(err.error?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loader label="Establishing live GPS telemetry and OSRM route..." />;
  }

  if (!trackingData) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Emergency Request Not Found</h2>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="tracking-page-layout">
      {/* 1. Full Screen Interactive Map */}
      <div className="tracking-map-wrapper">
        <MapView
          userLocation={trackingData.customerLocation}
          technicianLocation={techPosition}
          routeCoordinates={routeCoords}
          height="100%"
        />
      </div>

      {/* 2. Side HUD Tracking Panel */}
      <TrackingPanel
        trackingData={trackingData}
        onCancelRequest={handleCancelRequest}
        onCompleteReview={() => setShowReviewModal(true)}
      />

      {/* 3. Review & Rating Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Rate Emergency Service"
      >
        <form onSubmit={handleSubmitReview}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Your feedback protects the FixNearby community and helps maintain 4-point verification quality standards.
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Trust Rating (1 to 5 Stars):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '1.8rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRatingVal(star)}
                  style={{ color: star <= ratingVal ? '#FFB020' : 'var(--border)' }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
              Feedback Comments:
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="e.g. Prompt arrival, showed badge at the door, quick resolution..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowReviewModal(false)}
            >
              Skip For Now
            </button>
            <button type="submit" className="btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review ✓'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Tracking;

