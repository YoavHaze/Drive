const dataBase = require('./DataBase')

class FileInfo {

    constructor(fileID, nameOfFile, storageNameOfFile, ownerOfFileID, isDir = false, parentID = '/') {
        this.FID = fileID;
        this.name = nameOfFile;
        this.ownerID = ownerOfFileID;
        this.isDir = isDir;
        this.parentID = parentID;
        this.storageNameOfFile = storageNameOfFile;
    }

    static create(nameOfFile, storageNameOfFile, ownerOfFileID, isDir = false, parentID = '/') {
        const fileID = dataBase.generateFID();
        const newFileInfo = new FileInfo(fileID, nameOfFile, storageNameOfFile, ownerOfFileID, isDir, parentID);
        dataBase.saveInFiles(fileID, newFileInfo);
        return newFileInfo;
    }
    
    static update(fileID, newNameOfFile, newParentID) {
        const fileToUpdate = dataBase.findInFiles(fileID);
        if (fileToUpdate) {
            if (newNameOfFile) {
                fileToUpdate.name = newNameOfFile;
            }
            if (newParentID) {
                fileToUpdate.parentID = newParentID;
            }
            dataBase.saveInFiles(fileID, fileToUpdate);
            return fileToUpdate;
        }
        return null;
    }
    
    static delete(fileID) {
        return dataBase.deleteFromFiles(fileID);
    }
    
    // static fileByOwnerID(ownerID) {
    //     const files = [];
    //     for (const file of dataBase.getAllFiles()) {
    //         if (file.ownerID === ownerID) {
    //             files.push(file);
    //         }
    //     }
    //     return files;
    // }
}

module.exports = FileInfo;
