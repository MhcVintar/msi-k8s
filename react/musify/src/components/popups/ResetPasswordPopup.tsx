import './ResetPasswordPopup.css';
import { useRef, useEffect, useState } from 'react';
import { usePopup } from '../context/Popup';

function ResetPasswordPopup() {
  const [serverResponse, setServerResponse] = useState("");
  const [, setPopupState] = usePopup();
  
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

  async function handleResetPwd (event: any) {
    event.preventDefault(); // prevent refresh
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await fetch(`/auth/request-password-reset`, {
        method: 'POST',
        credentials: "include",
        headers: {'Content-Type': 'Application/json'},
        body: JSON.stringify(data)
      });
  
      const responseData = await res.json();
  
      if (res.ok) {
        setServerResponse(responseData.message);
      } else {
        setServerResponse(responseData.error);
      }
    } catch (error) {
      console.error("API fetch error:", error);
    }
  }

  return (
    <div className="background-overlay">
      <div className="reset-pwd-container" ref={popupReference}>
        <div className="reset-pwd-content">
            <div className="close-btn-container">
            <div className="close" onClick={() => {setPopupState('hidden')}}>&times;</div>
            </div>
          <h1 className="title">Reset password</h1>
          <div className="reset-pwd-form-container">
            <form onSubmit={handleResetPwd}>
                <div className="form-container">
                    <p>You will receive a password reset link</p>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                {serverResponse && <p style={{ color: 'black' }}>{serverResponse}</p>}
              <button type="submit" className="reset-pwd-btn">Confirm</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPopup;
