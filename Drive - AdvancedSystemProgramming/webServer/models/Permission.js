const dataBase = require('./DataBase');

class Permission {
    constructor(pid, fileID, userID, role) {
        this.pid = pid;
        this.fileID = fileID;
        this.userID = userID;
        this.role = role; // 'view' or 'edit'
    }

    static create(fileID, userID, role) {
        // Check if permissions map for the file exists
        let filePerms = dataBase.findInPermissions(fileID);
        if (!filePerms) {
            filePerms = new Map();
        }

        // Create a unique PID
        const pid = dataBase.generatePID();

        const newPerm = new Permission(pid, fileID, userID, role);

        // Save in DB
        filePerms.set(pid, newPerm);
        dataBase.saveInPermissions(fileID, filePerms);

        return newPerm;
    }

    /**
     * Returns all permissions for a specific file as an array
     */
    static getPermissionsByFileID(fileID) {
        const filePerms = dataBase.findInPermissions(fileID);
        if (!filePerms) {
            return [];
        }
        return Array.from(filePerms.values());
    }

    /**
    * Returns the permission of a user for a specific file
     */
    static getUserPermission(fileID, userID) {
        const filePerms = dataBase.findInPermissions(fileID);
        if (!filePerms) {
            return null;
        }
        for (const perm of filePerms.values()) {
            if (String(perm.userID) === String(userID)) {
                return perm;
            }
        }
        return null;
    }

    /**
     * Updates the role of an existing permission by permission ID
     */
    static update(fileID, pid, newRole) {
        const filePerms = dataBase.findInPermissions(fileID); 
        if (!filePerms || !filePerms.has(pid)) {
            return null;
        }
        const permToUpdate = filePerms.get(pid);
        permToUpdate.role = newRole;
        
        dataBase.saveInPermissions(fileID, filePerms); 
        
        return permToUpdate;
    }

    /**
     * Returns a specific permission by permission ID
     */
    static getPermissionByID(fileID, pid) {
        const filePerms = dataBase.findInPermissions(fileID);
        if (!filePerms || !filePerms.has(pid)) {
            return null;
        }
        return filePerms.get(pid);
    }

    /**
     * deletes a specific permission
     */
    static delete(fileID, pid) {
        const filePerms = dataBase.findInPermissions(fileID);
        if (filePerms && filePerms.has(pid)) {
            filePerms.delete(pid);
            return true;
        }
        return false;
    }

    /**
     * deletes all permissions
     */
    static deleteByFileID(fileID) {
        return dataBase.deleteFromPermissions(fileID);
    }
}

module.exports = Permission;