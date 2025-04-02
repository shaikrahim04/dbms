import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    general: ''
  })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormErrors({ username: '', email: '', password: '', general: '' })

    if (password !== repeatPassword) {
      setFormErrors(prev => ({ ...prev, password: "Passwords do not match" }))
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await response.json()
      
      if (data.status === 'success') {
        navigate('/login')
      } else {
        switch (data.error_type) {
          case 'duplicate_user':
            setFormErrors(prev => ({ ...prev, username: String(data.message) }))
            break
          case 'duplicate_email':
            setFormErrors(prev => ({ ...prev, email: String(data.message) }))
            break
          default:
            setFormErrors(prev => ({ 
              ...prev, 
              general: typeof data.message === 'string' ? data.message : 'Registration failed'
            }))
        }
      }
    } catch (error) {
      setFormErrors(prev => ({ 
        ...prev, 
        general: 'An error occurred during registration. Please try again.' 
      }))
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>
                  {formErrors.general && <p className="text-danger">{formErrors.general}</p>}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput 
                      placeholder="Username" 
                      autoComplete="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      invalid={!!formErrors.username}
                    />
                  </CInputGroup>
                  {formErrors.username && <p className="text-danger small mb-3">{formErrors.username}</p>}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>@</CInputGroupText>
                    <CFormInput 
                      placeholder="Email" 
                      autoComplete="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      invalid={!!formErrors.email}
                    />
                  </CInputGroup>
                  {formErrors.email && <p className="text-danger small mb-3">{formErrors.email}</p>}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      invalid={!!formErrors.password}
                    />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      invalid={!!formErrors.password}
                    />
                  </CInputGroup>
                  {formErrors.password && <p className="text-danger small mb-3">{formErrors.password}</p>}
                  <div className="d-grid">
                    <CButton color="success" type="submit">Create Account</CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        <CRow className="justify-content-center mt-3">
          <CCol md={6} className="text-center">
            <p className="text-medium-emphasis">
              Already have an account?{' '}
              <Link to="/login">Log In</Link>
            </p>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
