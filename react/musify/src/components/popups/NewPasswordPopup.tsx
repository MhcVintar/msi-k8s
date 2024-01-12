import './NewPasswordPopup.css';
import { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePopup } from '../context/Popup';

function NewPasswordPopup() {
  const [serverResponse, setServerResponse] = useState("");
  const [, setPopupState] = usePopup();
  const [createPassword, setCreatePassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const passwordsMatch = createPassword === repeatPassword;
  const location = useLocation();
  const navigate = useNavigate();

  const handleCreatePasswordChange = (event : any) => {
    setCreatePassword(event.target.value);
  }

  const handleRepeatPasswordChange = (event : any) => {
    setRepeatPassword(event.target.value);
  }
  
  const popupReference = useRef<HTMLDivElement>(null); // reference to popup div

  useEffect(() => {
    const handleClickOutside = (event : any) => {
      if (popupReference.current && !popupReference.current.contains(event.target)) {
        setPopupState('hidden');
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  async function handleNewPassword (event: any) {
    event.preventDefault(); // prevent refresh
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const formData = new FormData(event.target);
    const password = formData.get('password');

    const data = {
        token: token,
        password: password
    };

    try {
      const res = await fetch(`/auth/reset-password`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'Application/json'},
        body: JSON.stringify(data)
      });
  
      const responseData = await res.json();
      if (res.ok) {
        setServerResponse(responseData.message);
        navigate('/my-music');
      } else {
        setServerResponse(responseData.error);
      }
  
    } catch (error) {
      console.error("API fetch error:", error);
    }
  }

  return (
    <div className="background-overlay">
      <div className="new-pwd-container" ref={popupReference}>
        <div className="new-pwd-content">
            <div className="close-btn-container">
            <div className="close" onClick={() => {setPopupState('hidden')}}>&times;</div>
            </div>
          <h1 className="title">New password</h1>
          <div className="new-pwd-form-container">
            <form onSubmit={handleNewPassword}>
                <div className="form-container">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" value={createPassword} onChange={handleCreatePasswordChange} required />
                </div>
                <div className="form-container">
                    <label htmlFor="password">Repeat password:</label>
                    <input type="password" id="repeatPassword" name="repeatPassword" value={repeatPassword} onChange={handleRepeatPasswordChange} required />
                </div>
                {!passwordsMatch && <p style={{ color: 'red' }}>Passwords do not match!</p>}
                {serverResponse && <p style={{ color: 'black' }}>{serverResponse}</p>}
                <button type="submit" className="new-pwd-btn">Confirm</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewPasswordPopup;
