import { usePopup } from "../context/Popup";
import "./SignupPopup.css";
import { useState, useRef, useEffect } from "react";

function SignupPopup() {
  const [createPassword, setCreatePassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const passwordsMatch = createPassword === repeatPassword;
  const [serverResponse, setServerResponse] = useState("");
  const [, setPopupState] = usePopup();

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

  async function handleRegisterSubmit(event: any) {
    event.preventDefault(); // prevent refresh
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch(`/auth/register`, {
        method: 'POST',
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
      <div className="signup-container" ref={popupReference}>
        <div className="signup-content">
          <div className="close-btn-container">
            <div className="close" onClick={ () => {setPopupState('hidden')}}>
              &times;
            </div>
          </div>
          <h1 className="title">Sign up</h1>
          <div className="signup-form-container">
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-container">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-container">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" minLength={4} required />
              </div>
              <div className="form-container">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" minLength={8} value={createPassword} onChange={handleCreatePasswordChange} required />
              </div>
              <div className="form-container">
                <label htmlFor="password">Repeat password:</label>
                <input type="password" id="repeatPassword" name="repeatPassword" value={repeatPassword} onChange={handleRepeatPasswordChange} required />
              </div>
              {!passwordsMatch && <p style={{ color: 'red' }}>Passwords do not match!</p>}
              {serverResponse && <p style={{ color: 'black' }}>{serverResponse}</p>}
              <button
                type="submit"
                className="signup-btn-popup"
                disabled={!passwordsMatch}
              >
                Sign up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPopup;
