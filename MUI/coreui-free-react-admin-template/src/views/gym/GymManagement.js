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
  CFormTextarea,
} from '@coreui/react'

const GymManagement = () => {
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    exercise_title: '',
    exercise_notes: ''
  })
  const [records, setRecords] = useState([])
  const [alert, setAlert] = useState(null)

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:5000/user/gym', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching gym records:', error)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://127.0.0.1:5000/user/gym', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setAlert({ type: 'success', message: 'Gym record saved successfully!' })
        setFormData({
          start_time: '',
          end_time: '',
          exercise_title: '',
          exercise_notes: ''
        })
        fetchRecords()
      } else {
        const error = await response.json()
        setAlert({ type: 'danger', message: error.error || 'Failed to save record' })
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error saving gym record' })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
            <h4>Gym Management</h4>
            {alert && (
              <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}>
                {alert.message}
              </CAlert>
            )}
            <CForm onSubmit={handleSubmit} className="mb-4">
              <CRow className="mb-3">
                <CCol xs={12} md={6}>
                  <CFormInput
                    type="datetime-local"
                    label="Start Time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </CCol>
                <CCol xs={12} md={6}>
                  <CFormInput
                    type="datetime-local"
                    label="End Time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormInput
                    type="text"
                    label="Exercise Title"
                    value={formData.exercise_title}
                    onChange={(e) => setFormData({...formData, exercise_title: e.target.value})}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol xs={12}>
                  <CFormTextarea
                    label="Notes"
                    value={formData.exercise_notes}
                    onChange={(e) => setFormData({...formData, exercise_notes: e.target.value})}
                    rows={3}
                  />
                </CCol>
              </CRow>
              <CButton type="submit" color="primary">
                Save Workout Record
              </CButton>
            </CForm>

            <CTable>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Exercise</CTableHeaderCell>
                  <CTableHeaderCell>Duration</CTableHeaderCell>
                  <CTableHeaderCell>Notes</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {records.map((record, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      {new Date(record.start_time).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell>{record.exercise_title}</CTableDataCell>
                    <CTableDataCell>
                      {((new Date(record.end_time) - new Date(record.start_time)) / 3600000).toFixed(1)} hours
                    </CTableDataCell>
                    <CTableDataCell>{record.exercise_notes}</CTableDataCell>
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

export default GymManagement
