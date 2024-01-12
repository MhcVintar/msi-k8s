import './LandingPage.css';
import LoginPopup from '../components/popups/LoginPopup.tsx';
import SignupPopup from "../components/popups/SignupPopup.tsx";
import ResetPasswordPopup from '../components/popups/ResetPasswordPopup.tsx';
import NewPasswordPopup from '../components/popups/NewPasswordPopup.tsx'
import { usePopup } from '../components/context/Popup.tsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const [popupState, setPopupState] = usePopup();
    const [sessionActive, setSessionActive] = useState(false);
    const navigate = useNavigate();

    // check whether session is valid or not
    useEffect(() => {
        async function checkIsSessionValid() {
          try {
            const res = await fetch(`/auth/check-session`, {
              method: 'GET',
              credentials: 'include', // include session
            });

            //const responseData = await res.json();

            if (res.ok) {
              setSessionActive(true);
            } else {
              setSessionActive(false);
            }
          } catch (error) {
            console.error('Error checking session:', error);
          }
        }
        checkIsSessionValid();
      }, []);

    return (
        <div className="container">
            <div className="navbar">
                <a href="/">
                    <div className="logo-container">
                        <h1>MUSIFY</h1>
                    </div>
                </a>
                <div className="login-btns-container">
                    {!sessionActive && 
                    <button 
                    className="login-btn" 
                    onClick={() => {setPopupState('login');
                    }}>Log in</button>}

                    {!sessionActive && 
                    <button 
                    className="signup-btn" 
                    onClick={() => {
                        setPopupState('register');
                    }}>Sign up</button>}

                    {sessionActive &&
                    <button
                    className="dashboard-btn"
                    onClick={() => {
                        navigate("/my-music");
                    }}>My dashboard</button>}
                </div>
            </div>
            <div className="content-container">
                <div className="content">
                    <h1>Discover, Share, Enjoy <br />Your Source for Music</h1>
                    {!sessionActive && 
                    <button 
                    className="get-started-btn" 
                    onClick={() => {
                        setPopupState('register');
                    }}>Get started</button>}
                </div>
            </div>
            {popupState === 'login' && <LoginPopup />}
            {popupState === 'register' && <SignupPopup />}
            {popupState === 'reset-password' && <ResetPasswordPopup />}
            {popupState === 'new-password' && <NewPasswordPopup />}
        </div>
    )
}

export default LandingPage;