import React from 'react';
import Modal from './Modal';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Emergency Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        {message}
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          className={isDestructive ? 'btn-sos' : 'btn-primary'}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

