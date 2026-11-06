// src/pages/employee/ProjectsPage.jsx
// Dedicated Company Projects catalog matching Odoo Kanban mockup with direct Timesheet links

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession } from '../../services/authService';
import {
  FolderKanban,
  Search,
  Filter,
  ListFilter,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const user = getStoredSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');

  // Projects list matching Odoo user mockup
  const [projects, setProjects] = useState([
    {
      id: 'p-1',
      name: 'Anmol - Ecommerce Web/App',
      tasks: 455,
      isFavorite: false,
      color: 'border-l-indigo-500',
    },
    {
      id: 'p-2',
      name: 'Anmoltech - web',
      tasks: 1,
      isFavorite: false,
      color: 'border-l-sky-500',
    },
    {
      id: 'p-3',
      name: 'Mharr.india ecommerce',
      tasks: 2,
      isFavorite: false,
      color: 'border-l-emerald-500',
    },
    {
      id: 'p-4',
      name: 'Mharr.india social media',
      tasks: 87,
      isFavorite: false,
      color: 'border-l-purple-500',
    },
    {
      id: 'p-5',
      name: 'Omega Elevators',
      tasks: 51,
      isFavorite: false,
      color: 'border-l-amber-500',
    },
    {
      id: 'p-6',
      name: 'Omega Elevators (Mobile)',
      tasks: 3,
      isFavorite: false,
      color: 'border-l-orange-500',
    },
    {
      id: 'p-7',
      name: 'Omega Task Management',
      tasks: 55,
      isFavorite: false,
      color: 'border-l-blue-500',
    },
    {
      id: 'p-8',
      name: 'Act of Love react native',
      tasks: 142,
      isFavorite: true,
      color: 'border-l-pink-500',
    },
  ]);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const filteredProjects = projects.filter((p) => {
    if (filterTag && !p.name.toLowerCase().includes(filterTag.toLowerCase())) {
      return false;
    }
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800">
      {/* 1. Sidebar */}
      <Sidebar activeTab="projects" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopNavbar user={user} />

        <main className="flex-1 p-5 md:p-6 overflow-y-auto">
          <div className="max-w-[1360px] mx-auto space-y-4">
            {/* Top Bar: Title & Search Filter Ribbon matching Odoo Mockup */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 sm:px-4 sm:py-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <FolderKanban size={18} />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                    Projects
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    Company project roster &amp; work ledgers
                  </p>
                </div>
              </div>

              {/* Odoo Search & Filter Control Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input with Tag Box */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-[#f8fafc] px-2 py-1 shadow-2xs text-xs">
                  <div className="flex items-center gap-1 bg-[#714B67] text-white font-bold text-[10px] px-2 py-0.5 rounded-lg mr-1.5">
                    <span>Project</span>
                  </div>
                  {filterTag && (
                    <span className="flex items-center gap-1 bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded-md mr-1.5">
                      <span>{filterTag}</span>
                      <button
                        type="button"
                        onClick={() => setFilterTag('')}
                        className="hover:text-purple-950 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-36 sm:w-48"
                  />
                  <Search size={14} className="text-slate-400 ml-1" />
                </div>

                {/* Filters / Group By / Favorites buttons */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterTag(filterTag ? '' : 'omega')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                      filterTag === 'omega'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Filter size={12} />
                    <span>Filters</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <ListFilter size={12} />
                    <span>Group By</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Star size={12} className="text-amber-500 fill-amber-400" />
                    <span>Favorites</span>
                  </button>
                </div>

                {/* Pagination count pill */}
                <div className="flex items-center gap-1 pl-1 text-[11px] font-semibold text-slate-500">
                  <span>1-{filteredProjects.length} / {filteredProjects.length}</span>
                  <div className="flex items-center gap-0.5 ml-1">
                    <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-700">
                      <ChevronLeft size={14} />
                    </button>
                    <button type="button" className="p-1 rounded text-slate-400 hover:text-slate-700">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban / Cards Grid Matching Odoo Mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/timesheets?project=${encodeURIComponent(project.name)}`)}
                  className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] group border-l-4 ${project.color}`}
                >
                  {/* Top: Star Favorite + Project Title */}
                  <div>
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(project.id, e)}
                        className="text-slate-300 hover:text-amber-500 transition-colors mt-0.5 cursor-pointer"
                      >
                        <Star
                          size={16}
                          className={
                            project.isFavorite
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 hover:text-amber-400'
                          }
                        />
                      </button>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-900 transition-colors leading-tight">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  {/* Bottom: Task Count & Clickable Timesheets Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {project.tasks} Tasks
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/timesheets?project=${encodeURIComponent(project.name)}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#714B67] hover:text-[#52334b] hover:underline cursor-pointer"
                    >
                      <Clock size={13} />
                      <span>Timesheets</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
