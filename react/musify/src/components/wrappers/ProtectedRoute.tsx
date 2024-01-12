import {ReactNode, useEffect, useState} from "react";
import useSession from "../../hooks/useSession.ts";
import {useNavigate} from "react-router-dom";
import { ClimbingBoxLoader } from 'react-spinners';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyUser() {
      const session = useSession();
      //console.log(session)
      if (!session) {
        navigate("/")
      }
      const res = await fetch(`/auth/check-session`, {
        credentials: "include"
      })
      const body = await res.json();
      //console.log(body)
      if (body.error) {
        navigate("/")
      } else {
        setAuthenticated(true)
      }
    }
    verifyUser()
  });

  if (!authenticated) {
    return (
      <div className="content-welcome-page">
        <h1>Loading the page...</h1>
        <ClimbingBoxLoader size={15} color='#00D897' loading={true} className="loader" />
      </div>
    )
  }
  return children;
}
