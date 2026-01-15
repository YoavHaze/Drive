const fileInfo = require('../models/FileInfo');
const dataBase = require('../models/DataBase');
const WebClient = require('../models/webClient');
const permissionObject = require('../models/Permission');

// Helper functions to encode/decode content (preserves newlines and special chars)
const encodeContent = (content) => Buffer.from(content || '').toString('base64');
const decodeContent = (encoded) => Buffer.from(encoded || '', 'base64').toString('utf8');

exports.getPermissionsByFileID = (req, res) => {
    const fileID = parseInt(req.params.fileID);
    if (dataBase.findInFiles(fileID)) {
        const permissionsOfFile = permissionObject.getPermissionsByFileID(fileID);
        res.status(200).json(permissionsOfFile);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
}

// exports.getUserFiles = (req, res) => {
//     const userID = req.userId;
//     const userFiles = fileInfo.fileByOwnerID(userID);
//     if (!userFiles) {
//         return res.status(404).json({ message: 'User not found or has no files' });
//     }
//     res.status(200).json(userFiles);
// }

exports.createFile = async (req, res) => {
    const { nameOfFile, isDir, content, parentID } = req.body;
    const ownerOfFileID = req.userId;

    if (!nameOfFile) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const storageNameOfFile = `${ownerOfFileID}_${Date.now()}_${nameOfFile}`;
    
    try {
        // Encode content to Base64 to preserve newlines and special characters
        const encodedContent = encodeContent(content);
        const sendResponse = await WebClient.send('POST ' + storageNameOfFile + ' ' + encodedContent);
        
        if (sendResponse && sendResponse.includes('201')) {
            const newFile = fileInfo.create(nameOfFile, storageNameOfFile, ownerOfFileID, isDir, parentID);
            permissionObject.create(newFile.FID, ownerOfFileID, 'edit');
            // only return relevant info: name, FID, isDir, ownerID
            res.status(201).json(newFileInfo={
                FID: newFile.FID,
                name: newFile.name,
                isDir: newFile.isDir,
                ownerID: newFile.ownerID,
            });
        } else {
            res.status(500).json({ message: 'Error storing file in WebClient' });
        }
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.updateFile = (req, res) => {
    const fileID = parseInt(req.params.id);
    const userID = req.userId;
    
    const userPermission = permissionObject.getUserPermission(fileID, userID);
    
    if (!userPermission || userPermission.role !== 'edit') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this file' });
    }

    const { newNameOfFile, newContent, newParentID } = req.body;
    const fileToUpdate = dataBase.findInFiles(fileID);
    if (!fileToUpdate) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Update fileInfo
    const updatedFile = fileInfo.update(fileID, newNameOfFile, newParentID);
    if (!updatedFile) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Update file content if provided (check for undefined, not falsy, to allow empty content)
    if (newContent !== undefined) {
        // Encode content to Base64 to preserve newlines and special characters
        const encodedContent = encodeContent(newContent);
        // delete the old file, and create a new one with the same everything except content
        WebClient.send('DELETE ' + updatedFile.storageNameOfFile)
        .then((deleteResponse) => {
            if (deleteResponse && deleteResponse.includes('204')) {
                return WebClient.send('POST ' + updatedFile.storageNameOfFile + ' ' + encodedContent);
            } else {
                throw new Error('Delete failed');
            }
        })
        .then((postResponse) => {
            if (postResponse && postResponse.includes('201')) {
                res.status(200).json({
                    FID: updatedFile.FID,
                    name: updatedFile.name,
                    isDir: updatedFile.isDir,
                    ownerID: updatedFile.ownerID,
                });
            } else {
                throw new Error('Post failed');
            }
        })
        .catch((error) => {
            console.error("WebClient Error:", error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    } else {
        // No content update, just respond with updated fileInfo
        res.status(200).json({
            FID: updatedFile.FID,
            name: updatedFile.name,
            isDir: updatedFile.isDir,
            ownerID: updatedFile.ownerID,
        });
    }
}

exports.deleteFile = async (req, res) => { // Added async
    const fileID = parseInt(req.params.id);
    const userID = req.userId; // FIXED: req.userId

    const fileToDelete = dataBase.findInFiles(fileID);
    if (!fileToDelete) {
        return res.status(404).json({ message: 'File not found' });
    }

    // FIXED: permissionModel -> permissionObject
    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission || userPermission.role !== 'edit') {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this file' });
    }

    try {
        const deleteResponse = await WebClient.send('DELETE ' + fileToDelete.storageNameOfFile);

        if (deleteResponse && deleteResponse.includes('204')) {
            permissionObject.delete(fileID);
            const deletionSuccess = fileInfo.delete(fileID);
            if (deletionSuccess) {
                res.status(204).json({ message: 'No Content' });
            } else {
                res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFileContentByID = async (req, res) => { 
    const fileID = parseInt(req.params.id);
    const userID = req.userId;

    const userPermission = permissionObject.getUserPermission(fileID, userID);
    if (!userPermission) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to view this file' });
    }

    const file = dataBase.findInFiles(fileID);
    if (!file) {
        return res.status(404).json({ message: 'File not found' });
    }

    try {
        const fileContentResponse = await WebClient.send('GET ' + file.storageNameOfFile);

        if (fileContentResponse && fileContentResponse.includes("200")) {
            // remove the status line from the response
            const encodedContent = fileContentResponse.split('\n').slice(1).join('');
            // Decode from Base64 to restore original content with newlines
            const content = decodeContent(encodedContent);
            res.status(200).json({ content });
        } else {
            res.status(500).json({ message: 'Error retrieving file content from WebClient' });
        }
    } catch (error) {
        console.error("WebClient Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getAllFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();
    // only return files that the user has permission to view
    const permittedFiles = allFiles.filter(file => {
        const userPermission = permissionObject.getUserPermission(file.FID, userID);
        return userPermission !== null;
    });
    // only return necessary info: name, FID, isDir, ownerID
    const permittedFilesInfo = permittedFiles.map(file => ({
        FID: file.FID,
        name: file.name,
        isDir: file.isDir,
        ownerID: file.ownerID,
    }));
    res.status(200).json(permittedFilesInfo);
}

exports.getSharedFiles = (req, res) => {
    const userID = req.userId;
    const allFiles = dataBase.getAllFiles();

    const sharedFiles = allFiles.filter(file => {
        const isNotMine = String(file.ownerID) !== String(userID);
        const userPermission = permissionObject.getUserPermission(file.FID, userID);

        return isNotMine && userPermission;
    });

    const responseData = sharedFiles.map(file => ({
        FID: file.FID,
        name: file.name,
        isDir: file.isDir,
        ownerID: file.ownerID,
    }));

    res.status(200).json(responseData);
};