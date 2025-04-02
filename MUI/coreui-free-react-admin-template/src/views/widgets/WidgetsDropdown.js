import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CSpinner,
  CCard,
  CCardBody,
  CCardTitle,
  CPlaceholder,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilOptions } from '@coreui/icons'

const WidgetsDropdown = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dailyData, setDailyData] = useState({ Keys: [], Values: [] })
  const [habitData, setHabitData] = useState({ Keys: [], Values: [] })
  const [sleepData, setSleepData] = useState({ dates: [], hours: [] })
  const [gymData, setGymData] = useState({ dates: [], hours: [] })

  const fetchApi = async() => {
    try {
      const token = localStorage.getItem('token')
      const [dailyResponse, habitResponse] = await Promise.all([
        fetch('http://127.0.0.1:5000/user/habitica/daily?time_range=day', {  
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch('http://127.0.0.1:5000/user/habitica/habit?time_range=day', {  
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      // Log data samples after each successful fetch
      if (dailyResponse.ok && habitResponse.ok) {
        const dailyData = await dailyResponse.json();
        const habitData = await habitResponse.json();
        
        console.log('=== Data Samples (Last 7 entries) ===');
        console.log('Daily Data:', {
          dates: dailyData.Keys.slice(-7),
          values: dailyData.Values.slice(-7)
        });
        console.log('Habit Data:', {
          dates: habitData.Keys.slice(-7),
          values: habitData.Values.slice(-7)
        });
        
        setDailyData(dailyData);
        setHabitData(habitData);
      }

      // Handle sleep data separately to prevent Promise.all from failing completely
      try {
        const sleepResponse = await fetch('http://127.0.0.1:5000/user/sleep/week', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (sleepResponse.ok) {
          const sleepData = await sleepResponse.json();
          console.log('Sleep Data:', {
            dates: sleepData.dates.slice(-7),
            hours: sleepData.hours.slice(-7)
          });
          setSleepData(sleepData);
        }
      } catch (sleepError) {
        console.error('Error fetching sleep data:', sleepError);
        // Don't let sleep data error affect other widgets
        setSleepData({ dates: [], hours: [] });
      }

      // Add gym data fetch
      try {
        const gymResponse = await fetch('http://127.0.0.1:5000/user/gym/week', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (gymResponse.ok) {
          const gymData = await gymResponse.json();
          console.log('Gym Data:', {
            dates: gymData.dates.slice(-7),
            hours: gymData.hours.slice(-7)
          });
          setGymData(gymData);
        }
      } catch (gymError) {
        console.error('Error fetching gym data:', gymError);
        setGymData({ dates: [], hours: [] });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  useEffect(()=>{
    fetchApi();
  },[])

  const getChartOptions = (values) => {
    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 100;
    const padding = (maxValue - minValue) * 0.2;

    return {
      plugins: {
        legend: {
          display: false,
        },
      },
      maintainAspectRatio: false,
      scales: {
        x: {
          border: {
            display: false,
          },
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            display: false,
          },
        },
        y: {
          min: minValue - padding,
          max: maxValue + padding,
          display: false,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      },
      elements: {
        line: {
          borderWidth: 1,
        },
        point: {
          radius: 4,
          hitRadius: 10,
          hoverRadius: 4,
        },
      },
    };
  };

  if (loading) return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      {[1, 2, 3, 4].map((index) => (
        <CCol key={index} sm={6} xl={4} xxl={3}>
          <CCard>
            <CCardBody>
              <CPlaceholder as={CCardTitle} animation="glow">
                <CPlaceholder xs={7} />
              </CPlaceholder>
              <CPlaceholder animation="glow" className="mt-3">
                <CPlaceholder xs={9} size="lg"/>
                <CPlaceholder className="mt-2" xs={7} />
              </CPlaceholder>
              <CPlaceholder animation="glow" className="mt-4" style={{ height: '70px' }}>
                <CPlaceholder xs={12} style={{ height: '100%' }}/>
              </CPlaceholder>
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )

  if (error) {
    console.error("Widget Error:", error);  // Debug log
    return <div>Error loading widgets: {error}</div>
  }
  
  const renderSleepWidget = () => {
    const currentSleepHours = sleepData.hours?.[sleepData.hours.length - 1] || 0;
    const change = calculateSleepChange(sleepData.hours);

    return (
      <CWidgetStatsA
        color="primary"
        value={
          <>
            {currentSleepHours}{' hours '}
          </>
        }
        title="Sleep"
        action={
          <CDropdown alignment="end">
            <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
              <CIcon icon={cilOptions} />
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem>Action</CDropdownItem>
              <CDropdownItem>Another action</CDropdownItem>
              <CDropdownItem>Something else here...</CDropdownItem>
              <CDropdownItem disabled>Disabled action</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        }
        chart={
          <CChartLine
            ref={widgetChartRef1}
            className="mt-3 mx-3"
            style={{ height: '70px' }}
            data={{
              labels: sleepData.dates,
              datasets: [
                {
                  label: 'Sleep Hours',
                  backgroundColor: 'transparent',
                  borderColor: 'rgba(255,255,255,.55)',
                  pointBackgroundColor: getStyle('--cui-primary'),
                  data: sleepData.hours,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: false,
                },
              },
              maintainAspectRatio: false,
              scales: {
                x: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                    drawBorder: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
                y: {
                  min: 0,
                  max: 12,
                  display: false,
                  grid: {
                    display: false,
                  },
                  ticks: {
                    display: false,
                  },
                },
              },
              elements: {
                line: {
                  borderWidth: 1,
                  tension: 0.4,
                },
                point: {
                  radius: 4,
                  hitRadius: 10,
                  hoverRadius: 4,
                },
              },
            }}
          />
        }
      />
    );
  };

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6} xl={4} xxl={3}>
        {renderSleepWidget()}
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="info"
          value={
            <>
              {dailyData.Values?.length || 0}{' '}  {/* Added null check */}
              <span className="fs-6 fw-normal">
                Dailies
              </span>
            </>
          }
          title="Habitica"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartLine
              ref={widgetChartRef2}
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: dailyData.Keys,
                datasets: [
                  {
                    label: 'Dailies',
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255,255,255,.55)',
                    pointBackgroundColor: getStyle('--cui-info'),
                    data: dailyData.Values,
                  },
                ],
              }}
              options={getChartOptions(dailyData.Values)}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="warning"
          value={
            <>
              {(gymData.hours[gymData.hours.length - 1] || 0).toFixed(1)}{' hours '}
              <span className="fs-6 fw-normal">
                Today's Workout
              </span>
            </>
          }
          title="Gym Activity"
          chart={
            <CChartLine
              className="mt-3"
              style={{ height: '70px' }}
              data={{
                labels: gymData.dates,
                datasets: [
                  {
                    label: 'Hours',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: gymData.hours,
                    fill: true,
                  },
                ],
              }}
              options={getChartOptions(gymData.hours)}
            />
          }
        />
      </CCol>
      <CCol sm={6} xl={4} xxl={3}>
        <CWidgetStatsA
          color="danger"
          value={
            <>
              {habitData.Values?.length || 0}{' '}  {/* Added null check */}
              <span className="fs-6 fw-normal">
                Habits
              </span>
            </>
          }
          title="Habitica"
          action={
            <CDropdown alignment="end">
              <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                <CIcon icon={cilOptions} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another action</CDropdownItem>
                <CDropdownItem>Something else here...</CDropdownItem>
                <CDropdownItem disabled>Disabled action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          }
          chart={
            <CChartBar
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: habitData.Keys,
                datasets: [
                  {
                    label: 'Habits',
                    backgroundColor: 'rgba(255,255,255,.2)',
                    borderColor: 'rgba(255,255,255,.55)',
                    data: habitData.Values,
                    barPercentage: 0.6,
                  },
                ],
              }}
              options={getChartOptions(habitData.Values)}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

const calculateSleepChange = (hours) => {
  if (!hours || hours.length < 2) return '';
  const latest = hours[hours.length - 1];
  const previous = hours[hours.length - 2];
  if (!latest || !previous || previous === 0) return '';
  
  const change = ((latest - previous) / previous * 100).toFixed(1);
  return `(${Math.abs(change)}% ${change >= 0 ? 
    <CIcon icon={cilArrowTop} /> : 
    <CIcon icon={cilArrowBottom} />})`;
};

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
