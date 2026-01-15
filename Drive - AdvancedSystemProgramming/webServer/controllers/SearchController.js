const dataBase = require('../models/DataBase');
const WebClient = require('../models/webClient');
const permissionModel = require('../models/Permission');

exports.searchFiles = async (req, res) => { 
    const userID = req.userId;
    const query = req.params.query;
    
    if (!query) {
        return res.status(400).json({ message: 'Missing search query' });
    }

    const resultFiles = [];
    
    try {
        // Iterate over ALL files to find ones the user has access to
        const allFiles = dataBase.getAllFiles();

        for (const file of allFiles) {
            let hasAccess = false;

            // 1. Check if user is the owner
            if (file.ownerID == userID) {
                hasAccess = true;
            } else {
                // 2. Check if user has explicit permission
                const userPerm = permissionModel.getUserPermission(file.FID, userID);
                if (userPerm) {
                    hasAccess = true;
                }
            }

            if (hasAccess) {
                // Check filename
                if (file.name.includes(query)) {
                    resultFiles.push(file);
                    continue; // Already found, skip content check
                }
                
                // Check file content using WebClient
                const fileContentResponse = await WebClient.send('GET ' + file.storageNameOfFile);
                
                if (fileContentResponse && fileContentResponse.includes('200')) { 
                    const content = fileContentResponse.split('\n').slice(1).join(''); 
                    
                    if (content.includes(query)) {
                        if (!resultFiles.some(f => f.FID === file.FID)) { // avoid duplicates
                            resultFiles.push(file);
                        }
                    }
                }
            }
        }
        // only return necessary info: name, FID, isDir, ownerID
        const resultFilesInfo = resultFiles.map(file => ({
            FID: file.FID,
            name: file.name,
            isDir: file.isDir,
            ownerID: file.ownerID,
        }));
        res.status(200).json(resultFilesInfo);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Internal Server Error during search' });
    }
}