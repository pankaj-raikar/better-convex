import type { Metadata } from 'next';

const cn = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(' ');

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const actionButtons = [
  { label: 'Ask AI', variant: 'primary' as const },
  { label: 'Get tasks updates', variant: 'secondary' as const },
  { label: 'Create workspace', variant: 'secondary' as const },
  { label: 'Connect apps', variant: 'secondary' as const },
];

type TaskItem = {
  id: string;
  title: string;
  context: string;
  priority: 'High' | 'Low' | 'Medium';
  due: string;
};

const taskSections: Array<{
  id: string;
  label: string;
  accentClass: string;
  tasks: TaskItem[];
}> = [
  {
    id: 'progress',
    label: 'In progress',
    accentClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
    tasks: [
      {
        id: 'meeting',
        title: 'One-on-One Meeting',
        context: 'Product launch / My Projects',
        priority: 'High',
        due: 'Today',
      },
      {
        id: 'summary',
        title: 'Send a summary email to stakeholders',
        context: 'Branding launch / My Projects',
        priority: 'Low',
        due: '3 days left',
      },
    ],
  },
  {
    id: 'todo',
    label: 'To do',
    accentClass:
      'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200',
    tasks: [
      {
        id: 'sync',
        title: "Outline talking points for tomorrow's sync",
        context: 'Team brainstorm / Tasks',
        priority: 'Medium',
        due: 'Thu, Jul 09',
      },
    ],
  },
];

const goals = [
  {
    id: 'emails',
    title: 'Check Emails and Messages',
    project: 'Product launch / My Projects',
    progress: 73,
    progressColor: 'bg-emerald-500 dark:bg-emerald-400',
  },
  {
    id: 'status',
    title: 'Share a status update with the client',
    project: 'Branding launch / My Projects',
    progress: 11,
    progressColor: 'bg-sky-500 dark:bg-sky-400',
  },
  {
    id: 'documentation',
    title: 'Update project documentation',
    project: 'Team brainstorm / My Projects',
    progress: 63,
    progressColor: 'bg-indigo-500 dark:bg-indigo-400',
  },
];

const projects = [
  {
    id: 'new',
    name: 'Create new project',
    meta: 'Start from a guided brief',
    highlight:
      'border border-dashed border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-500/60 dark:bg-purple-500/10 dark:text-purple-100',
    icon: '+',
  },
  {
    id: 'launch',
    name: 'Product launch',
    meta: '6 tasks / 12 teammates',
    highlight:
      'bg-linear-to-br from-purple-500 via-violet-500 to-indigo-500 text-white',
    icon: 'PL',
  },
  {
    id: 'brainstorm',
    name: 'Team brainstorm',
    meta: '2 tasks / 32 teammates',
    highlight: 'bg-linear-to-br from-indigo-500 to-sky-500 text-white',
    icon: 'TB',
  },
  {
    id: 'branding',
    name: 'Branding launch',
    meta: '4 tasks / 9 teammates',
    highlight: 'bg-linear-to-br from-cyan-500 to-emerald-500 text-white',
    icon: 'BL',
  },
];

const calendarWeek = [
  { id: 'fri', label: 'Fri', date: '04' },
  { id: 'sat', label: 'Sat', date: '05' },
  { id: 'sun', label: 'Sun', date: '06' },
  { id: 'mon', label: 'Mon', date: '07', isActive: true },
  { id: 'tue', label: 'Tue', date: '08' },
  { id: 'wed', label: 'Wed', date: '09' },
  { id: 'thu', label: 'Thu', date: '10' },
];

const reminders = [
  {
    id: 'risk',
    title: 'Assess any new risks identified in the morning meeting.',
    due: 'Today / 2 reminders',
  },
  {
    id: 'outline',
    title: "Outline key points for tomorrow's stand-up.",
    due: 'Tomorrow / Team brainstorm',
  },
];

const upcomingEvent = {
  title: 'Meeting with VP',
  timeframe: 'Today / 10:00 - 11:00 am',
  location: 'Google Meet',
};

export const metadata: Metadata = {
  title: 'SaaS Productivity Dashboard | Next.js Boilerplatee',
  description:
    'A focused SaaS workspace view with tasks, projects, calendar, and reminders that keeps the default sidebar intact.',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardHero />
      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <TaskBoard />
          <GoalsCard />
          <CommunityInvite />
        </div>
        <div className="space-y-6">
          <ProjectsCard />
          <CalendarCard />
          <RemindersCard />
        </div>
      </section>
    </div>
  );
}

function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-[0_15px_50px_-25px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80',
        className
      )}
    >
      {children}
    </div>
  );
}

