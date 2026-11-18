// src/components/employee/TicketDetailsModal.jsx
// View ticket details, timeline, photos, documents, and reply updates

import React, { useState } from 'react';
import {
  X,
  Users,
  Terminal,
  Laptop,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  FileText,
  File,
  Eye,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TicketDetailsModal({
  isOpen,
  ticket,
  onClose,
  onStatusChange,
  currentUser,
}) {
  const [replyText, setReplyText] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [localActivity, setLocalActivity] = useState(() => ticket?.activity || []);

  if (!isOpen || !ticket) return null;

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newEntry = {
      author: currentUser || 'User',
      date: 'Just now',
      message: replyText.trim(),
    };
    setLocalActivity((prev) => [...prev, newEntry]);
    toast.success('Reply submitted to ticket activity');
    setReplyText('');
  };

  const handleToggleResolved = () => {
    const nextStatus = ticket.status === 'Resolved' ? 'In Progress' : 'Resolved';
    if (onStatusChange) {
      onStatusChange(ticket.id, nextStatus);
    }
    toast.success(`Ticket #${ticket.id} marked as ${nextStatus}`);
  };

  const getDeptBadge = (dept) => {
    if (dept === 'HR') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <Users size={12} /> HR
        </span>
      );
    }
    if (dept === 'DevOps') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Terminal size={12} /> DevOps
        </span>
      );
    }
    if (dept === 'General') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <HelpCircle size={12} /> General Inquiry
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
        <Laptop size={12} /> IT Support
      </span>
    );
  };

  const getPriorityBadge = (p) => {
    if (p === 'Urgent') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Urgent</span>;
    }
    if (p === 'High') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">High</span>;
    }
    if (p === 'Medium') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">Medium</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Low</span>;
  };

  const getStatusBadge = (s) => {
    if (s === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> Resolved
        </span>
      );
    }
    if (s === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} /> In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <AlertTriangle size={12} /> Open
      </span>
    );
  };

  const clientName = ticket.requester || 'User';
  const clientEmail = ticket.email || '';
  const attachmentsList = Array.isArray(ticket.attachments) ? ticket.attachments : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-white/10 text-indigo-300">
              #{ticket.id}
            </span>
            <div className="text-sm font-bold text-white truncate max-w-lg">
              {ticket.subject}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Requester Box (From Profile) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                {clientName.charAt(0)}
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <div>
                  <span className="text-slate-400 font-medium">Client: </span>
                  <span className="font-bold text-slate-900">{clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Email: </span>
                  <span className="font-bold text-indigo-600">{clientEmail}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shrink-0 w-fit">
              From Profile
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</div>
              <div className="mt-1">{getDeptBadge(ticket.department)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
              <div className="mt-1">{getStatusBadge(ticket.status)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</div>
              <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created Date</div>
              <div className="mt-1 text-xs font-semibold text-slate-700">{ticket.date}</div>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
            <div>
              <span className="font-bold text-slate-900">Category: </span>
              {ticket.category}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Request Description</h4>
            <div
              className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>

          {/* Photos and Documents Attachments */}
          {(attachmentsList.length > 0 || ticket.attachment) && (
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Photos &amp; Documents ({attachmentsList.length || 1})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachmentsList.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {file.isImage ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                          <img
                            src={file.dataUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setPreviewMedia(file)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                          {file.name?.endsWith('.pdf') ? (
                            <FileText size={18} />
                          ) : (
                            <File size={18} />
                          )}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-400">{file.size}</p>
                      </div>
                    </div>

                    <a
                      href={file.dataUrl}
                      download={file.name}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Download size={13} /> Download
                    </a>
                  </div>
                ))}

                {/* Legacy single attachment fallback */}
                {ticket.attachment && attachmentsList.length === 0 && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{ticket.attachment}</p>
                        <p className="text-[10px] text-slate-400">Reference document</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity / Discussion History */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-slate-400" />
              Ticket Activity &amp; Updates
            </h4>
            <div className="space-y-3">
              {localActivity.map((act, index) => (
                <div key={index} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{act.author}</span>
                    <span className="text-[10px] text-slate-400">{act.date}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{act.message}</p>
                </div>
              ))}
            </div>

            {/* Quick Reply Form */}
            <form onSubmit={handleAddReply} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add a reply note or question to this ticket..."
                className="flex-1 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Send size={13} /> Reply
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleToggleResolved}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
              ticket.status === 'Resolved'
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 size={14} />
            {ticket.status === 'Resolved' ? 'Reopen Ticket' : 'Mark as Resolved'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold truncate max-w-sm">{previewMedia.name}</span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2 overflow-auto bg-slate-950 flex items-center justify-center">
              <img
                src={previewMedia.dataUrl}
                alt={previewMedia.name}
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
