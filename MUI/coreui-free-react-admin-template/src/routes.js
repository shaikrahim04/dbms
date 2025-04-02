import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const About = React.lazy(() => import('./views/pages/about/About'))
const ApiManagement = React.lazy(() => import('./views/api/ApiManagement'))
const SleepManagement = React.lazy(() => import('./views/sleep/SleepManagement'))
const GymManagement = React.lazy(() => import('./views/gym/GymManagement'))

const routes = [
  { path: '/dashboard', exact: true, name: 'Dashboard', element: Dashboard },
  { path: '/api-management', name: 'API Management', element: ApiManagement },
  { path: '/about', name: 'About', element: About },
  { path: '/sleep', name: 'Sleep Management', element: SleepManagement },
  { path: '/gym', name: 'Gym Management', element: GymManagement },
]

export default routes
