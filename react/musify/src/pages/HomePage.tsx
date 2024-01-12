import './HomePage.css';
import useSession from '../hooks/useSession.ts';
import DeleteAccountPopup from '../components/popups/DeleteAccountPopup.tsx';
import { useNavigate } from 'react-router';
import { usePopup } from '../components/context/Popup.tsx';
import { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';


function HomePage() {
    const userSession = useSession();
    const navigate = useNavigate();
    const [popupState, setPopupState] = usePopup();
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [serverResponse, setServerResponse] = useState("");

    // my music
    const [totalUserFiles, setTotalUserFiles] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userMusicFiles, setUserMusicFiles] = useState<Array<any>>([]);
    const [userSongsPerPage, setUserSongsPerPage] = useState(0);

    // all music
    const [totalAllFiles, setTotalAllFiles] = useState(0);
    const [allPage, setAllPage] = useState(1);
    const [allMusicFiles, setAllMusicFiles] = useState<Array<any>>([]);
    const [allSongsPerPage, setAllSongsPerPage] = useState(0);
    const [fileTypeError, setFileTypeError] = useState("")

    const listItemHeight = 50;
    

    useEffect(() => {
        // user music
        const searchParams = new URLSearchParams(window.location.search);
        const currentUserPage = searchParams.get('myPage');
        if (!searchParams.get('myPage')) {
            navigate('?myPage=1');
        }
        const userPage = parseInt(currentUserPage || "1");
        setUserPage(userPage);
        const mySongsContainer = document.querySelector('.song-list-my') as HTMLElement;
        setUserSongsPerPage(Math.floor(mySongsContainer.offsetHeight / listItemHeight));

        // all music
        const currentAllPage = searchParams.get('allPage');
        if (!searchParams.get('allPage')) {
            searchParams.set('allPage', '1');
            const newSearch = searchParams.toString();
            const newURL = `${window.location.pathname}?${newSearch}`;
            navigate(newURL);
        }
        const allPage = parseInt(currentAllPage || "1");
        setAllPage(allPage);
        const allSongsContainer = document.querySelector('.song-list-all') as HTMLElement;
        setAllSongsPerPage(Math.floor(allSongsContainer.offsetHeight / listItemHeight));
    }, [window.location]);


    useEffect(() => {

        if (userPage !== 0 && userSongsPerPage !== 0) {
            updateMyMusic(userPage, userSongsPerPage);
        }
    }, [userPage, userSongsPerPage]);

    useEffect(() => {

        if (allPage !== 0 && allSongsPerPage !== 0) {
            updateAllMusic(allPage, allSongsPerPage);
        }
    }, [allPage, allSongsPerPage]);


    
    async function handleLogout() {
        try {
          const response = await fetch(`/auth/logout`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          if (response.ok) {
            navigate('/');
          } else {
            alert("Logout failed");
          }
        } catch (error) {
          console.error('API fetch error:', error);
        }
    }

    async function handleFileUpload(event: any) {
        event.preventDefault();
        const fileInput = document.querySelector('.file-select') as HTMLInputElement;
        
        if (fileInput?.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (!file.type.match(/^audio\/.*/)) {
                setFileTypeError("Please select an audio file")
                return;
            }
            setFileTypeError("")
            const formData = new FormData();
            formData.append('file', file);
            formData.append('user', userSession?.user.username as string);

            try {
                const res = await fetch(`/file/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });

                const responseData = await res.json();

                if (res.ok) {
                    updateMyMusic(userPage, userSongsPerPage);
                    updateAllMusic(allPage, allSongsPerPage);
                    setServerResponse(responseData.message);
                    setTimeout(() => {
                        setServerResponse('');
                    }, 4000);
                } else {
                    setServerResponse(responseData.error);
                    setTimeout(() => {
                        setServerResponse('');
                    }, 4000);
                }
            } catch (error) {
                console.error('API fetch error:', error);
            }
        }
    }

    const updateMyMusic = async (page: number, songsPerPage: number) => {
        try {
          const res = await fetch(`/file/userFiles/${page}/${songsPerPage}`, {
            method: 'GET',
            credentials: 'include',
          });

          if (res.ok) {
            const responseData = await res.json();
            //(responseData.data);
            setUserMusicFiles(responseData.data);
            setTotalUserFiles(responseData.totalCount);
          } else {
            console.log('Error:', res.status);
          }
        } catch (error) {
          console.log('Error fetching user music files:', error);
        }
    }

    const updateAllMusic = async (page: number, songsPerPage: number) => {
        try {
          const res = await fetch(`/file/allFiles/${page}/${songsPerPage}`, {
            method: 'GET',
            credentials: 'include',
          });

          if (res.ok) {
            const responseData = await res.json();
            //(responseData.data);
            setAllMusicFiles(responseData.data);
            setTotalAllFiles(responseData.totalCount);
          } else {
            console.log('Error:', res.status);
          }
        } catch (error) {
          console.log('Error fetching user music files:', error);
        }
    }

    const downloadFile = async (event:any, mfId: number) => {
        event.preventDefault();
        try {
            const res = await fetch(`/file/download/${mfId}`, {
                method: 'GET'
            });
            if (!res.ok) {
                const responseData = await res.json();
                console.log(responseData.error);
            } else {
                const blob = await res.blob();
                const contentDisposition = res.headers.get("Content-Disposition");
                let title;

                if (contentDisposition) {
                    title = contentDisposition.split('filename=')[1];
                    if (title.length > 1) {
                        title = title.substring(1, title.length - 1);
                    }
                } else {
                    title = "file.mp3";
                }
            
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', title || 'file'); 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('File download error:', error);
        }
    }

    const deleteFile = async (event:any, mfId: number) => {
        event?.preventDefault();
        try {
            const res = await fetch(`/file/delete/${mfId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            // 204 - No content (if successful)
            if (res.ok) {
                updateMyMusic(userPage, userSongsPerPage);
                updateAllMusic(allPage, allSongsPerPage);
            } else {
                const responseData = await res.json();
                console.log(responseData.error);
            }
        } catch (error) {
            console.error('File delete error:', error);
        }
    }

    function truncateTitle(title: string, maxLength: number) {
        if (title.length <= maxLength) {
            return title;
        } else {
            return title.slice(0, maxLength) + '...';
        }
    }

    return (
        <div className="container">
            <div className="navbar">
                <a href="/">
                    <div className="logo-container">
                        <h1>MUSIFY</h1>
                    </div>
                </a>
                <div className="user-container">
                    <h1>{userSession?.user.username}</h1>
                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                    <button className="delete-account-btn" onClick={() => {
                        setPopupState('delete-account');
                    }}>Delete account</button>
                </div>
            </div>
            <div className="content-container-home">
                <div className="left-section">
                    <div className="upload-container">
                        <div className="upload-wrapper">
                            <h1>Upload a song</h1>
                            <form onSubmit={handleFileUpload} className="upload-form">
                                <div className="select-file-container">
                                    <input type="file" className="file-select" name='file' accept='audio/*'
                                    onChange={(event) => {
                                        if (event.target.files && event.target.files?.length > 0) {
                                            setIsFileSelected(true);
                                        }
                                        else {
                                            setIsFileSelected(false);
                                        }
                                    }}/>
                                </div>
                                {serverResponse && <p style={{ color: 'white' }}>{serverResponse}</p>}
                                <button type='submit' className="upload-btn" disabled={!isFileSelected}>Upload file</button>
                            </form>
                            <p className="file-type-error">{fileTypeError}</p>
                        </div>
                    </div>
                    <div className="my-music-container">
                        <div className="my-music-content">
                            <h1>My music</h1>
                            <ul className="song-list-my">
                                {userMusicFiles.map((file) => (
                                    <div key={file.mfId} className='list-item'>
                                        <p>{truncateTitle(file.title, 40)}</p>
                                        <div>
                                        <a href="">
                                            <span className="material-symbols-outlined download-icon" 
                                            onClick={(event) => downloadFile(event, file.mfId)}>download</span>
                                        </a>
                                        <a href="">
                                            <span className="material-symbols-outlined delete-icon"
                                            onClick={(event) => deleteFile(event, file.mfId)}>delete</span>
                                        </a>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                            <Pagination 
                            page={userPage} className="pagination-menu" 
                            count={userSongsPerPage > 0 ? Math.ceil(totalUserFiles / userSongsPerPage) : 1} 
                            onChange={(_, page: number) => { 
                                const searchParams = new URLSearchParams(window.location.search);
                                searchParams.set('myPage', page.toString());
                                const newSearch = searchParams.toString();
                                const newURL = `${window.location.pathname}?${newSearch}`;
                                navigate(newURL);
                                setUserPage(page); 
                                setUserMusicFiles([]); 
                                updateMyMusic(page, userSongsPerPage)} 
                            } />
                        </div>

                    </div>
                </div>
                <div className="right-section">
                    <div className="all-music-container">
                        <div className="all-music-content">
                            <h1>All music</h1>
                            <ul className="song-list-all">
                                {allMusicFiles.map((file) => (
                                    <div key={file.mfId} className='list-item'>
                                        <p>{truncateTitle(file.title, 40)}</p>
                                        <div>
                                            <a href="">
                                                <span className="material-symbols-outlined download-icon"
                                                onClick={(event) => downloadFile(event, file.mfId)}>download</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                            <Pagination 
                                page={allPage} className="pagination-menu" 
                                count={allSongsPerPage > 0 ? Math.ceil(totalAllFiles / allSongsPerPage) : 1} 
                                onChange={(_, page: number) => { 
                                    const searchParams = new URLSearchParams(window.location.search);
                                    searchParams.set('allPage', page.toString());
                                    const newSearch = searchParams.toString();
                                    const newURL = `${window.location.pathname}?${newSearch}`;
                                    navigate(newURL);
                                    setAllPage(page); 
                                    setAllMusicFiles([]); 
                                    updateAllMusic(page, allSongsPerPage)
                                } 
                            } />
                        </div>
                    </div>
                </div>
            </div>
            {popupState === 'delete-account' && <DeleteAccountPopup />}
        </div>
    )
}

export default HomePage;
