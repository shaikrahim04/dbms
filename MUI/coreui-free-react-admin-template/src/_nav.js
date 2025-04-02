import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilStar,
  cilSettings,
  cilInfo,
  cilMoon,
  cilPeople,  // Add this instead of cilWeightlifting
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'API Management',
    to: '/api-management',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Sleep',
    to: '/sleep',
    icon: <CIcon icon={cilMoon} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Gym',
    to: '/gym',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,  // Changed from cilWeightlifting to cilPeople
  }
  ,
  {
    component: CNavItem,
    name: 'About',
    to: '/about',
    icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
  },
]

export default _nav
