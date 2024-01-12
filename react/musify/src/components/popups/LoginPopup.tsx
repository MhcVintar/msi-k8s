import './LoginPopup.css';
import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopup } from '../context/Popup';

function LoginPopup() {
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

  const navigate = useNavigate();

  async function handleLoginSubmit (event: any) {
    event.preventDefault(); // prevent refresh
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch(`/auth/login`, {
        method: 'POST',
        credentials: "include",
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

  function openResetPwdPopup() {
    setPopupState('reset-password');
  }

  return (
    <div className="background-overlay">
      <div className="login-container" ref={popupReference}>
        <div className="login-content">
            <div className="close-btn-container">
            <div className="close" onClick={() => {setPopupState('hidden')}}>&times;</div>
            </div>
          <h1 className="title">Log in</h1>
          <div className="login-form-container">
            <form onSubmit={handleLoginSubmit}>
                <div className="form-container">
                    <label htmlFor="email">Email or username:</label>
                    <input type="text" id="email-or-username" name="emailOrUsername" required />
                </div>
                <div className="form-container">
                     <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <a onClick={openResetPwdPopup} className='forgot-pwd-link'>Forgot password?</a>
                {serverResponse && <p style={{ color: 'black' }}>{serverResponse}</p>}
              <button type="submit" className="login-btn-popup">Log in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPopup;
