import './DeleteAccountPopup.css';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopup } from '../context/Popup';

function DeleteAccountPopup() {
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

  async function handleDeleteAccount() {
    try {
      const response = await fetch(`/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        navigate('/');
      } else {
        console.log("Unable to delete account");
      }
    } catch (error) {
      console.error('API fetch error:', error);
    }
}

  return (
    <div className="background-overlay">
      <div className="delete-account-container" ref={popupReference}>
        <div className="delete-accout-content">
            <div className="close-btn-container">
                <div className="close" onClick={() => {setPopupState('hidden')}}>&times;</div>
            </div>
          <h1 className="title">Delete account</h1>
          <p className='delete-txt'>Are you sure you want to delete your account?</p>
          <button className='delete-account-btn' onClick={handleDeleteAccount}>Delete account</button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountPopup;
