const BASE_URL = 'http://localhost:3000/api';

export const api = {
    // Helper to get headers with JWT
    getHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' // Include token if exists
        };
    },

    // --- User & Auth ---
    login: async (username, password) => {
        const res = await fetch(`${BASE_URL}/tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                gmail: username,
                password: password
            })
        });
        if (!res.ok) throw new Error('Login failed');
        return res.text(); // Returns the JWT string
    },

    register: async (userData) => {
        const res = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!res.ok) throw new Error('Registration failed');
    },

    getUser: async (id) => {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
            headers: api.getHeaders()
        });
        return res.json();
    },

    // --- Files ---
    getFiles: async () => {
        const res = await fetch(`${BASE_URL}/files`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch files');
        return res.json();
    },

    createFile: async (fileData) => {
        const res = await fetch(`${BASE_URL}/files`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify(fileData)
        });
        if (!res.ok) throw new Error('Failed to create file');
    },

    deleteFile: async (id) => {
        await fetch(`${BASE_URL}/files/${id}`, {
            method: 'DELETE',
            headers: api.getHeaders()
        });
    },

    getFileContent: async (id) => {
        const res = await fetch(`${BASE_URL}/files/${id}`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch file content');
        return res.json();
    },

    updateFile: async (id, data) => {
        const res = await fetch(`${BASE_URL}/files/${id}`, {
            method: 'PATCH',
            headers: api.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update file');
        return res.json();
    },

    getSharedFiles: async () => {
        const res = await fetch(`${BASE_URL}/files/shared`, {
            headers: api.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch shared files');
        return res.json();
    },

    addPermission: async (fileID, email) => {
        const res = await fetch(`${BASE_URL}/files/${fileID}/permissions`, {
            method: 'POST',
            headers: api.getHeaders(),
            body: JSON.stringify({ email: email, privilege: "VIEW" })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Share Error:", errorData);
            throw new Error(errorData.message || 'Failed to share file');
        }
    }
};