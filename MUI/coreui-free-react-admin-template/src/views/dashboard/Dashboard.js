import React, { useState, useEffect } from 'react'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCol,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import AreaChart from './AreaChart'

const Dashboard = () => {
  const [habiticaData, setHabiticaData] = useState({ 
    daily: { Keys: [], Values: [], Dates: [] },
    habit: { Keys: [], Values: [], Dates: [] }
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('Month')  // 'Day', 'Month', 'Year'

  const fetchHabiticaData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [dailyResponse, habitResponse] = await Promise.all([
        fetch(`http://127.0.0.1:5000/user/habitica/daily?time_range=${timeRange.toLowerCase()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`http://127.0.0.1:5000/user/habitica/habit?time_range=${timeRange.toLowerCase()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (dailyResponse.ok && habitResponse.ok) {
        const dailyData = await dailyResponse.json()
        const habitData = await habitResponse.json()
        setHabiticaData({
          daily: dailyData,
          habit: habitData
        })
      }
    } catch (error) {
      console.error('Error fetching Habitica data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHabiticaData()
  }, [timeRange])

  const getChartData = (type) => {
    const data = habiticaData[type]
    if (!data || !data.Keys.length) return null

    const uniqueTasks = [...new Set(data.Keys)]
    return {
      series: uniqueTasks.map(task => ({
        name: task,
        data: data.Keys.map((key, index) => 
          key === task ? data.Values[index] : null
        ).filter(val => val !== null)
      })),
      xAxisData: data.Dates
    }
  }

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Habitica Analytics
              </h4>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === timeRange}
                    onClick={() => setTimeRange(value)}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <h5 className="mt-4">Daily Tasks</h5>
              <AreaChart {...getChartData('daily')} />
              
              <h5 className="mt-4">Habits</h5>
              <AreaChart {...getChartData('habit')} />
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard
