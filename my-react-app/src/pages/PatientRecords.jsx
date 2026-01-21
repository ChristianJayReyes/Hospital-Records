import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import './PatientRecords.css'

function PatientRecords() {
  const [records, setRecords] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: '',
    recordDate: '',
    doctor: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    imageUrl: '',
  })

  useEffect(() => {
    loadRecords()
    const search = searchParams.get('search')
    if (search) {
      setSearchTerm(search)
    }
    if (searchParams.get('action') === 'add') {
      setShowForm(true)
    }
  }, [searchParams])

  const loadRecords = () => {
    const stored = localStorage.getItem('medicalRecords')
    if (stored) {
      setRecords(JSON.parse(stored))
    }
  }

  const saveRecords = (updatedRecords) => {
    localStorage.setItem('medicalRecords', JSON.stringify(updatedRecords))
    setRecords(updatedRecords)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploading(true)
      // Convert image to base64 for storage
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageUrl: reader.result,
        })
        setUploading(false)
      }
      reader.onerror = () => {
        alert('Error reading file')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingRecord) {
      // Update existing record
      const updated = records.map((r) =>
        r.id === editingRecord.id
          ? { ...r, ...formData, recordDate: formData.recordDate || new Date().toISOString().split('T')[0] }
          : r
      )
      saveRecords(updated)
    } else {
      // Add new record
      const newRecord = {
        id: Date.now().toString(),
        ...formData,
        dateAdded: new Date().toISOString().split('T')[0],
        recordDate: formData.recordDate || new Date().toISOString().split('T')[0],
      }
      saveRecords([...records, newRecord])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      recordDate: '',
      doctor: '',
      diagnosis: '',
      treatment: '',
      medications: '',
      notes: '',
      imageUrl: '',
    })
    setEditingRecord(null)
    setShowForm(false)
    navigate('/records')
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      title: record.title || '',
      recordDate: record.recordDate || '',
      doctor: record.doctor || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      medications: record.medications || '',
      notes: record.notes || '',
      imageUrl: record.imageUrl || '',
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updated = records.filter((r) => r.id !== id)
      saveRecords(updated)
    }
  }

  const filteredRecords = records.filter((record) =>
    (record.title && record.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.doctor && record.doctor.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="patients-container">
      <header className="patients-header">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        <h1>My Medical Records</h1>
        <button onClick={() => setShowForm(!showForm)} className="add-button">
          {showForm ? 'Cancel' : '+ Add New Record'}
        </button>
      </header>

      {showForm && (
        <div className="form-overlay">
          <div className="form-card">
            <h2>{editingRecord ? 'Edit Record' : 'Add New Medical Record'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Record Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Annual Checkup, Lab Results, X-Ray Report"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Record Date *</label>
                  <input
                    type="date"
                    name="recordDate"
                    value={formData.recordDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Doctor/Clinic Name</label>
                  <input
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    placeholder="Dr. Name or Clinic"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Upload Record Photo *</label>
                <div className="image-upload-area">
                  {formData.imageUrl ? (
                    <div className="image-preview-container">
                      <img src={formData.imageUrl} alt="Preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="remove-image-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        required={!editingRecord}
                      />
                      <div className="upload-box">
                        {uploading ? (
                          <div className="uploading">Uploading...</div>
                        ) : (
                          <>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <p>Click to upload or drag and drop</p>
                            <p className="upload-hint">Upload photo of your medical record</p>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Medical diagnosis or condition"
                />
              </div>

              <div className="form-group">
                <label>Treatment</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Treatment received or prescribed"
                />
              </div>

              <div className="form-group">
                <label>Medications</label>
                <textarea
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Medications prescribed"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional notes or information"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button" disabled={uploading}>
                  {editingRecord ? 'Update Record' : 'Add Record'}
                </button>
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, doctor, diagnosis, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="patients-grid">
        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <p>
              {records.length === 0
                ? "No records yet. Upload your first medical record photo!"
                : "No records found. Try a different search term."}
            </p>
          </div>
        ) : (
          filteredRecords
            .sort((a, b) => {
              const dateA = new Date(a.recordDate || a.dateAdded)
              const dateB = new Date(b.recordDate || b.dateAdded)
              return dateB - dateA
            })
            .map((record) => (
              <div key={record.id} className="patient-record-card">
                {record.imageUrl && (
                  <div className="record-image-container">
                    <img src={record.imageUrl} alt="Medical record" className="record-image" />
                  </div>
                )}
                <div className="patient-header">
                  <h3>{record.title || 'Medical Record'}</h3>
                  <div className="patient-actions">
                    <button onClick={() => handleEdit(record)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="patient-info">
                  {record.recordDate && (
                    <p><strong>Date:</strong> {new Date(record.recordDate).toLocaleDateString()}</p>
                  )}
                  {record.doctor && <p><strong>Doctor:</strong> {record.doctor}</p>}
                  {record.diagnosis && (
                    <div className="info-section">
                      <strong>Diagnosis:</strong>
                      <p>{record.diagnosis}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div className="info-section">
                      <strong>Treatment:</strong>
                      <p>{record.treatment}</p>
                    </div>
                  )}
                  {record.medications && (
                    <div className="info-section">
                      <strong>Medications:</strong>
                      <p>{record.medications}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div className="info-section">
                      <strong>Notes:</strong>
                      <p>{record.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}

export default PatientRecords
