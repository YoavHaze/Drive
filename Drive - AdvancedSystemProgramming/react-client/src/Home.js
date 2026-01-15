import React, { useEffect, useState, useContext, useCallback } from 'react';
import { ThemeContext, AuthContext } from './App';
import { api } from './api';

export default function Home() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { logout, user } = useContext(AuthContext);

    // State
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [currentView, setCurrentView] = useState('myDrive');
    const [viewMode, setViewMode] = useState('list');

    // Context Menu State
    const [contextMenu, setContextMenu] = useState(null);

    const loadFiles = useCallback(async () => {
        try {
            let data;
            if (currentView === 'myDrive') {
                data = await api.getFiles();
            } else if (currentView === 'shared') {
                data = await api.getSharedFiles();
            }
            setFiles(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load files", e);
        }
    }, [currentView]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // Close context menu on any global click
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleOpenFile = async (file) => {
        setSelectedFile(file);
        setIsLoading(true);
        setIsEditing(false);
        try {
            const data = await api.getFileContent(file.FID || file.id || file._id);
            setFileContent(data.content || '');
        } catch (e) {
            console.error("Failed to load file content", e);
            setFileContent('Error loading file content');
        }
        setIsLoading(false);
    };

    const handleSaveFile = async () => {
        if (!selectedFile) return;
        setIsLoading(true);
        try {
            await api.updateFile(selectedFile.FID || selectedFile.id || selectedFile._id, {
                newContent: fileContent
            });
            setIsEditing(false);
            // Update the selectedFile to reflect saved state
            setSelectedFile({ ...selectedFile, content: fileContent });
            alert('File saved successfully!');
        } catch (e) {
            console.error("Failed to save file", e);
            alert('Failed to save file');
        }
        setIsLoading(false);
    };

    const handleCreateFile = async () => {
        if (!newFileName) return;
        try {
            await api.createFile({
                nameOfFile: newFileName,
                isDir: false,
                content: "",
                parentID: ""
            });
            setNewFileName('');
            loadFiles();
        } catch (e) {
            console.error(e);
            alert("Failed to create file");
        }
    };

    const handleDelete = async (file) => {
        if (!window.confirm(`Delete "${file.name || file.fileName}"?`)) return;
        try {
            await api.deleteFile(file.id || file._id || file.FID);
            loadFiles();
            setContextMenu(null);
        } catch (e) {
            console.error(e);
            alert("Failed to delete");
        }
    };

    const handleShare = async (file) => {
        const email = prompt("Enter email to share with:");
        if (!email) return;

        try {
            await api.addPermission(file.id || file._id || file.FID, email);
            alert("File shared successfully!");
        } catch (e) {
            alert("Failed to share: " + e.message);
        }
    };

    const handleContextMenu = (e, file) => {
        e.preventDefault();
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            file: file
        });
    };

    const closeModal = () => {
        setSelectedFile(null);
        setFileContent('');
        setIsEditing(false);
    };

    return (
        <div className="d-flex" style={{ height: '100vh' }}>
            {/* Sidebar */}
            <div className={`p-3 border-end ${theme === 'dark' ? 'border-secondary bg-dark' : 'bg-light'}`} style={{ width: '220px' }}>
                <h5 className="mb-4">
                    <span style={{ color: '#4285f4' }}>G</span>
                    <span style={{ color: '#ea4335' }}>o</span>
                    <span style={{ color: '#fbbc05' }}>o</span>
                    <span style={{ color: '#4285f4' }}>g</span>
                    <span style={{ color: '#34a853' }}>l</span>
                    <span style={{ color: '#ea4335' }}>e</span>
                    <span className="ms-1">Drive</span>
                </h5>

                <button
                    onClick={() => document.getElementById('newFileInput').focus()}
                    className="btn btn-light border shadow-sm rounded-pill px-4 py-2 mb-4 d-flex align-items-center gap-2"
                >
                    <span style={{ fontSize: '24px', color: '#5f6368' }}>+</span>
                    <span>New</span>
                </button>

                <ul className="nav flex-column">
                    <li className="nav-item mb-1">
                        <button
                            className={`nav-link btn btn-link text-start w-100 rounded ${currentView === 'myDrive' ? 'bg-primary bg-opacity-10' : ''}`}
                            onClick={() => setCurrentView('myDrive')}
                            style={{ textDecoration: 'none', color: currentView === 'myDrive' ? '#1a73e8' : 'inherit' }}
                        >
                            <span className="me-2">📁</span> My Drive
                        </button>
                    </li>
                    <li className="nav-item mb-1">
                        <button
                            className={`nav-link btn btn-link text-start w-100 rounded ${currentView === 'shared' ? 'bg-primary bg-opacity-10' : ''}`}
                            onClick={() => setCurrentView('shared')}
                            style={{ textDecoration: 'none', color: currentView === 'shared' ? '#1a73e8' : 'inherit' }}
                        >
                            <span className="me-2">👥</span> Shared with me
                        </button>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow-1 d-flex flex-column">
                {/* Top Bar */}
                <div className={`d-flex justify-content-between align-items-center p-2 px-3 border-bottom ${theme === 'dark' ? 'border-secondary' : ''}`}>
                    <div className={`d-flex align-items-center rounded-pill px-3 py-2 ${theme === 'dark' ? 'bg-secondary' : 'bg-light'}`} style={{ width: '45%' }}>
                        <span className="me-2">🔍</span>
                        <input
                            type="text"
                            className={`form-control border-0 bg-transparent ${theme === 'dark' ? 'text-white' : ''}`}
                            placeholder="Search in Drive"
                            style={{ boxShadow: 'none' }}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={toggleTheme} className="btn btn-sm btn-link" style={{ textDecoration: 'none' }}>
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        {user?.profilePic && (
                            <img src={user.profilePic} alt="Profile" className="rounded-circle" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
                        )}
                        <span className="small"><b>{user?.displayName}</b></span>
                        <button onClick={logout} className="btn btn-sm btn-outline-danger rounded-pill">Logout</button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2 align-items-center">
                        <input
                            id="newFileInput"
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="New file name..."
                            value={newFileName}
                            onChange={e => setNewFileName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreateFile()}
                            style={{ width: '200px' }}
                        />
                        <button onClick={handleCreateFile} className="btn btn-sm btn-primary">Create</button>
                    </div>
                    <div className="btn-group btn-group-sm">
                        <button
                            className={`btn ${viewMode === 'list' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            ☰ List
                        </button>
                        <button
                            className={`btn ${viewMode === 'grid' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            ▦ Grid
                        </button>
                    </div>
                </div>

                {/* File Area */}
                <div className="p-3 flex-grow-1 overflow-auto">
                    {files.length === 0 ? (
                        <div className="text-center mt-5 text-muted">
                            <div style={{ fontSize: '64px', opacity: 0.5 }}>📂</div>
                            <p>No files in {currentView === 'myDrive' ? 'My Drive' : 'Shared with me'}</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        /* List View */
                        <table className={`table table-hover ${theme === 'dark' ? 'table-dark' : ''}`}>
                            <thead>
                                <tr className="text-muted small">
                                    <th style={{ width: '50%' }}>Name</th>
                                    <th>Owner</th>
                                    <th>Type</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(file => (
                                    <tr
                                        key={file.id || file._id || file.FID}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleOpenFile(file)}
                                        onContextMenu={(e) => handleContextMenu(e, file)}
                                    >
                                        <td>
                                            <span className="me-2">📄</span>
                                            {file.fileName || file.name}
                                        </td>
                                        <td className="text-muted small">
                                            {currentView === 'myDrive' ? 'me' : 'Shared'}
                                        </td>
                                        <td className="text-muted small">
                                            {file.isDir ? 'Folder' : 'Document'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-link"
                                                onClick={(e) => { e.stopPropagation(); handleContextMenu(e, file); }}
                                            >
                                                ⋮
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        /* Grid View */
                        <div className="row g-3">
                            {files.map(file => (
                                <div key={file.id || file._id || file.FID} className="col-6 col-md-4 col-lg-2">
                                    <div
                                        className={`card h-100 p-3 text-center ${theme === 'dark' ? 'bg-secondary text-white' : ''}`}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        onClick={() => handleOpenFile(file)}
                                        onContextMenu={(e) => handleContextMenu(e, file)}
                                    >
                                        <div style={{ fontSize: '48px' }}>📄</div>
                                        <small className="text-truncate d-block">{file.fileName || file.name}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className={`card shadow-lg ${theme === 'dark' ? 'bg-dark text-white border-secondary' : 'bg-white'}`}
                    style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 2000, width: '180px' }}
                >
                    <ul className="list-group list-group-flush">
                        <li
                            className={`list-group-item list-group-item-action ${theme === 'dark' ? 'bg-dark text-white' : ''}`}
                            style={{cursor: 'pointer'}}
                            onClick={() => { handleOpenFile(contextMenu.file); setContextMenu(null); }}
                        >
                            <span className="me-2">📂</span> Open
                        </li>
                        {currentView === 'myDrive' && (
                            <>
                                <li
                                    className={`list-group-item list-group-item-action ${theme === 'dark' ? 'bg-dark text-white' : ''}`}
                                    style={{cursor: 'pointer'}}
                                    onClick={() => { handleShare(contextMenu.file); setContextMenu(null); }}
                                >
                                    <span className="me-2">🔗</span> Share
                                </li>
                                <li
                                    className={`list-group-item list-group-item-action text-danger ${theme === 'dark' ? 'bg-dark' : ''}`}
                                    style={{cursor: 'pointer'}}
                                    onClick={() => handleDelete(contextMenu.file)}
                                >
                                    <span className="me-2">🗑️</span> Delete
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}

            {/* File Editor Modal */}
            {selectedFile && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={closeModal}
                >
                    <div
                        className={`card shadow-lg ${theme === 'dark' ? 'bg-dark text-white border-secondary' : 'bg-white'}`}
                        style={{ width: '80%', height: '80%', maxWidth: '900px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <span>📄</span>
                                <h5 className="mb-0">{selectedFile.fileName || selectedFile.name}</h5>
                            </div>
                            <div className="d-flex gap-2">
                                {currentView === 'myDrive' && (
                                    <>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={handleSaveFile}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </>
                                )}
                                <button className="btn-close" onClick={closeModal}></button>
                            </div>
                        </div>
                        <div className="card-body overflow-auto p-0">
                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : isEditing ? (
                                <textarea
                                    className={`form-control h-100 border-0 rounded-0 ${theme === 'dark' ? 'bg-dark text-white' : ''}`}
                                    style={{ resize: 'none', fontFamily: 'monospace' }}
                                    value={fileContent}
                                    onChange={(e) => setFileContent(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <pre className="p-3 m-0 h-100" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {fileContent || '(Empty file)'}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
