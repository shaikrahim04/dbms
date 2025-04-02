import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'

const ApiManagement = () => {
  const [apis, setApis] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentApi, setCurrentApi] = useState({ type: 'habitica', api_id: '', api_key: '' })
  const [deleteModal, setDeleteModal] = useState(false)
  const [apiToDelete, setApiToDelete] = useState(null)

  const fetchApis = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/api', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setApis(data)
      }
    } catch (error) {
      console.error('Error fetching APIs:', error)
    }
  }

  useEffect(() => {
    fetchApis()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editMode ? 'PUT' : 'POST'
      const response = await fetch('http://localhost:5000/user/api', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(currentApi)
      })
      if (response.ok) {
        setShowModal(false)
        fetchApis()
        setCurrentApi({ type: 'habitica', api_id: '', api_key: '' })
      }
    } catch (error) {
      console.error('Error submitting API:', error)
    }
  }

  const confirmDelete = (api) => {
    setApiToDelete(api)
    setDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch('http://localhost:5000/user/api', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id: apiToDelete.id })
      })
      if (response.ok) {
        fetchApis()
        setDeleteModal(false)
        setApiToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting API:', error)
    }
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>API Management</strong>
              <CButton 
                color="primary" 
                onClick={() => {
                  setEditMode(false)
                  setShowModal(true)
                }} 
                className="float-end"
              >
                Add New API
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Type</CTableHeaderCell>
                    <CTableHeaderCell>API ID</CTableHeaderCell>
                    <CTableHeaderCell>API Key</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {apis.map((api) => (
                    <CTableRow key={api.id}>
                      <CTableDataCell>{api.type}</CTableDataCell>
                      <CTableDataCell>{api.api_id}</CTableDataCell>
                      <CTableDataCell>{api.api_key}</CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color="info" 
                          size="sm" 
                          className="me-2"
                          onClick={() => {
                            setCurrentApi(api)
                            setEditMode(true)
                            setShowModal(true)
                          }}
                        >
                          Edit
                        </CButton>
                        <CButton 
                          color="danger" 
                          size="sm"
                          onClick={() => confirmDelete(api)}
                        >
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>{editMode ? 'Edit API' : 'Add New API'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CFormSelect 
              className="mb-3"
              value={currentApi.type}
              onChange={(e) => setCurrentApi({...currentApi, type: e.target.value})}
            >
              <option value="habitica">Habitica</option>
            </CFormSelect>
            <CFormInput
              className="mb-3"
              placeholder="API ID"
              value={currentApi.api_id}
              onChange={(e) => setCurrentApi({...currentApi, api_id: e.target.value})}
            />
            <CFormInput
              className="mb-3"
              placeholder="API Key"
              value={currentApi.api_key}
              onChange={(e) => setCurrentApi({...currentApi, api_key: e.target.value})}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSubmit}>
            {editMode ? 'Update' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete this API configuration?
          {apiToDelete && (
            <div className="mt-3">
              <p><strong>Type:</strong> {apiToDelete.type}</p>
              <p><strong>API ID:</strong> {apiToDelete.api_id}</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ApiManagement
