import React from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
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

const Home = () => {
  const navigate = useNavigate()
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="bg-light min-vh-100">
      <CContainer className="py-4">
        <CRow>
          <CCol>
            <CCard className="border-0 shadow-sm overflow-hidden">
              <div className="bg-primary text-white p-5 position-relative">
                <div className="position-relative z-1">
                  <h1 className="display-4 fw-bold mb-3">Habit Tracker</h1>
                  <p className="lead mb-4 opacity-75">
                    Empowering individuals to build better habits through data-driven insights 
                    and seamless integration with popular tracking platforms.
                  </p>
                  <div className="d-flex gap-2">
                    <CButton 
                      color="info" 
                      className="text-white px-4"
                      onClick={() => navigate('/register')}
                    >
                      Get Started
                    </CButton>
                    <CButton 
                      color="light" 
                      variant="outline"
                      className="px-4"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </CButton>
                  </div>
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
                      description="Seamlessly connect and sync with your Habitica account"
                    />
                  </CCol>
                  <CCol md={6}>
                    <FeatureCard
                      icon={cilChart}
                      title="Visual Analytics"
                      description="Track your progress with beautiful, interactive charts"
                    />
                  </CCol>
                  <CCol md={6}>
                    <FeatureCard
                      icon={cilGraph}
                      title="Progress Tracking"
                      description="Monitor your habit formation journey with detailed metrics"
                    />
                  </CCol>
                  <CCol md={6}>
                    <FeatureCard
                      icon={cilLockLocked}
                      title="Secure Platform"
                      description="Your data is protected with industry-standard security"
                    />
                  </CCol>
                </CRow>

                <div className="text-center py-5">
                  <h2 className="mb-4">Ready to Start Your Journey?</h2>
                  <CButton 
                    color="primary" 
                    size="lg"
                    className="px-5"
                    onClick={() => navigate('/register')}
                  >
                    Create Free Account
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Home
