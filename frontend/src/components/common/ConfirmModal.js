import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * ConfirmModal
 *
 * Props:
 *   isOpen      {boolean}   — controls visibility
 *   onClose     {function}  — called when user dismisses without confirming
 *   onConfirm   {function}  — called when user clicks the confirm button
 *   title       {string}    — modal heading
 *   message     {string}    — body text
 *   confirmText {string}    — label for the confirm button  (default "Confirm")
 *   cancelText  {string}    — label for the cancel button   (default "Cancel")
 *   danger      {boolean}   — makes the confirm button red  (default true)
 *   loading     {boolean}   — shows spinner on confirm button while async op runs
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-500/15' : 'bg-primary/15'}`}>
                    <FiAlertTriangle className={`w-5 h-5 ${danger ? 'text-red-400' : 'text-primary'}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pb-6">
                <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-dark-border text-gray-300 hover:text-white hover:border-gray-500 font-semibold text-sm transition-all disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg ${
                    danger
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                      : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                  }`}
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? 'Processing…' : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
