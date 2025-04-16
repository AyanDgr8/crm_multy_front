// src/components/routes/Forms/CreateForm/CreateForm.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateForm.css";

const CreateForm = () => {
  const { phone_no_primary } = useParams();
  const [formDataa, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    phone_no_primary: '',
    phone_no_secondary: '',
    whatsapp_num: '',
    email_id: '',
    date_of_birth: '',
    gender: '',
    address: '',
    country: '',
    company_name: '',
    designation: '',
    website: '',
    other_location: '',
    contact_type: '',
    source: '',
    disposition: '',
    agent_name: '',
    comment: '',
    scheduled_at: ''
  });

  const [formSuccess, setFormSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Set agent name in form data
        setFormData(prev => ({
          ...prev,
          agent_name: response.data.name
        }));

      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle scheduled_at click
  const handleScheduledAtClick = () => {
    // Optional: Add any special handling for the datetime-local input
    console.log('Scheduling a call');
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const requiredFields = [
      "first_name", "middle_name", "last_name",
      "phone_no_primary", "phone_no_secondary", "whatsapp_num",
      "email_id", "date_of_birth", "gender", "address",
      "country", "company_name", "designation", "website",
      "other_location", "contact_type", "source",
      "disposition", "agent_name", "comment", "scheduled_at"
    ];

    for (let field of requiredFields) {
      if (!formDataa[field] || formDataa[field].trim() === "") {
        setError(`Please fill out the "${field.replace(/_/g, ' ').toUpperCase()}" field.`);
        return false;
      }
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e, action = 'prompt') => {
    e.preventDefault();
    setError('');

    // First validate required fields
    if (!validateRequiredFields()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL;

      const response = await axios.post(
        `${apiUrl}/customers/new`, 
        { ...formDataa, duplicateAction: action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (response.data.success) {
        console.log(response.data);
        setFormSuccess(true);
        alert("Record added successfully!");
        setFormData({
          first_name: '',
          middle_name: '',
          last_name: '',
          phone_no_primary: '',
          phone_no_secondary: '',
          whatsapp_num: '',
          email_id: '',
          date_of_birth: '',
          gender: '',
          address: '',
          country: '',
          company_name: '',
          designation: '',
          website: '',
          other_location: '',
          contact_type: '',
          source: '',
          disposition: '',
          agent_name: formDataa.agent_name, // Preserving agent name
          comment: '',
          scheduled_at: ''
        });
        navigate('/customers');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        // Handle duplicate record
        setDuplicateInfo(error.response.data);
        setShowDuplicateDialog(true);
      } else {
        console.error('Error adding record:', error);
        setError(error.response?.data?.message || 'Error adding record. Please try again.');
      }
    }
  };

  const handleDuplicateAction = (action) => {
    // Validate required fields again before proceeding with the action
    if (!validateRequiredFields()) {
      return;
    }

    setShowDuplicateDialog(false);
    handleSubmit({ preventDefault: () => {} }, action);
  };

  return (
    <div>
      <h2 className="create_form_headiii">New Record</h2>
      <div className="create-form-container">
        {error && <div className="error-messagee">{error}</div>}
        
        {showDuplicateDialog && duplicateInfo && (
          <div className="duplicate-dialog">
            <h3>Duplicate Record Found</h3>
            <p>
              {duplicateInfo.phone_no_primary_exists 
                ? "Phone number already exists" 
                : "CRN already exists"}
            </p>
            
            <div className="existing-record">
              <h4>Existing Record:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Company</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{duplicateInfo.existing_record.first_name}</td>
                    <td>{duplicateInfo.existing_record.phone_no_primary}</td>
                    <td>{duplicateInfo.existing_record.company_name}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="duplicate-actionss">
              <h4>Choose Action:</h4>
              <div className="action-containerr">
                <select 
                  value={duplicateAction}
                  onChange={(e) => setDuplicateAction(e.target.value)}
                  className="duplicate-action-selectt"
                >
                  <option value="skip">Do Not Upload Duplicate</option>
                  <option value="append">Append with suffix (__1, __2, etc.)</option>
                  <option value="replace">Replace existing record</option>
                </select>
                <div className="button-group">
                  <button 
                    onClick={() => handleDuplicateAction(duplicateAction)}
                    className="action-buttonnn-continue"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'prompt')} className="create-form">
          {[
            { 
              label: "First Name", name: "first_name",required: true 
            },
            { 
              label: "Middle Name", name: "middle_name" 
            },
            { 
              label: "Last Name", name: "last_name"
            },
            { 
              label: "Phone", name: "phone_no_primary", required: true,
              type: "tel", maxLength: "12"
            },
            { 
              label: "Alternate Phone", name: "phone_no_secondary", 
              type: "tel", maxLength: "12"
            },
            { 
              label: "Whatsapp", name: "whatsapp_num", 
              type: "tel", maxLength: "12"
            },
            { 
              label: "Email" , name: "email", required: true ,
              type: "email"
            },
            { 
              label: "Date of Birth", name: "date_of_birth", 
              type: "date"
            },
            { 
              label: "Address", name: "address"
            },
            { 
              label: "Country", name: "country"
            },
            { 
              label: "Company Name", name: "company_name"
            },
            { 
              label: "Designation", name: "designation"
            },
            { 
              label: "Website", name: "website"
            },
            { 
              label: "Other Location", name: "other_location"
            },
            { 
              label: "Contact Type", name: "contact_type"
            },
            { 
              label: "Source", name: "source"
            },
          ].map(({ label, name, type = "text", maxLength, required }) => (
            <div key={name} className="label-input">
              <label>{label}{required && <span className="required"> *</span>}:</label>
              <input
                type={type}
                name={name}
                value={formDataa[name] || ''}
                onChange={handleInputChange}
                maxLength={maxLength}
              />
            </div>
          ))}

          {/* Agent Name Field */}
          {/* <div className="label-input">
              <label>Agent Name:</label>
              <input
                  type="text"
                  name="agent_name"
                  value={formData.agent_name || ''}
                  disabled
                  className="agent-input"
              />
          </div> */}

          {/* calling_code Dropdown */}
          <div className="label-input">
              <label>Gender:</label>
              <select name="gender" value={formDataa.gender} onChange={handleInputChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
              </select>
          </div>


          {/* Schedule Call  */}
          <div className="label-input">
              <label>Schedule Call:</label>
              <input
                  type="datetime-local"
                  name="scheduled_at"
                  value={formDataa.scheduled_at || ''}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={handleScheduledAtClick}
                  style={{ cursor: 'pointer' }}
                  className="sche_input"
              />
          </div>

          {/* Comment Section */}
          <div className="label-input comment">
              <label>Comment:</label>
              <div className="textarea-container">
                  <textarea
                      name="comment"
                      value={formDataa.comment || ''}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Enter any additional comment"
                      className="comet"
                  />
              </div>
          </div>

          <button type="submit" className="submit-btn submmit-button">
            Add Customer
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateForm;
