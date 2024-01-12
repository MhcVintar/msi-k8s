import './WelcomePage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClimbingBoxLoader } from 'react-spinners';

function WelcomePage() {
    const [loading, setLoading] = useState(true);
    const [serverResponse, setServerResponse] = useState("");
    const [serverResponseOk, setServerResponseOk] = useState(false);
    
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const username = queryParams.get('user');
    const token = queryParams.get('token');

    useEffect(() => {
        const confirmAccount = async () => {
          try {
            const res = await fetch(`/auth/confirm-account?token=${token}`, {
              method: 'GET',
              credentials: 'include',
            });
      
            const responseData = await res.json();
            if (res.ok) {
                setServerResponse(responseData.message);
                console.log("ok");
                setServerResponseOk(true);
            }
            else {
                setServerResponse(responseData.error);
                setServerResponseOk(false);
            }
            setLoading(false);
          } catch (error) {
            setLoading(false);
            setServerResponse('Error validating your account:' + error);
            setServerResponseOk(false);
          }
        };
        confirmAccount();
      }, []);

    return (
        <div className="container">
                <div className="content-welcome-page">
                    <h1>Hello <span className='username-span'>{username}</span>! <br /><br /> We are confirming your account </h1>
                    <ClimbingBoxLoader size={15} color='#00D897' loading={loading} className="loader" />
                    {serverResponse && <p style={{ color: 'white' }}>{serverResponse}</p>}
                    {serverResponseOk && <button className="to-dashboard-btn" onClick={() => {navigate('/my-music')}}>Take me to dashboard</button>}
                </div>    
        </div>
    )
}

export default WelcomePage;