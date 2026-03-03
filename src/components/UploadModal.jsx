/**
 * UploadModal — PDF upload + document management.
 * Uses X-User-ID header (email from localStorage) for backend auth.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import {
  X, Upload, FileText, Trash2, CheckCircle2,
  AlertCircle, Loader2, BookOpen, RefreshCw,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const SUBJECTS = [
  { id: 'SC1007', label: 'SC1007 · C & Data Structures' },
  { id: 'MH1810', label: 'MH1810 · Mathematics 1' },
  { id: 'SC2001', label: 'SC2001 · Algorithms' },
  { id: 'SC2002', label: 'SC2002 · OOP' },
  { id: 'SC2005', label: 'SC2005 · Computer Organisation' },
];

export default function UploadModal({ onClose, subject: initialSubject }) {
  const { getIdToken } = useAuth();

  const [subject, setSubject]     = useState(initialSubject || SUBJECTS[0].id);
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [status, setStatus]       = useState('idle'); // idle | uploading | success | error
  const [errorMsg, setErrorMsg]   = useState('');
  const [result, setResult]       = useState(null);
  const [docs, setDocs]           = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const fileRef = useRef();

  // Load documents for selected subject
  const loadDocs = useCallback(async () => {
    setDocsLoading(true);
    try {
      const uid = await getIdToken();
      const res = await fetch(`${API_BASE}/api/documents?subject=${subject}`, {
        headers: { 'X-User-ID': uid },
      });
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents || []);
      }
    } catch (e) {
      console.error('Failed to load docs:', e);
    } finally {
      setDocsLoading(false);
    }
  }, [subject, getIdToken]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are supported.');
      return;
    }
    setFile(f);
    setErrorMsg('');
    setStatus('idle');
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) { setErrorMsg('Please select a PDF file first.'); return; }
    setStatus('uploading');
    setErrorMsg('');
    setResult(null);
    try {
      const uid = await getIdToken();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', subject);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'X-User-ID': uid },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || `Upload failed (${res.status})`);
        setStatus('error');
        return;
      }
      setResult(data);
      setStatus('success');
      setFile(null);
      loadDocs();
    } catch (e) {
      setErrorMsg(e.message || 'Network error. Is the backend running?');
      setStatus('error');
    }
  };

  const handleDelete = async (doc) => {
    try {
      const uid = await getIdToken();
      await fetch(`${API_BASE}/api/documents/${encodeURIComponent(doc.blob_path)}`, {
        method: 'DELETE',
        headers: { 'X-User-ID': uid },
      });
      loadDocs();
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <Upload size={15} className="text-indigo-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-100">Upload Study Material</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

          {/* Subject selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</label>
            <select
              value={subject}
              onChange={e => { setSubject(e.target.value); setStatus('idle'); setResult(null); }}
              className="bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            >
              {SUBJECTS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all',
              dragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60'
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />
            {file ? (
              <>
                <FileText size={28} className="text-emerald-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                </div>
              </>
            ) : (
              <>
                <Upload size={28} className={dragging ? 'text-indigo-400' : 'text-slate-500'} />
                <div className="text-center">
                  <p className="text-sm text-slate-400">Drop your PDF here or <span className="text-indigo-400">click to browse</span></p>
                  <p className="text-xs text-slate-600 mt-1">Only PDF files · Max 50MB</p>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          {/* Success */}
          {status === 'success' && result && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              <span>
                <strong>{result.filename}</strong> uploaded — {result.pages_processed} page(s), {result.chunks_indexed} chunks indexed into AI search.
              </span>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
              !file || status === 'uploading'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            )}
          >
            {status === 'uploading' ? (
              <><Loader2 size={15} className="animate-spin" /> Uploading & Indexing…</>
            ) : (
              <><Upload size={15} /> Upload PDF</>
            )}
          </button>

          {/* Existing documents */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Your Materials · {subject}
              </span>
              <button
                onClick={loadDocs}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {docsLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : docs.length === 0 ? (
              <div className="flex items-center gap-2 py-4 text-sm text-slate-600">
                <BookOpen size={14} /> No PDFs uploaded yet for {subject}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {docs.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-indigo-400 shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{doc.filename || doc.blob_path?.split('/').pop()}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
