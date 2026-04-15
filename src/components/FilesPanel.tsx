import { useState, useRef, useCallback, useEffect } from 'react';
import React from 'react';
import ReactDOM from 'react-dom';
import type { NoteFile } from '../types';

interface FilesPanelProps {
  noteId: string;
  files: NoteFile[];
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
  onAddFiles: (noteId: string, files: NoteFile[]) => void;
  onRenameFile: (noteId: string, fileId: string, newName: string) => void;
  onDeleteFile: (noteId: string, fileId: string) => void;
  onClose: () => void;
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string): React.ReactElement {
  if (mimeType.startsWith('image/')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    );
  }
  if (mimeType === 'application/pdf') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="15" y2="17"/>
      </svg>
    );
  }
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
        <line x1="8" y1="9" x2="10" y2="9"/>
      </svg>
    );
  }
  if (mimeType.startsWith('video/')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="15" rx="2"/>
        <polyline points="17 2 12 7 7 2"/>
      </svg>
    );
  }
  if (mimeType.startsWith('audio/')) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

function FilePreviewModal({ file, onClose }: { file: NoteFile; onClose: () => void }) {
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isPdf = file.mimeType === 'application/pdf';
  const isText = file.mimeType.startsWith('text/') || file.mimeType.includes('json');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  const modal = (
    <div className="nb-file-preview-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={`Preview: ${file.name}`}>
      <div className="nb-file-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nb-file-preview-header">
          <span className="nb-file-preview-title">{file.name}</span>
          <div className="nb-file-preview-actions">
            <button className="nb-file-preview-download-btn" onClick={handleDownload} title="Download" aria-label="Download file">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download
            </button>
            <button className="nb-file-preview-close-btn" onClick={onClose} aria-label="Close preview">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="nb-file-preview-body">
          {isImage && <img src={file.dataUrl} alt={file.name} className="nb-file-preview-image" />}
          {isVideo && (
            <video controls className="nb-file-preview-video">
              <source src={file.dataUrl} type={file.mimeType} />
            </video>
          )}
          {isAudio && (
            <audio controls className="nb-file-preview-audio">
              <source src={file.dataUrl} type={file.mimeType} />
            </audio>
          )}
          {isPdf && (
            <iframe src={file.dataUrl} className="nb-file-preview-pdf" title={file.name} />
          )}
          {isText && (
            <pre className="nb-file-preview-text">
              {/* Decode base64 text */}
              {(() => {
                try {
                  const base64 = file.dataUrl.split(',')[1];
                  return base64 ? atob(base64) : file.dataUrl;
                } catch {
                  return file.dataUrl;
                }
              })()}
            </pre>
          )}
          {!isImage && !isVideo && !isAudio && !isPdf && !isText && (
            <div className="nb-file-preview-no-preview">
              <div className="nb-file-preview-no-preview-icon">{getFileIcon(file.mimeType)}</div>
              <p>No preview available for this file type.</p>
              <button className="nb-file-preview-download-btn" onClick={handleDownload}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modal, document.body);
}

interface FileItemProps {
  file: NoteFile;
  noteId: string;
  onRename: (noteId: string, fileId: string, newName: string) => void;
  onDelete: (noteId: string, fileId: string) => void;
}

function FileItem({ file, noteId, onRename, onDelete }: FileItemProps) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(file.name);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isImage = file.mimeType.startsWith('image/');

  const handleRenameStart = () => {
    setRenameValue(file.name);
    setRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 0);
  };

  const handleRenameCommit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== file.name) {
      onRename(noteId, file.id, trimmed);
    }
    setRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameCommit();
    if (e.key === 'Escape') setRenaming(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
      onDelete(noteId, file.id);
    } else {
      setDeleteConfirm(true);
      deleteTimeoutRef.current = setTimeout(() => setDeleteConfirm(false), 3000);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  return (
    <>
      <div
        className="nb-file-item"
        onClick={() => { if (!renaming) setPreviewing(true); }}
        style={{ cursor: renaming ? 'default' : 'pointer' }}
      >
        {isImage && (
          <div className="nb-file-thumb" title="Preview" role="img">
            <img src={file.dataUrl} alt={file.name} className="nb-file-thumb-img" />
          </div>
        )}
        {!isImage && (
          <div className="nb-file-icon-wrap" title="Preview" role="img">
            {getFileIcon(file.mimeType)}
          </div>
        )}
        <div className="nb-file-info">
          {renaming ? (
            <input
              ref={renameInputRef}
              className="nb-file-rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameCommit}
              onKeyDown={handleRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
              aria-label="Rename file"
            />
          ) : (
            <span className="nb-file-name" title={file.name} onDoubleClick={(e) => { e.stopPropagation(); handleRenameStart(); }}>
              {file.name}
            </span>
          )}
          <span className="nb-file-meta">{formatBytes(file.size)}</span>
        </div>
        <div className="nb-file-actions" onClick={(e) => e.stopPropagation()}>
          <button className="nb-file-action-btn" onClick={() => setPreviewing(true)} title="Preview" aria-label="Preview file">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button className="nb-file-action-btn" onClick={handleRenameStart} title="Rename" aria-label="Rename file">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button className="nb-file-action-btn" onClick={handleDownload} title="Download" aria-label="Download file">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button
            className={`nb-file-action-btn nb-file-delete-btn${deleteConfirm ? ' confirming' : ''}`}
            onClick={handleDelete}
            title={deleteConfirm ? 'Confirm delete' : 'Delete file'}
            aria-label={deleteConfirm ? 'Confirm delete' : 'Delete file'}
          >
            {deleteConfirm ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
      {previewing && <FilePreviewModal file={file} onClose={() => setPreviewing(false)} />}
    </>
  );
}

export default function FilesPanel({ noteId, files, width, onResizeStart, onAddFiles, onRenameFile, onDeleteFile, onClose }: FilesPanelProps) {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (arr.length === 0) return;

    const newFiles: NoteFile[] = [];
    let processed = 0;
    setErrorMsg(null);

    arr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newFiles.push({
          id: uid(),
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
          createdAt: Date.now(),
        });
        processed++;
        if (processed === arr.length) {
          try {
            onAddFiles(noteId, newFiles);
          } catch {
            setErrorMsg('Failed to save files - storage may be full.');
          }
        }
      };
      reader.onerror = () => {
        processed++;
        if (processed === arr.length && newFiles.length > 0) {
          try {
            onAddFiles(noteId, newFiles);
          } catch {
            setErrorMsg('Failed to save files - storage may be full.');
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, [noteId, onAddFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const fileItems: File[] = [];
    for (const item of Array.from(items)) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) fileItems.push(file);
      }
    }
    if (fileItems.length > 0) {
      e.preventDefault();
      // Prevent the global paste handler in App.tsx from double-processing
      e.nativeEvent.stopPropagation();
      processFiles(fileItems);
    }
  }, [processFiles]);

  return (
    <div
      className="nb-files-panel"
      style={width ? { width, minWidth: width } : undefined}
      onPaste={handlePaste}
    >
      {onResizeStart && (
        <div
          className="nb-files-resize-handle"
          onMouseDown={onResizeStart}
          aria-hidden="true"
        />
      )}
      <div className="nb-files-panel-header">
        <div className="nb-files-panel-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
          Attachments
          {files.length > 0 && <span className="nb-files-panel-count">{files.length}</span>}
        </div>
        <button className="nb-files-panel-close-btn" onClick={onClose} aria-label="Close files panel">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div
        className={`nb-files-drop-zone${dragOver ? ' drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Drop files here or click to upload"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="nb-files-drop-label">
          {dragOver ? 'Drop to attach' : 'Drop files or click to upload'}
        </span>
        <span className="nb-files-drop-hint">You can also paste files (Ctrl+V)</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="nb-files-input-hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
          aria-label="Upload files"
        />
      </div>

      {errorMsg && (
        <div className="nb-files-error">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {errorMsg}
        </div>
      )}

      <div className="nb-files-list">
        {files.length === 0 ? (
          <div className="nb-files-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.3 }}>
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <p>No attachments yet</p>
          </div>
        ) : (
          files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              noteId={noteId}
              onRename={onRenameFile}
              onDelete={onDeleteFile}
            />
          ))
        )}
      </div>
    </div>
  );
}
