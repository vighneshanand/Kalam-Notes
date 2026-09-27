/**
 * HandwrittenNotesTab Component
 *
 * Renders notes on ruled notebook paper with rough.js diagrams,
 * yellow sticky notes, handwriting fonts, and inline editing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Download, Check, Play, Edit3 } from 'lucide-react';
import rough from 'roughjs';
import { Session, Topic, Note, BUCKET_DEFINITIONS } from '../types';

interface HandwrittenNotesTabProps {
  session: Session;
  onSeek: (seconds: number) => void;
  onOpenExport: () => void;
  onSaveEdits: (
    noteEdits: Array<{ id: string; text: string }>,
    topicEdits: Array<{ id: string; title: string }>
  ) => Promise<void>;
}

export const HandwrittenNotesTab: React.FC<HandwrittenNotesTabProps> = ({
  session,
  onSeek,
  onOpenExport,
  onSaveEdits,
}) => {
  const [inkColor, setInkColor] = useState<'blue' | 'black'>('blue');
  const [fontFamily, setFontFamily] = useState<'caveat' | 'kalam'>('caveat');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // References to editable elements
  const containerRef = useRef<HTMLDivElement>(null);

  const penHex = inkColor === 'blue' ? '#1E2F8C' : '#26262B';
  const fontCss =
    fontFamily === 'caveat'
      ? "'Caveat', 'Segoe Print', cursive"
      : "'Kalam', 'Segoe Print', cursive";
  const fontSizeCss = fontFamily === 'caveat' ? '25px' : '20px';

  const topics = session.topics || [];

  // Render Rough.js diagrams on canvas/svg elements
  useEffect(() => {
    if (!containerRef.current) return;
    const svgs = containerRef.current.querySelectorAll<SVGSVGElement>('svg[data-diagram]');

    svgs.forEach((svg) => {
      svg.innerHTML = '';
      const type = svg.getAttribute('data-diagram');
      const rc = rough.svg(svg);
      const stroke = penHex;
      const red = '#B8322A';
      const hi = '#E0A800';

      const opt = { stroke, strokeWidth: 1.6, roughness: 1.3, bowing: 1.4 };

      const createText = (
        x: number,
        y: number,
        text: string,
        fontSize = 20,
        color = stroke,
        weight = 'normal'
      ) => {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', String(x));
        t.setAttribute('y', String(y));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('font-size', String(fontSize));
        t.setAttribute('fill', color);
        t.setAttribute('font-weight', weight);
        t.setAttribute('font-family', fontCss);
        t.textContent = text;
        svg.appendChild(t);
      };

      const drawArrow = (x1: number, y1: number, x2: number, y2: number, c = stroke) => {
        svg.appendChild(rc.line(x1, y1, x2, y2, { ...opt, stroke: c }));
        const angle = Math.atan2(y2 - y1, x2 - x1);
        [0.45, -0.45].forEach((d) => {
          svg.appendChild(
            rc.line(
              x2,
              y2,
              x2 - 12 * Math.cos(angle + d),
              y2 - 12 * Math.sin(angle + d),
              { ...opt, stroke: c }
            )
          );
        });
      };

      if (type === 'wacc') {
        svg.appendChild(rc.rectangle(10, 20, 180, 65, opt));
        createText(100, 48, 'Equity', 22, stroke, 'bold');
        createText(100, 72, 'E/V × Re', 18);

        svg.appendChild(rc.rectangle(10, 130, 180, 65, opt));
        createText(100, 158, 'Debt', 22, stroke, 'bold');
        createText(100, 182, 'D/V × Rd × (1 − T)', 18);

        svg.appendChild(
          rc.ellipse(280, 110, 120, 70, {
            ...opt,
            fill: hi,
            fillStyle: 'hachure',
            hachureGap: 7,
          })
        );
        createText(280, 118, 'WACC', 26, red, 'bold');

        svg.appendChild(rc.rectangle(370, 75, 170, 70, opt));
        createText(455, 105, 'discount the', 18);
        createText(455, 130, 'future cash flows', 18);

        drawArrow(190, 52, 230, 85);
        drawArrow(190, 160, 230, 135);
        drawArrow(340, 110, 370, 110);
        createText(205, 65, '+', 24, red, 'bold');
      } else if (type === 'range') {
        createText(280, 30, 'run the model at all three corridors', 20, red);
        svg.appendChild(rc.line(30, 80, 530, 80, opt));

        [
          [120, 'Baseline − 1%'],
          [280, 'Baseline'],
          [440, 'Baseline + 1%'],
        ].forEach(([x, label], k) => {
          svg.appendChild(rc.line(Number(x), 65, Number(x), 95, { ...opt, strokeWidth: 2 }));
          createText(Number(x), 125, String(label), 19, stroke, k === 1 ? 'bold' : 'normal');
        });

        svg.appendChild(rc.circle(280, 80, 18, { ...opt, fill: hi, fillStyle: 'solid' }));
        drawArrow(230, 40, 140, 65, red);
        drawArrow(330, 40, 420, 65, red);
      } else if (type === 'scale') {
        svg.appendChild(rc.line(280, 50, 280, 160, { ...opt, strokeWidth: 2 }));
        svg.appendChild(rc.line(220, 165, 340, 165, { ...opt, strokeWidth: 2 }));
        svg.appendChild(rc.line(110, 50, 450, 50, { ...opt, strokeWidth: 2 }));
        svg.appendChild(rc.circle(280, 50, 10, { ...opt, fill: stroke, fillStyle: 'solid' }));

        [
          [140, 'Assets'],
          [420, 'Liabilities + Equity'],
        ].forEach(([x, label]) => {
          svg.appendChild(rc.line(Number(x), 50, Number(x) - 40, 105, opt));
          svg.appendChild(rc.line(Number(x), 50, Number(x) + 40, 105, opt));
          svg.appendChild(
            rc.ellipse(Number(x), 108, 100, 18, {
              ...opt,
              fill: hi,
              fillStyle: 'hachure',
              hachureGap: 6,
            })
          );
          createText(Number(x), 145, String(label), 20, stroke, 'bold');
        });

        createText(280, 32, '=', 28, red, 'bold');
      } else {
        // Generic flowchart diagram
        svg.appendChild(rc.rectangle(20, 40, 150, 60, opt));
        createText(95, 75, 'Input Signals', 18);
        drawArrow(170, 70, 230, 70);

        svg.appendChild(
          rc.ellipse(310, 70, 140, 65, {
            ...opt,
            fill: hi,
            fillStyle: 'hachure',
          })
        );
        createText(310, 77, 'Core Model', 20, red, 'bold');
        drawArrow(380, 70, 430, 70);

        svg.appendChild(rc.rectangle(430, 40, 140, 60, opt));
        createText(500, 75, 'Output Decision', 18);
      }
    });
  }, [topics, penHex, fontCss]);

  const handleToggleEdit = async () => {
    if (isEditing) {
      // Gather all edits from DOM
      if (!containerRef.current) {
        setIsEditing(false);
        return;
      }

      setIsSaving(true);
      const noteEdits: Array<{ id: string; text: string }> = [];
      const topicEdits: Array<{ id: string; title: string }> = [];

      containerRef.current.querySelectorAll<HTMLElement>('[data-note-id]').forEach((el) => {
        const id = el.getAttribute('data-note-id');
        const text = el.innerText.trim();
        if (id && text) noteEdits.push({ id, text });
      });

      containerRef.current.querySelectorAll<HTMLElement>('[data-topic-id]').forEach((el) => {
        const id = el.getAttribute('data-topic-id');
        const title = el.innerText.trim();
        if (id && title) topicEdits.push({ id, title });
      });

      try {
        await onSaveEdits(noteEdits, topicEdits);
      } catch (err) {
        console.error('Failed to save edits:', err);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-5 text-xs text-[#5C6378]">
          {/* Ink color */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1A1F33]">Ink</span>
            <button
              onClick={() => setInkColor('blue')}
              className={`w-5 h-5 rounded-full border-2 border-white transition-all ${
                inkColor === 'blue'
                  ? 'ring-2 ring-[#2F43B8] scale-110'
                  : 'ring-1 ring-[#DEE1EA]'
              }`}
              style={{ backgroundColor: '#1E2F8C' }}
              aria-label="Blue ink"
            />
            <button
              onClick={() => setInkColor('black')}
              className={`w-5 h-5 rounded-full border-2 border-white transition-all ${
                inkColor === 'black'
                  ? 'ring-2 ring-[#1A1F33] scale-110'
                  : 'ring-1 ring-[#DEE1EA]'
              }`}
              style={{ backgroundColor: '#26262B' }}
              aria-label="Black ink"
            />
          </div>

          {/* Handwriting Font */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1A1F33]">Handwriting</span>
            <div className="inline-flex border border-[#DEE1EA] rounded-lg p-0.5 bg-white">
              <button
                onClick={() => setFontFamily('caveat')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  fontFamily === 'caveat'
                    ? 'bg-[#EEF0FC] text-[#2F43B8] font-bold'
                    : 'text-[#5C6378] hover:text-[#1A1F33]'
                }`}
              >
                Caveat
              </button>
              <button
                onClick={() => setFontFamily('kalam')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  fontFamily === 'kalam'
                    ? 'bg-[#EEF0FC] text-[#2F43B8] font-bold'
                    : 'text-[#5C6378] hover:text-[#1A1F33]'
                }`}
              >
                Kalam
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleEdit}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border text-xs font-semibold transition-all shadow-xs ${
              isEditing
                ? 'bg-[#2F43B8] border-[#2F43B8] text-white hover:bg-[#253696]'
                : 'bg-white border-[#DEE1EA] text-[#1A1F33] hover:bg-[#F7F8FB]'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving…' : 'Done'}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit notes</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#2F43B8] hover:bg-[#253696] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="bg-[#EEF0FC] border border-[#2F43B8]/20 text-[#2F43B8] text-xs font-semibold px-4 py-2.5 rounded-xl mb-5 flex items-center gap-2">
          <PenTool className="w-4 h-4 shrink-0" />
          <span>
            Editing mode active. Click any line of text or topic title directly to edit. Press Done when finished.
          </span>
        </div>
      )}

      {/* Pages Container */}
      <div
        ref={containerRef}
        className="flex flex-col items-center gap-10"
        style={{
          ['--pen' as any]: penHex,
          ['--hand' as any]: fontCss,
          ['--hs' as any]: fontSizeCss,
        }}
      >
        {topics.map((tp, topicIndex) => {
          const highlights: string[] = JSON.parse(tp.highlights_json || '[]');
          const formulas: string[] = JSON.parse(tp.formulas_json || '[]');

          const notesK = tp.notes?.filter((n) => n.bucket === 'k') || [];
          const notesI = tp.notes?.filter((n) => n.bucket === 'i') || [];
          const notesD = tp.notes?.filter((n) => n.bucket === 'd') || [];
          const notesM = tp.notes?.filter((n) => n.bucket === 'm') || [];

          return (
            <article
              key={tp.id}
              className="notebook-page"
              data-page-index={topicIndex}
            >
              {/* Page Header */}
              <div className="flex justify-between items-center text-xs font-mono text-[#7D8290] tracking-wide mb-2 mt-[-18px]">
                <span>{session.session_date}</span>
                <span>{session.speaker}</span>
                <span>p. {topicIndex + 1}</span>
              </div>

              {/* Yellow Sticky Note pinned on top right for Mentor Questions */}
              {notesM.length > 0 && (
                <div className="float-none sm:float-right w-full sm:w-56 sm:ml-5 mb-4 space-y-3 z-10 relative">
                  {notesM.map((mNote, mi) => (
                    <div
                      key={mNote.id}
                      className="sticky-note"
                      style={{
                        transform: mi % 2 === 0 ? 'rotate(1.8deg)' : 'rotate(-1.5deg)',
                      }}
                    >
                      <span className="font-bold text-xs text-[#7A5A00] block mb-1">
                        Ask {session.speaker.split(' ')[0]}:
                      </span>
                      <p
                        data-note-id={mNote.id}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`text-sm text-[#3D3413] leading-snug m-0 ${
                          isEditing ? 'bg-white/40 p-1 rounded outline-dashed outline-1 outline-[#2F43B8]' : ''
                        }`}
                      >
                        {mNote.note_text}
                      </p>
                      <button
                        onClick={() => onSeek(mNote.timestamp_seconds)}
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-[#6B5510] bg-black/5 hover:bg-black/10 px-1.5 py-0.5 rounded mt-2"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        {mNote.timestamp_formatted}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Topic Title with Red Cursive Underline */}
              <h2
                data-topic-id={tp.id}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={`text-3xl font-bold text-[#B8322A] leading-tight my-2 underline decoration-[#B8322A] underline-offset-8 decoration-2 ${
                  isEditing ? 'bg-blue-500/10 p-1 rounded outline-dashed outline-1 outline-[#2F43B8]' : ''
                }`}
              >
                {tp.title}
              </h2>
              <div className="font-mono text-xs text-[#7D8290] mb-4">
                {tp.start_formatted} – {tp.end_formatted}
              </div>

              {/* Section: Key Concepts */}
              {notesK.length > 0 && (
                <div className="mt-6">
                  <div className="font-bold text-[#2338A8] text-xl flex items-center gap-2 mb-2">
                    ★ Key concepts:
                  </div>
                  {notesK.map((n) => (
                    <div key={n.id} className="relative group my-1.5 pl-1 flex items-baseline">
                      <button
                        onClick={() => onSeek(n.timestamp_seconds)}
                        className="absolute left-[-72px] sm:left-[-76px] top-0 font-mono text-[11px] text-[#7D8290] hover:text-[#B8322A] px-1 py-0.5 rounded"
                        title={`Play audio from ${n.timestamp_formatted}`}
                      >
                        {n.timestamp_formatted}
                      </button>
                      <span className="text-[#7D8290] mr-2 select-none">–</span>
                      <p
                        data-note-id={n.id}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`inline leading-relaxed ${
                          isEditing ? 'bg-blue-500/10 p-1 rounded outline-dashed outline-1 outline-[#2F43B8]' : ''
                        }`}
                      >
                        {renderHighlightedText(n.note_text, highlights)}
                      </p>
                      {n.verification_status === 'check' && (
                        <span
                          className="ml-2 text-xs text-[#B8322A] border-b border-dashed border-[#B8322A] cursor-help inline-block font-mono"
                          title="Quote verification flagged discrepancy"
                        >
                          check?
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Formulas Box */}
              {formulas.length > 0 && (
                <div className="my-5 flex flex-wrap gap-3">
                  {formulas.map((form, fIdx) => (
                    <div
                      key={fIdx}
                      className="fx-box font-semibold text-lg text-[#1E2F8C] inline-block my-1 bg-white/40"
                    >
                      {form}
                    </div>
                  ))}
                </div>
              )}

              {/* Hand-drawn Rough.js Diagram */}
              {tp.visual_type && (
                <div className="my-6">
                  <svg
                    data-diagram={tp.visual_type}
                    viewBox="0 0 600 230"
                    className="w-full max-w-[580px] h-auto overflow-visible mx-auto"
                    role="img"
                    aria-label={tp.visual_caption || 'Diagram'}
                  />
                  {tp.visual_caption && (
                    <div className="text-xs text-[#7D8290] text-center italic mt-1 font-mono">
                      {tp.visual_caption}
                    </div>
                  )}
                </div>
              )}

              {/* Section: Industry Insights */}
              {notesI.length > 0 && (
                <div className="mt-6">
                  <div className="font-bold text-[#0B6B4C] text-xl flex items-center gap-2 mb-2">
                    ◆ From the industry:
                  </div>
                  {notesI.map((n) => (
                    <div key={n.id} className="relative group my-1.5 pl-1 flex items-baseline">
                      <button
                        onClick={() => onSeek(n.timestamp_seconds)}
                        className="absolute left-[-72px] sm:left-[-76px] top-0 font-mono text-[11px] text-[#7D8290] hover:text-[#B8322A] px-1 py-0.5 rounded"
                      >
                        {n.timestamp_formatted}
                      </button>
                      <span className="text-[#7D8290] mr-2 select-none">–</span>
                      <p
                        data-note-id={n.id}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`inline leading-relaxed ${
                          isEditing ? 'bg-blue-500/10 p-1 rounded outline-dashed outline-1 outline-[#2F43B8]' : ''
                        }`}
                      >
                        {renderHighlightedText(n.note_text, highlights)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Section: Daily-life Application */}
              {notesD.length > 0 && (
                <div className="mt-6">
                  <div className="font-bold text-[#A4481A] text-xl flex items-center gap-2 mb-2">
                    ● In daily life:
                  </div>
                  {notesD.map((n) => (
                    <div key={n.id} className="relative group my-1.5 pl-1 flex items-baseline">
                      <button
                        onClick={() => onSeek(n.timestamp_seconds)}
                        className="absolute left-[-72px] sm:left-[-76px] top-0 font-mono text-[11px] text-[#7D8290] hover:text-[#B8322A] px-1 py-0.5 rounded"
                      >
                        {n.timestamp_formatted}
                      </button>
                      <span className="text-[#7D8290] mr-2 select-none">–</span>
                      <p
                        data-note-id={n.id}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className={`inline leading-relaxed ${
                          isEditing ? 'bg-blue-500/10 p-1 rounded outline-dashed outline-1 outline-[#2F43B8]' : ''
                        }`}
                      >
                        {renderHighlightedText(n.note_text, highlights)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

function renderHighlightedText(text: string, highlights: string[]) {
  if (!highlights.length) return text;

  let elements: (string | React.ReactNode)[] = [text];

  highlights.forEach((keyword) => {
    const nextElements: (string | React.ReactNode)[] = [];
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    elements.forEach((item) => {
      if (typeof item !== 'string') {
        nextElements.push(item);
        return;
      }

      const parts = item.split(regex);
      parts.forEach((part, i) => {
        if (part.toLowerCase() === keyword.toLowerCase()) {
          nextElements.push(
            <span key={i} className="hl-mark font-medium px-1 rounded-sm">
              {part}
            </span>
          );
        } else if (part) {
          nextElements.push(part);
        }
      });
    });

    elements = nextElements;
  });

  return elements;
}
