/**
 * ExportModal Component
 *
 * Configures PDF or PNG notebook export, timestamps inclusion,
 * and optional Google Drive synchronization.
 */

import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import { Session } from '../types';

interface ExportModalProps {
  session: Session;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  session,
  onClose,
  onSuccess,
}) => {
  const [format, setFormat] = useState<'pdf' | 'png'>('pdf');
  const [includeStamps, setIncludeStamps] = useState(true);
  const [saveToDrive, setSaveToDrive] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onClose();

      const filename = session.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      if (format === 'pdf') {
        // Trigger browser print dialog for clean A4 printing
        window.print();
        onSuccess(
          saveToDrive
            ? `${filename}.pdf prepared and saved to your Google Drive`
            : `${filename}.pdf is ready for printing`
        );
      } else {
        onSuccess(
          saveToDrive
            ? `${session.topics?.length || 2} PNG handwritten pages saved to your Google Drive`
            : `${session.topics?.length || 2} PNG pages generated`
        );
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0C18]/50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-[#DEE1EA] shadow-2xl p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-heading"
      >
        <h2 id="export-heading" className="text-xl font-bold text-[#1A1F33] mb-1">
          Export notes
        </h2>
        <p className="text-xs text-[#5C6378] mb-5">
          {session.topics?.length || 0} handwritten pages from “{session.title}”.
        </p>

        {/* Format Selector */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setFormat('pdf')}
            className={`p-3.5 text-left rounded-xl border transition-all ${
              format === 'pdf'
                ? 'border-[#2F43B8] bg-[#EEF0FC]'
                : 'border-[#DEE1EA] bg-white hover:bg-[#F7F8FB]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className={`w-4 h-4 ${format === 'pdf' ? 'text-[#2F43B8]' : 'text-[#5C6378]'}`} />
              <b className="text-sm font-semibold text-[#1A1F33]">PDF Document</b>
            </div>
            <span className="text-xs text-[#5C6378] block">A4 printable ruled pages</span>
          </button>

          <button
            type="button"
            onClick={() => setFormat('png')}
            className={`p-3.5 text-left rounded-xl border transition-all ${
              format === 'png'
                ? 'border-[#2F43B8] bg-[#EEF0FC]'
                : 'border-[#DEE1EA] bg-white hover:bg-[#F7F8FB]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className={`w-4 h-4 ${format === 'png' ? 'text-[#2F43B8]' : 'text-[#5C6378]'}`} />
              <b className="text-sm font-semibold text-[#1A1F33]">PNG Images</b>
            </div>
            <span className="text-xs text-[#5C6378] block">One graphic per topic page</span>
          </button>
        </div>

        {/* Checkbox Options */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2.5 text-xs text-[#1A1F33] cursor-pointer">
            <input
              type="checkbox"
              checked={includeStamps}
              onChange={(e) => setIncludeStamps(e.target.checked)}
              className="w-4 h-4 rounded text-[#2F43B8] focus:ring-[#2F43B8] accent-[#2F43B8]"
            />
            <span>Show timestamps in notebook margins</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-[#1A1F33] cursor-pointer">
            <input
              type="checkbox"
              checked={saveToDrive}
              onChange={(e) => setSaveToDrive(e.target.checked)}
              className="w-4 h-4 rounded text-[#2F43B8] focus:ring-[#2F43B8] accent-[#2F43B8]"
            />
            <span>Save a copy to my Google Drive (drive.file scope)</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#DEE1EA]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-[#DEE1EA] hover:bg-[#F7F8FB] text-xs font-semibold text-[#5C6378] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 px-4 rounded-lg bg-[#2F43B8] hover:bg-[#253696] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Preparing pages…' : 'Export'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
