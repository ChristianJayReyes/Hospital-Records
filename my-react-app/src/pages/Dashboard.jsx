import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Dashboard.css'

function Dashboard({ onLogout }) {
  const navigate = useNavigate()
  const records = JSON.parse(localStorage.getItem('medicalRecords') || '[]')
  const [phTime, setPhTime] = useState('')
  const [activeTab, setActiveTab] = useState('Dashboard')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const phTimeString = now.toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      setPhTime(phTimeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const recentRecords = records
    .sort((a, b) => {
      const dateA = new Date(a.recordDate || a.dateAdded)
      const dateB = new Date(b.recordDate || b.dateAdded)
      return dateB - dateA
    })
    .slice(0, 5)

  const todayRecords = records.filter(r => {
    const recordDate = new Date(r.recordDate || r.dateAdded)
    const today = new Date()
    return recordDate.toDateString() === today.toDateString()
  })

  const thisWeekRecords = records.filter(r => {
    const recordDate = new Date(r.recordDate || r.dateAdded)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return recordDate >= weekAgo
  })

  const thisMonthRecords = records.filter(r => {
    const recordDate = new Date(r.recordDate || r.dateAdded)
    const currentMonth = new Date().getMonth()
    return recordDate.getMonth() === currentMonth
  })

  // Calculate records by category/type
  const recordsByCategory = records.reduce((acc, record) => {
    const category = record.diagnosis ? 'Diagnosis' : record.treatment ? 'Treatment' : 'General'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  // Monthly records data for chart
  const monthlyData = []
  for (let i = 4; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthRecords = records.filter(r => {
      const recordDate = new Date(r.recordDate || r.dateAdded)
      return recordDate.getMonth() === date.getMonth() && 
             recordDate.getFullYear() === date.getFullYear()
    })
    monthlyData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      count: monthRecords.length
    })
  }

  const maxCount = Math.max(...monthlyData.map(d => d.count), 1)

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <div className="logo-icon">DR</div>
            <span className="logo-text">Dimaano Records</span>
          </div>
        </div>
        <div className="nav-center">
          <button 
            className={`nav-tab ${activeTab === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('Dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'Statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('Statistics')}
          >
            Statistics
          </button>
          <button 
            className={`nav-tab ${activeTab === 'Transactions' ? 'active' : ''}`}
            onClick={() => navigate('/records')}
          >
            Records
          </button>
          <button 
            className={`nav-tab ${activeTab === 'My wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('My wallet')}
          >
            Profile
          </button>
        </div>
        <div className="nav-right">
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>
          <div className="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div className="user-avatar" onClick={handleLogout}>
            <div className="avatar-circle">LP</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-left">
          {/* Total Records Widget */}
          <div className="widget total-balance">
            <div className="widget-label">Total Records</div>
            <div className="widget-amount">{records.length.toLocaleString()}</div>
            <div className="widget-subtitle">+{thisWeekRecords.length} records this week</div>
            <div className="widget-actions">
              <button className="btn-dark" onClick={() => navigate('/records?action=add')}>
                Add Record
              </button>
              <button className="btn-light" onClick={() => navigate('/records')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                View All
              </button>
            </div>
          </div>

          {/* Today & This Week Widgets */}
          <div className="widget-group">
            <div className="widget small-widget income-widget">
              <div className="widget-label">Today</div>
              <div className="widget-amount positive">+{todayRecords.length}</div>
              <div className="widget-subtitle">Records added today</div>
              <div className="widget-badge positive">+{todayRecords.length > 0 ? '100%' : '0%'}</div>
            </div>
            <div className="widget small-widget expense-widget">
              <div className="widget-label">This Week</div>
              <div className="widget-amount negative">-{thisWeekRecords.length}</div>
              <div className="widget-subtitle">Records this week</div>
              <div className="widget-badge negative">-{Math.round((thisWeekRecords.length / records.length) * 100) || 0}%</div>
            </div>
          </div>

          {/* Records Flow Widget */}
          <div className="widget chart-widget">
            <div className="widget-header">
              <div className="widget-title">Records Flow</div>
              <div className="widget-selector">
                <span>Monthly</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            <div className="chart-container">
              <div className="bar-chart">
                {monthlyData.map((data, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${(data.count / maxCount) * 100}%` }}>
                      <div className="chart-bar-value">
                        {data.count > 0 ? `+${data.count}` : data.count}
                      </div>
                    </div>
                    <div className="chart-label">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Records Split Widget */}
          <div className="widget chart-widget">
            <div className="widget-header">
              <div className="widget-title">Records Split</div>
              <div className="widget-selector">
                <span>Aug</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            <div className="donut-chart-container">
              <div className="donut-chart">
                <div className="donut-center">
                  <div className="donut-total">Total {records.length}</div>
                </div>
              </div>
              <div className="donut-legend">
                {Object.entries(recordsByCategory).map(([category, count], index) => {
                  const percentage = Math.round((count / records.length) * 100) || 0
                  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b']
                  return (
                    <div key={category} className="legend-item">
                      <div className="legend-color" style={{ backgroundColor: colors[index % colors.length] }}></div>
                      <span className="legend-label">{category}</span>
                      <span className="legend-value">| {percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recent Records Widget */}
          <div className="widget list-widget">
            <div className="widget-header">
              <div className="widget-title">Recent Records {records.length}</div>
              <button className="btn-link" onClick={() => navigate('/records')}>See All</button>
            </div>
            <div className="records-list">
              {recentRecords.length > 0 ? (
                recentRecords.map((record) => (
                  <div key={record.id} className="record-item">
                    <div className="record-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                    <div className="record-info">
                      <div className="record-status success">Active</div>
                      <div className="record-date">
                        {new Date(record.recordDate || record.dateAdded).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="record-id">****{record.id.slice(-4)}</div>
                      <div className="record-amount">-{record.title || 'Record'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-records">No records yet</div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          {/* My Records Widget */}
          <div className="widget card-widget">
            <div className="widget-header">
              <div className="widget-title">My Records {records.length}</div>
              <button className="btn-add" onClick={() => navigate('/records?action=add')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add
              </button>
            </div>
            <div className="cards-stack">
              {records.slice(0, 3).map((record, index) => (
                <div key={record.id} className="record-card" style={{ zIndex: 3 - index, transform: `translateY(${index * 20}px)` }}>
                  <div className="card-header">
                    <div className="card-type">{record.doctor || 'Medical'}</div>
                    <div className="card-number">****{record.id.slice(-4)}</div>
                  </div>
                  <div className="card-details">
                    <div className="card-name">{record.title || 'Record'}</div>
                    <div className="card-date">{new Date(record.recordDate || record.dateAdded).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Widget */}
          <div className="widget subscriptions-widget">
            <div className="widget-header">
              <div className="widget-title">Categories {Object.keys(recordsByCategory).length}</div>
              <button className="btn-link">
                Manage
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
            <div className="category-icons">
              {Object.keys(recordsByCategory).slice(0, 5).map((category, index) => {
                const icons = ['🏥', '💊', '🩺', '📋', '🔬']
                return (
                  <div key={category} className="category-icon">
                    {icons[index] || '📄'}
                  </div>
                )
              })}
            </div>
            <div className="subscriptions-list">
              {Object.entries(recordsByCategory).slice(0, 4).map(([category, count]) => (
                <div key={category} className="subscription-item">
                  <div className="subscription-icon">📄</div>
                  <div className="subscription-info">
                    <div className="subscription-name">{category}</div>
                    <div className="subscription-date">{count} records</div>
                  </div>
                  <div className="subscription-amount">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
