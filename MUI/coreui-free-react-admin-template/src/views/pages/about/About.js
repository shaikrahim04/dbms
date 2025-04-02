import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CContainer,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilChart,
  cilSpeedometer,
  cilLockLocked,
  cilGraph,
  cilSettings,
} from '@coreui/icons'

const FeatureCard = ({ icon, title, description }) => (
  <div className="feature-card p-4 bg-white rounded-3 shadow-sm border-start border-4 border-info mb-4">
    <div className="d-flex align-items-center mb-3">
      <div className="feature-icon me-3 bg-light p-3 rounded">
        <CIcon icon={icon} size="xl" className="text-primary"/>
      </div>
      <h4 className="mb-0">{title}</h4>
    </div>
    <p className="text-muted mb-0">{description}</p>
  </div>
)

const TechStackItem = ({ name, description, color }) => (
  <div className={`tech-item p-3 bg-${color}-subtle rounded-3 mb-3 border border-${color}-subtle`}>
    <h5 className={`text-${color}`}>{name}</h5>
    <p className="mb-0 text-muted small">{description}</p>
  </div>
)

const About = () => {
  const navigate = useNavigate()
  
  return (
    <CContainer className="py-4">
      <CRow>
        <CCol>
          <CCard className="border-0 shadow-sm overflow-hidden">
            <div className="bg-primary text-white p-5 position-relative">
              <div className="position-relative z-1">
                <h1 className="display-4 fw-bold mb-3">Habit Tracker</h1>
                <p className="lead mb-4 opacity-75">
                  Empowering individuals to build better habits through data-driven insights and seamless integration with popular tracking platforms.
                </p>
              </div>
              <div className="position-absolute top-0 end-0 p-5 opacity-25">
                <CIcon icon={cilSpeedometer} size="6xl" />
              </div>
            </div>
            <CCardBody className="p-5">
              <CRow>
                <CCol md={8} className="mb-5">
                  <h2 className="border-bottom pb-3 mb-4">Our Mission</h2>
                  <p className="lead text-muted">
                    We believe in the power of data-driven habit formation. Our platform combines 
                    cutting-edge technology with proven behavioral science to help you build and 
                    maintain positive habits that last.
                  </p>
                </CCol>
              </CRow>

              <h3 className="mb-4">Key Features</h3>
              <CRow className="g-4 mb-5">
                <CCol md={6}>
                  <FeatureCard
                    icon={cilSettings}
                    title="Habitica Integration"
                    description="Seamlessly connect and sync with your Habitica account for comprehensive habit tracking"
                  />
                </CCol>
                <CCol md={6}>
                  <FeatureCard
                    icon={cilChart}
                    title="Visual Analytics"
                    description="Track your progress with beautiful, interactive charts and visualizations"
                  />
                </CCol>
                <CCol md={6}>
                  <FeatureCard
                    icon={cilGraph}
                    title="Progress Tracking"
                    description="Monitor your habit formation journey with detailed metrics and insights"
                  />
                </CCol>
                <CCol md={6}>
                  <FeatureCard
                    icon={cilLockLocked}
                    title="Secure Platform"
                    description="Your data is protected with industry-standard security measures"
                  />
                </CCol>
              </CRow>

              <h3 className="mb-4">Technology Stack</h3>
              <CRow className="g-4 mb-5">
                <CCol md={3}>
                  <TechStackItem
                    name="React"
                    description="Modern frontend framework for building interactive UIs"
                    color="info"
                  />
                </CCol>
                <CCol md={3}>
                  <TechStackItem
                    name="Flask"
                    description="Lightweight and flexible Python web framework"
                    color="success"
                  />
                </CCol>
                <CCol md={3}>
                  <TechStackItem
                    name="PostgreSQL"
                    description="Robust and reliable database system"
                    color="primary"
                  />
                </CCol>
                <CCol md={3}>
                  <TechStackItem
                    name="JWT Auth"
                    description="Secure authentication system"
                    color="warning"
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default About
