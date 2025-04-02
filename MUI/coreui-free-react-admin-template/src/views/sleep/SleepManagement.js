import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
} from '@coreui/react'

const SleepManagement = () => {
  const [hours, setHours] = useState('')
  const [date, setDate] = useState('')
  const [records, setRecords] = useState([])
  const [alert, setAlert] = useState(null)

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:5000/user/sleep', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching sleep records:', error)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:5000/user/sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hours: parseInt(hours), date })
      })

      if (response.ok) {
        setAlert({ type: 'success', message: 'Sleep record saved successfully!' })
        setHours('')
        setDate('')
        fetchRecords()
      } else {
        const error = await response.json()
        setAlert({ type: 'danger', message: error.error || 'Failed to save record' })
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error saving sleep record' })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
            <h4>Sleep Management</h4>
            {alert && (
              <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </CAlert>
            )}
            <CForm onSubmit={handleSubmit} className="mb-4">
              <CRow className="align-items-center">
                <CCol xs={12} md={4}>
                  <CFormInput
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </CCol>
                <CCol xs={12} md={4}>
                  <CFormInput
                    type="number"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Sleep Hours"
                    min="0"
                    max="24"
                    required
                  />
                </CCol>
                <CCol xs={12} md={4}>
                  <CButton type="submit" color="primary">
                    Save Sleep Record
                  </CButton>
                </CCol>
              </CRow>
            </CForm>

            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Hours</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {records.map((record, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{record.date}</CTableDataCell>
                    <CTableDataCell>{record.hours}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default SleepManagement
