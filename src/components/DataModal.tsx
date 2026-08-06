import { useRef, useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2, X, Trash2 } from 'lucide-react';
import type { BookmarkNode } from '@/types';
import { parseBookmarksHtml, countTree, serializeBookmarksHtml } from '@/utils/bookmarkParser';

interface DataModalProps {
  open: boolean;
  onClose: () => void;
  tree: BookmarkNode[];
  onImport: (nodes: BookmarkNode[], mode: 'replace' | 'merge') => void;
  onClearAll: () => void;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'error'; msg: string }
  | { kind: 'success'; msg: string }
  | { kind: 'preview'; nodes: BookmarkNode[]; bookmarks: number; folders: number; raw: string };

export default function DataModal({ open, onClose, tree, onImport, onClearAll }: DataModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStatus({ kind: 'idle' });
    setConfirmClear(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      try {
        const nodes = parseBookmarksHtml(text);
        if (nodes.length === 0) {
          setStatus({ kind: 'error', msg: '未在文件中找到任何书签，请确认导出的是浏览器书签 HTML 文件。' });
          return;
        }
        const { bookmarks, folders } = countTree(nodes);
        setStatus({ kind: 'preview', nodes, bookmarks, folders, raw: text });
      } catch {
        setStatus({ kind: 'error', msg: '解析文件失败，请确认文件格式正确。' });
      }
    };
    reader.onerror = () => setStatus({ kind: 'error', msg: '读取文件失败，请重试。' });
    reader.readAsText(file);
  };

  const handleExport = () => {
    const html = serializeBookmarksHtml(tree);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ kind: 'success', msg: '书签已导出为 HTML 文件，可直接导入浏览器。' });
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(tree, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `markhub_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ kind: 'success', msg: '数据已导出为 JSON 备份文件。' });
  };

  const confirmImport = () => {
    if (status.kind !== 'preview') return;
    onImport(status.nodes, importMode);
    setStatus({ kind: 'success', msg: `已成功导入 ${status.bookmarks} 个书签。` });
  };

  const doClearAll = () => {
    onClearAll();
    setConfirmClear(false);
    setStatus({ kind: 'success', msg: '已清空所有书签数据。' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      <div className="relative w-full max-w-lg animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-700/70">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
            <FileText size={18} className="text-brand-500" />
            数据导入 / 导出
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-500/10 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 scrollbar-thin">
          {/* Import section */}
          <section className="mb-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Upload size={15} className="text-brand-500" />
              导入书签
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              从浏览器导出的书签 HTML 文件导入。导出方法：Chrome / Edge 打开
              <span className="font-mono text-slate-500 dark:text-slate-400"> chrome://bookmarks </span>
              → 整理 → 导出书签。
            </p>

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-600 dark:bg-slate-900/40 dark:hover:border-brand-500 dark:hover:bg-brand-500/5"
            >
              <Upload size={26} className="mb-2 text-slate-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">点击选择或拖入文件</p>
              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">支持浏览器书签 HTML 格式</p>
              <input
                ref={fileRef}
                type="file"
                accept=".html,.htm,text/html"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>

            {/* Import mode */}
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="text-slate-400 dark:text-slate-500">导入方式：</span>
              <label className="flex cursor-pointer items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-brand-500"
                />
                替换现有
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-brand-500"
                />
                追加合并
              </label>
            </div>
          </section>

          {/* Export section */}
          <section className="mb-6">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Download size={15} className="text-brand-500" />
              导出数据
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-slate-400 dark:text-slate-500">
              将当前书签导出，可用于浏览器导入或作为备份。
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                <FileText size={14} />
                导出为书签 HTML
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-brand-300"
              >
                <Download size={14} />
                导出为 JSON 备份
              </button>
            </div>
          </section>

          {/* Danger zone */}
          <section className="mb-2">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
              <Trash2 size={15} />
              危险操作
            </h3>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30"
              >
                清空所有书签
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/50 p-2.5 dark:border-rose-900/50 dark:bg-rose-900/20">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span className="text-xs text-rose-600 dark:text-rose-400">确认清空全部书签？此操作不可撤销。</span>
                <button
                  onClick={doClearAll}
                  className="ml-auto rounded-md bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                >
                  确认清空
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-300"
                >
                  取消
                </button>
              </div>
            )}
          </section>

          {/* Status messages */}
          {status.kind === 'error' && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{status.msg}</span>
            </div>
          )}
          {status.kind === 'success' && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
              <span>{status.msg}</span>
            </div>
          )}
          {status.kind === 'preview' && (
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-800/50 dark:bg-brand-900/20">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-500" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  已解析 <span className="font-semibold text-brand-600 dark:text-brand-300">{status.bookmarks}</span> 个书签、
                  <span className="font-semibold text-brand-600 dark:text-brand-300">{status.folders}</span> 个文件夹。
                </div>
              </div>
              <button
                onClick={confirmImport}
                className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition-colors hover:bg-brand-600"
              >
                确认导入（{importMode === 'replace' ? '替换现有数据' : '追加到现有数据'}）
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