function DashboardHero() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#c7d2fe,transparent_55%)] opacity-60 dark:bg-[radial-gradient(circle_at_top,#312e81,transparent_55%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-slate-500 text-sm dark:text-slate-400">
            Mon, July 7
          </p>
          <h1 className="mt-2 font-semibold text-3xl text-slate-900 dark:text-white">
            Hello, Courtney
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            How can I help you today?
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {actionButtons.map((action) => (
            <button
              className={cn(
                'rounded-full px-5 py-2 font-semibold text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400',
                action.variant === 'primary'
                  ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-sky-400 text-white shadow-lg shadow-purple-200/70'
                  : 'bg-white/80 text-slate-600 ring-1 ring-slate-200 hover:text-slate-900 dark:bg-slate-900/70 dark:text-slate-100 dark:ring-slate-700'
              )}
              key={action.label}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function TaskBoard() {
  return (
    <Card>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-500 text-sm dark:text-slate-400">
            Mon, July 7
          </p>
          <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
            My Tasks
          </h2>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 font-semibold text-sm text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          type="button"
        >
          <span className="text-base">+</span> Add task
        </button>
      </header>

      <div className="mt-6 space-y-6">
        {taskSections.map((section) => (
          <div className="space-y-4" key={section.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 font-semibold text-xs uppercase',
                    section.accentClass
                  )}
                >
                  {section.label}
                </span>
                <span className="text-slate-500 text-sm dark:text-slate-400">
                  {section.tasks.length}{' '}
                  {section.tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              <button
                className="font-semibold text-slate-500 text-sm transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                type="button"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {section.tasks.map((task) => (
                <article
                  className="hover:-translate-y-0.5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
                  key={task.id}
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-slate-500 text-sm dark:text-slate-400">
                      {task.context}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-slate-500 dark:text-slate-400">
                      {task.due}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: TaskItem['priority'] }) {
  const priorityMap = {
    High: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
    Medium:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
    Low: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-200',
  };

  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 font-semibold text-xs',
        priorityMap[priority]
      )}
    >
      {priority}
    </span>
  );
}

function GoalsCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
          My Goals
        </h2>
        <button
          className="font-semibold text-purple-600 text-sm transition hover:text-purple-500 dark:text-purple-300"
          type="button"
        >
          View details
        </button>
      </div>
      <div className="mt-6 space-y-5">
        {goals.map((goal) => (
          <div key={goal.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {goal.title}
                </p>
                <p className="text-slate-500 text-sm dark:text-slate-400">
                  {goal.project}
                </p>
              </div>
              <span className="font-semibold text-slate-700 text-sm dark:text-white">
                {goal.progress}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn('h-2 rounded-full', goal.progressColor)}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CommunityInvite() {
  return (
    <Card className="bg-linear-to-br from-purple-500 via-indigo-500 to-sky-500 text-white shadow-purple-500/30 dark:shadow-purple-900/30">
      <div className="space-y-4">
        <p className="font-semibold text-sm text-white/80 uppercase tracking-widest">
          Prodify
        </p>
        <h3 className="font-semibold text-2xl">
          New members gain access to public spaces, docs, and dashboards.
        </h3>
        <button
          className="inline-flex items-center rounded-full bg-white/20 px-5 py-2 font-semibold text-sm backdrop-blur transition hover:bg-white/30"
          type="button"
        >
          + Invite people
        </button>
      </div>
    </Card>
  );
}

function ProjectsCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
          Projects
        </h2>
        <button
          className="font-semibold text-slate-500 text-sm transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          type="button"
        >
          Recents v
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <button
            className="hover:-translate-y-0.5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/80 p-4 text-left shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
            key={project.id}
            type="button"
          >
            <span
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-2xl font-semibold text-lg',
                project.highlight
              )}
            >
              {project.icon}
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {project.name}
              </p>
              <p className="text-slate-500 text-sm dark:text-slate-400">
                {project.meta}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function CalendarCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
          Calendar
        </h2>
        <button
          className="font-semibold text-slate-500 text-sm transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          type="button"
        >
          July v
        </button>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-500 text-sm dark:bg-slate-800/60 dark:text-slate-300">
        {calendarWeek.map((day) => (
          <span
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl px-3 py-1 transition',
              day.isActive
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300'
                : 'text-slate-500'
            )}
            key={day.id}
          >
            {day.label}
            <strong className="text-base">{day.date}</strong>
          </span>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <p className="font-semibold text-slate-500 text-sm dark:text-slate-400">
          Today
        </p>
        <h3 className="mt-1 font-semibold text-lg text-slate-900 dark:text-white">
          {upcomingEvent.title}
        </h3>
        <p className="text-slate-500 text-sm dark:text-slate-400">
          {upcomingEvent.timeframe}
        </p>
        <div className="mt-4 flex items-center justify-between text-slate-500 text-sm dark:text-slate-400">
          <span>{upcomingEvent.location}</span>
          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600 text-xs dark:bg-slate-800 dark:text-slate-200">
            +2
          </span>
        </div>
      </div>
    </Card>
  );
}

function RemindersCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 text-xl dark:text-white">
          Reminders
        </h2>
        <button
          className="font-semibold text-slate-500 text-sm transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          type="button"
        >
          Today v
        </button>
      </div>
      <div className="mt-6 space-y-4">
        {reminders.map((reminder) => (
          <div
            className="hover:-translate-y-0.5 rounded-2xl border border-slate-100 bg-white/80 p-4 text-left shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/60"
            key={reminder.id}
          >
            <p className="font-semibold text-slate-900 dark:text-white">
              {reminder.title}
            </p>
            <p className="text-slate-500 text-sm dark:text-slate-400">
              {reminder.due}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
