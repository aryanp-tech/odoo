// src/components/employee/RichTextEditorWithDropzone.jsx
// Rich text editor toolbar matching the Odoo reference screenshot with drag-and-drop photo & document attachments

import React, { useRef, useState, useEffect } from 'react';
import {
  Code,
  Pilcrow,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Link2,
  Minus,
  UploadCloud,
  FileText,
  File,
  X,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RichTextEditorWithDropzone({
  value = '',
  onChange,
  attachments = [],
  onAttachmentsChange,
  placeholder = 'Details on the reason(s) for opening the ticket.',
}) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);

  // Sync initial content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!value) {
        editorRef.current.innerHTML = '';
      } else if (editorRef.current.innerHTML === '') {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, val);
    handleInput();
  };

  // Insert Table (2x2 default)
  const handleInsertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 8px 0; border: 1px solid #cbd5e1;">
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; background-color: #f8fafc; font-weight: bold;">Header 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; background-color: #f8fafc; font-weight: bold;">Header 2</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Item 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Item 2</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `;
    executeCommand('insertHTML', tableHtml);
  };

  // Insert Link
  const handleInsertLink = () => {
    const url = window.prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  // Insert Video Embed
  const handleInsertVideo = () => {
    const url = window.prompt('Enter video URL (YouTube, Vimeo, or MP4 link):');
    if (url) {
      const videoHtml = `<p><a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">🎥 Video Link: ${url}</a></p><p><br></p>`;
      executeCommand('insertHTML', videoHtml);
    }
  };

  // Format Heading / Paragraph
  const handleFormatBlock = () => {
    const tag = window.prompt('Choose formatting: enter "h2" for Heading, "p" for Paragraph, or "blockquote":', 'h2');
    if (tag) {
      executeCommand('formatBlock', tag.toLowerCase());
    }
  };

  // File Upload Processing (Drag & Drop or File Picker)
  const processFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file) => {
      // Check file size (limit 15MB)
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 15MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileObj = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: (file.size / 1024).toFixed(1) > 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(0)} KB`,
          type: file.type,
          isImage: file.type.startsWith('image/'),
          dataUrl: e.target?.result,
        };

        if (onAttachmentsChange) {
          onAttachmentsChange((prev) => [...prev, fileObj]);
        }
        toast.success(`Attached: ${file.name}`);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  // Direct image toolbar insertion
  const handleImageToolbarInsert = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imgHtml = `<p><img src="${ev.target?.result}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 8px 0; border: 1px solid #e2e8f0;" /></p><p><br></p>`;
        executeCommand('insertHTML', imgHtml);
        // Also register in attachments
        processFiles([file]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    if (onAttachmentsChange) {
      onAttachmentsChange((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* 1. Odoo-Style Rich Text Editor Toolbar */}
      <div className="bg-[#fcfdfd] border-b border-slate-200 px-2 py-1.5 flex flex-wrap items-center gap-0.5 select-none text-slate-700">
        {/* Source Code */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', 'pre')}
          title="Source Code / Monospace"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Code size={15} />
        </button>

        {/* Paragraph / Headings */}
        <button
          type="button"
          onClick={handleFormatBlock}
          title="Paragraph / Heading"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Pilcrow size={15} />
        </button>

        {/* Text Color */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
            className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center"
          >
            <span className="font-serif font-black text-xs border-b-2 border-indigo-600 px-0.5 leading-none">
              A
            </span>
          </button>
          {showColorPicker && (
            <div className="absolute top-8 left-0 z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1.5">
              {['#0f172a', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#475569'].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => {
                    executeCommand('foreColor', col);
                    setShowColorPicker(false);
                  }}
                  style={{ backgroundColor: col }}
                  className="w-5 h-5 rounded-full border border-black/10 hover:scale-110 transition-transform cursor-pointer"
                />
              ))}
            </div>
          )}
        </div>

        {/* Font Size */}
        <button
          type="button"
          onClick={() => {
            const size = window.prompt('Enter font size (1 to 7):', '4');
            if (size) executeCommand('fontSize', size);
          }}
          title="Font Size"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer flex items-center font-bold text-xs"
        >
          <Type size={15} />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Bold */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          title="Bold (Ctrl+B)"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer font-bold"
        >
          <Bold size={15} strokeWidth={2.5} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          title="Italic (Ctrl+I)"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer italic"
        >
          <Italic size={15} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          title="Underline (Ctrl+U)"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer underline"
        >
          <Underline size={15} />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          title="Strikethrough"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer line-through"
        >
          <Strikethrough size={15} />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bulleted List"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <List size={15} />
        </button>

        {/* Image Insert */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          title="Insert Photo / Image"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ImageIcon size={15} />
        </button>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageToolbarInsert}
          accept="image/*"
          className="hidden"
        />

        {/* Video Insert */}
        <button
          type="button"
          onClick={handleInsertVideo}
          title="Insert Video Link"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Video size={15} />
        </button>

        {/* Table Insert */}
        <button
          type="button"
          onClick={handleInsertTable}
          title="Insert Table"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <TableIcon size={15} />
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={handleInsertLink}
          title="Insert Link"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Link2 size={15} />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => executeCommand('insertHorizontalRule')}
          title="Horizontal Line"
          className="p-1.5 hover:bg-slate-200/70 rounded text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Minus size={15} />
        </button>
      </div>

      {/* 2. Content Editable Description Area */}
      <div className="relative min-h-[140px] p-4 text-xs font-normal text-slate-900 focus:outline-hidden leading-relaxed">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="min-h-[120px] focus:outline-hidden whitespace-pre-wrap"
          data-placeholder={placeholder}
          style={{
            minHeight: '120px',
          }}
        />
        {!value && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute top-4 left-4 text-slate-400 pointer-events-none select-none text-xs"
          >
            {placeholder}
          </div>
        )}
      </div>

      {/* 3. Dropzone for Photos & Documents */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        className={`border-t border-dashed transition-all p-3.5 flex flex-col items-center justify-center text-center select-none ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/70'
            : 'border-slate-300 bg-[#f8fafc] hover:bg-slate-100/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
        />

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <UploadCloud size={17} className="text-slate-400" />
          <span>
            Drop files here or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 cursor-pointer"
            >
              choose them
            </button>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 mt-0.5">
          Attach screenshots, photos, error logs, or PDF/Word documents (up to 15MB each)
        </span>
      </div>

      {/* 4. Attached Files / Photos Preview Tray */}
      {attachments.length > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/70 p-3 space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Attached Reference Files ({attachments.length})</span>
            <span className="text-[10px] font-normal text-slate-400">Ready to submit with ticket</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {file.isImage ? (
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img
                        src={file.dataUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewMedia(file)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                        title="View photo"
                      >
                        <Eye size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                      {file.name.endsWith('.pdf') ? (
                        <FileText size={17} />
                      ) : (
                        <File size={17} />
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

                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="w-6 h-6 rounded-md hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
                  title="Remove attachment"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Image Lightbox Modal */}
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
