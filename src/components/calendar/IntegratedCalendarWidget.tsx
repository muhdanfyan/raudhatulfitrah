import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Activity, Users, BookOpen, ClipboardCheck, AlertTriangle, Plus, Settings } from 'lucide-react';
import { api } from '../../services/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import CalendarEventModal from './CalendarEventModal';

interface CalendarWidgetProps {
  onDateClick?: (date: Date) => void;
  isHalf?: boolean;
}

interface CalendarEvent {
  id: string | number;
  title: string;
  category: string;
  start_date?: string;
  end_date?: string;
  source: string;
  color: string;
  created_by?: number;
  pj_id?: number | null;
  pj_name?: string;
}

const IntegratedCalendarWidget: React.FC<CalendarWidgetProps> = ({ onDateClick, isHalf = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [eventDates, setEventDates] = useState<Record<string, CalendarEvent[]>>({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchDailyPulse(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthEvents();
  }, [currentMonth]);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/calendar/permissions');
      if (response.status === 'success') {
        setCanManage(true); // Forced true by request for all dashboard widgets
      }
    } catch (err) {
      console.error('Failed to fetch calendar permissions');
    }
  };

  const fetchMonthEvents = async () => {
    try {
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const response = await api.getMonthEvents(month, year);
      if (response.status === 'success') {
        const events = response.data.events || [];
        // Group events by date for quick lookup
        const dateMap: Record<string, CalendarEvent[]> = {};
        events.forEach((e: CalendarEvent) => {
          if (e.start_date) {
            const dateKey = e.start_date.split('T')[0];
            if (!dateMap[dateKey]) dateMap[dateKey] = [];
            dateMap[dateKey].push(e);
          }
        });
        setEventDates(dateMap);
      }
    } catch (error) {
      console.error('Failed to fetch month events:', error);
    }
  };

  const fetchDailyPulse = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await api.getDailyPulse(dateStr);
      if (response.status === 'success') {
        setDailyStats(response.data.stats);
        
        // Update events specifically for this date from pulse (it's more accurate for recurring items)
        const pulseEvents = response.data.events || [];
        if (pulseEvents.length > 0) {
          setEventDates(prev => ({
            ...prev,
            [dateStr]: pulseEvents
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch daily pulse:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          Kalender Aktivitas
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventDates[dateKey] || [];
          const hasEvents = dayEvents.length > 0;

          // Get unique colors for dots (max 3)
          const uniqueColors = [...new Set(dayEvents.map(e => e.color))].slice(0, 3);

          return (
            <div
              key={day.toString()}
              onClick={() => {
                setSelectedDate(day);
                if (onDateClick) onDateClick(day);
              }}
              className={`
                relative h-10 flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200
                ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-700 hover:bg-indigo-50'}
                ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : ''}
                ${isToday && !isSelected ? 'border-2 border-indigo-400 font-bold' : ''}
                ${hasEvents && !isSelected ? 'bg-slate-50' : ''}
              `}
              title={hasEvents ? dayEvents.map(e => e.title).join(', ') : ''}
            >
              <span className="text-xs">{format(day, 'd')}</span>
              {/* Event Indicators */}
              <div className="flex gap-0.5 mt-0.5">
                {uniqueColors.map((color, i) => (
                  <div 
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'opacity-80' : ''}`}
                    style={{ backgroundColor: isSelected ? '#fff' : color }}
                  />
                ))}
                {isToday && !hasEvents && (
                  <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'} animate-pulse`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const StatItem = ({ icon: Icon, label, value, color }: any) => (
    <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow ${isHalf ? 'p-2 gap-2' : ''}`}>
      <div className={`p-2 rounded-xl ${color} bg-opacity-10 ${isHalf ? 'p-1.5' : ''}`}>
        <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')} ${isHalf ? 'w-3.5 h-3.5' : ''}`} />
      </div>
      <div>
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide leading-tight">{label}</p>
        <p className={`${isHalf ? 'text-xs' : 'text-sm'} font-bold text-slate-800`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className={`${isHalf ? 'p-4' : 'p-5'} rounded-[2rem] bg-indigo-50/30 border border-indigo-100 backdrop-blur-sm`}>
      {renderHeader()}
      
      <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-indigo-50 mb-4 ${isHalf ? 'p-3' : 'p-4'}`}>
        {renderDays()}
        {renderCells()}
      </div>

      <div>
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-black/5 p-1 rounded-lg transition-colors group mb-3"
          onClick={() => setSummaryCollapsed(!summaryCollapsed)}
        >
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
            Ringkasan {isHalf ? '' : `Aktivitas (${format(selectedDate, 'd MMM')})`}
          </h3>
          <div className="p-1 rounded-md text-slate-400 group-hover:text-slate-600 transition-colors">
            {summaryCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className={summaryCollapsed ? 'hidden' : 'block mb-4'}>
            <div className="grid grid-cols-2 gap-3">
              <StatItem 
                icon={Users} 
                label="Presensi" 
                value={dailyStats?.presence || '0%'} 
                color="bg-emerald-500" 
              />
              <StatItem 
                icon={BookOpen} 
                label="Hafalan" 
                value={`${dailyStats?.setoran || 0} Setoran`} 
                color="bg-blue-500" 
              />
              <StatItem 
                icon={ClipboardCheck} 
                label="SOP" 
                value={dailyStats?.sop_percent || '0%'} 
                color="bg-purple-500" 
              />
              <StatItem 
                icon={Activity} 
                label="Laporan" 
                value={dailyStats?.reports || 0} 
                color="bg-orange-500" 
              />
              {dailyStats?.sanksi > 0 && (
                <div className={isHalf ? '' : 'col-span-2'}>
                  <StatItem 
                    icon={AlertTriangle} 
                    label="Kedisiplinan" 
                    value={`${dailyStats.sanksi} Catatan`} 
                    color="bg-rose-500" 
                  />
                </div>
              )}
            </div>

            {/* Events for selected date */}
            {(() => {
              const dateKey = format(selectedDate, 'yyyy-MM-dd');
              const dayEvents = eventDates[dateKey] || [];
              
              return (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Agenda & Event ({dayEvents.length})
                    </h4>
                    {canManage && (
                      <button
                        onClick={() => setShowEventModal(true)}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-3 h-3" />
                        Kelola
                      </button>
                    )}
                  </div>
                  {dayEvents.length === 0 ? (
                    canManage ? (
                      <button
                        onClick={() => setShowEventModal(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Tambah Event</span>
                      </button>
                    ) : (
                      <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm text-slate-500 font-medium">Tidak ada event untuk tanggal ini</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      {dayEvents.map((event, i) => (
                        <div 
                          key={event.id || i}
                          onClick={() => canManage && setShowEventModal(true)}
                          className={`flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 ${canManage ? 'cursor-pointer hover:border-indigo-200 hover:shadow-sm' : ''} transition-all`}
                        >
                          <div 
                            className="w-2 h-8 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {event.title}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize">
                              {event.source === 'proker' ? `Proker • ${(event as any).jabatan || ''}` : event.category}
                              {event.pj_name && ` • PJ: ${event.pj_name}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {canManage && (
        <button 
          onClick={() => setShowEventModal(true)}
          className="mt-4 py-3 w-full bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-200"
        >
          <Plus className="w-4 h-4" />
          Kelola Event
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Event Modal */}
      <CalendarEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        selectedDate={selectedDate}
        existingEvents={eventDates[format(selectedDate, 'yyyy-MM-dd')] || []}
        onEventSaved={() => {
          fetchMonthEvents();
          fetchDailyPulse(selectedDate);
        }}
      />
    </div>
  );
};

export default IntegratedCalendarWidget;
