export const  MONOTRACK_API_ORIGIN =
  process.env.NEXT_PUBLIC_LIVE_MONOTRACK_BACKEND_URL;


export const URLS = {
    users: {
        all: "/api/v1/users",
        one: "/api/v1/users/[id]",
    },
    tasks: {
        all: "/api/v1/tasks",
        create: "/api/v1/tasks",
    },
    projects: {
        all: "/api/v1/projects",
        create: "/api/v1/projects",

    },
    backlogs: {
        all: "/api/v1/projects/[id]/backlog",
        create: "/api/v1/backlog-items",

    },
    time_tracking: {
        all: "/api/v1/time-entries",
        create: "/api/v1/time-entries",
    },
    kpi_and_report: {
        all: "/api/v1/kpi/user/[userId]",
    }
    
  }