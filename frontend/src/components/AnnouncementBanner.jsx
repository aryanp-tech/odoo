// src/components/AnnouncementBanner.jsx
import React from 'react';
import { Megaphone, ExternalLink, Calendar } from 'lucide-react';

export default function AnnouncementBanner({ announcement }) {
  if (!announcement) return null;

  const { title, description, badge = "Announcement", date, actionText = "Learn More", link = "#" } = announcement;

  return (
    <div className="bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-white border border-purple-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden">
      {/* Decorative subtle background ring */}
      <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-purple-100/40 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#714B67] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <Megaphone size={20} strokeWidth={2.2} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-purple-100 text-[#714B67] border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {badge}
              </span>
              {date && (
                <span className="text-[11px] text-slate-400 font-medium flex items-center">
                  <Calendar size={12} className="mr-1" />
                  {date}
                </span>
              )}
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {title}
            </h4>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="shrink-0 sm:self-center pl-13 sm:pl-0">
          <a
            href={link}
            onClick={(e) => { e.preventDefault(); alert(`Notice: ${title}`); }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#714B67] hover:bg-[#583850] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <span>{actionText}</span>
            <ExternalLink size={13} />
          </a>
        </div>

      </div>
    </div>
  );
}
