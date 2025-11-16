'use client';
import type {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/admin-ui-ref/ui/modal';
import { useModal } from '@/hooks/useModal';

type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO string
  end?: string;
  allDay?: boolean;
  extendedProps: {
    calendar: string;
  };
  [key: string]: unknown; // Allow additional properties
};

type CalendarEventLevel = 'Danger' | 'Success' | 'Primary' | 'Warning';

type CalendarEventFormData = {
  id?: string;
  title: string;
  start: string;
  end: string | undefined;
  level: CalendarEventLevel;
};

const CALENDAR_EVENTS = {
  Danger: 'danger',
  Success: 'success',
  Primary: 'primary',
  Warning: 'warning',
} as const;

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [formData, setFormData] = useState<CalendarEventFormData>({
    title: '',
    start: '',
    end: '',
    level: 'Primary', // Default level
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const loadInitialEvents = () => {
      const initialEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Event Conf.',
          start: new Date().toISOString(),
          extendedProps: { calendar: 'Danger' },
        },
        {
          id: '2',
          title: 'Meeting',
          start: new Date(Date.now() + 86_400_000).toISOString(),
          extendedProps: { calendar: 'Success' },
        },
        {
          id: '3',
          title: 'Workshop',
          start: new Date(Date.now() + 172_800_000).toISOString(),
          end: new Date(Date.now() + 259_200_000).toISOString(),
          extendedProps: { calendar: 'Primary' },
        },
      ];
      return initialEvents;
    };

    setEvents(loadInitialEvents());
  }, []);

  const resetModalFields = React.useCallback(() => {
    setFormData({
      title: '',
      start: '',
      end: '',
      level: 'Primary',
    });
    setSelectedEvent(null);
    setError(null);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setFormData((prev) => ({
      ...prev,
      start: selectInfo.startStr,
      end: selectInfo.endStr || selectInfo.startStr,
      level: 'Primary',
    }));
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event as unknown as CalendarEvent;
    const eventStartDate = (clickInfo.event.startStr ?? '').split('T')[0] ?? '';
    const eventEndDate = (clickInfo.event.endStr ?? '').split('T')[0] ?? '';

    setSelectedEvent(event);
    setFormData({
      id: event.id,
      title: event.title,
      start: eventStartDate,
      end: eventEndDate,
      level: (event.extendedProps?.calendar as CalendarEventLevel) || 'Primary',
    });
    openModal();
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.start) {
      setError('Start date is required');
      return false;
    }
    if (formData.end && new Date(formData.end) < new Date(formData.start)) {
      setError('End date must be after start date');
      return false;
    }
    return true;
  };

  const handleAddOrUpdateEvent = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedEvent) {
        // Update existing event
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  title: formData.title,
                  start: formData.start,
                  end: formData.end || undefined,
                  extendedProps: { calendar: formData.level },
                }
              : event
          )
        );
      } else {
        // Add new event
        const newEvent: CalendarEvent = {
          id: Date.now().toString(),
          title: formData.title,
          start: formData.start,
          end: formData.end || undefined,
          allDay: true,
          extendedProps: { calendar: formData.level },
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
      closeModal();
      resetModalFields();
    } catch (err) {
      setError('Failed to save event. Please try again.');
      console.error('Error saving event:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const event = eventInfo.event as unknown as CalendarEvent;
    const colorClass = `fc-bg-${event.extendedProps.calendar.toLowerCase()}`;
    const timeText = eventInfo.timeText || '';
    const title = event.title || '';

    return (
      <div
        aria-label={`${title} ${timeText}`}
        className={`event-fc-color flex ${colorClass} rounded-sm p-1`}
      >
        <div
          aria-hidden="true"
          className="mr-1 h-2 w-2 rounded-full bg-white/80"
        />
        {timeText && (
          <span aria-hidden="true" className="mr-1 text-xs">
            {timeText}
          </span>
        )}
        <span className="truncate">{title}</span>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
      {error && (
        <div
          className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}
      <div className="custom-calendar">
        <FullCalendar
          customButtons={{
            addEventButton: {
              text: 'Add Event +',
              click: () => {
                resetModalFields();
                openModal();
              },
            },
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          events={events}
          headerToolbar={{
            left: 'prev,next addEventButton',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          select={handleDateSelect}
          selectable={true}
        />
      </div>
      <Modal
        className="max-w-[700px] p-6 lg:p-10"
        isOpen={isOpen}
        onClose={closeModal}
      >
        <div className="custom-scrollbar flex flex-col overflow-y-auto px-2">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 text-xl lg:text-2xl dark:text-white/90">
              {selectedEvent ? 'Edit Event' : 'Add Event'}
            </h5>
            <p className="text-gray-500 text-sm dark:text-gray-400">
              Plan your next big moment: schedule or edit an event to stay on
              track
            </p>
          </div>
          <div className="mt-8">
            <div className="mb-6">
              <label
                className="mb-1.5 block font-medium text-gray-700 text-sm dark:text-gray-400"
                htmlFor="event-title"
              >
                Event Title
              </label>
              <input
                aria-describedby={
                  formData.title.trim() ? undefined : 'title-error'
                }
                aria-invalid={!formData.title.trim()}
                aria-required="true"
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 dark:placeholder:text-white/30"
                id="event-title"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                type="text"
                value={formData.title}
              />
              {!formData.title.trim() && (
                <p className="mt-1 text-red-500 text-sm" id="title-error">
                  Event title is required
                </p>
              )}
            </div>
            <div className="mb-6">
              <span className="mb-4 block font-medium text-gray-700 text-sm dark:text-gray-400">
                Event Color
              </span>
              <div className="flex flex-wrap gap-4">
                {Object.entries(CALENDAR_EVENTS).map(([key, value]) => (
                  <label
                    className="flex cursor-pointer items-center text-gray-700 text-sm dark:text-gray-400"
                    key={key}
                  >
                    <input
                      checked={formData.level === key}
                      className="sr-only"
                      name="event-level"
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          level: key as CalendarEventLevel,
                        }))
                      }
                      type="radio"
                      value={key}
                    />
                    <span className="relative mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
                      <span
                        aria-hidden="true"
                        className={`h-3 w-3 rounded-full ${value === 'danger' ? 'bg-red-500' : value === 'success' ? 'bg-green-500' : value === 'primary' ? 'bg-blue-500' : 'bg-yellow-500'} ${formData.level === key ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </span>
                    {key}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label
                className="mb-1.5 block font-medium text-gray-700 text-sm dark:text-gray-400"
                htmlFor="event-start-date"
              >
                Start Date
              </label>
              <div className="relative">
                <input
                  aria-describedby={
                    formData.start ? undefined : 'start-date-error'
                  }
                  aria-invalid={!formData.start}
                  aria-required="true"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 dark:placeholder:text-white/30"
                  id="event-start-date"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, start: e.target.value }))
                  }
                  type="date"
                  value={formData.start}
                />
                {!formData.start && (
                  <p
                    className="mt-1 text-red-500 text-sm"
                    id="start-date-error"
                  >
                    Start date is required
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label
                className="mb-1.5 block font-medium text-gray-700 text-sm dark:text-gray-400"
                htmlFor="event-end-date"
              >
                End Date (optional)
              </label>
              <div className="relative">
                <input
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 text-sm shadow-sm placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 dark:placeholder:text-white/30"
                  id="event-end-date"
                  min={formData.start}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, end: e.target.value }))
                  }
                  type="date"
                  value={formData.end}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:ring-offset-gray-900 dark:hover:bg-gray-700"
              disabled={isSubmitting}
              onClick={closeModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-sm text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-brand-600 dark:focus:ring-offset-gray-900 dark:hover:bg-brand-700"
              disabled={isSubmitting}
              onClick={handleAddOrUpdateEvent}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                    />
                  </svg>
                  {selectedEvent ? 'Updating...' : 'Saving...'}
                </>
              ) : selectedEvent ? (
                'Update Event'
              ) : (
                'Add Event'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;
