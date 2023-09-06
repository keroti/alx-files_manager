import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const { 'x-token': token } = req.headers;
    const {
      name,
      type,
      data,
      parentId = 0,
      isPublic = false,
    } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.users.findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check parentId
    if (parentId !== 0) {
      const parentFile = await dbClient.files.findOne({
        _id: parentId,
      });

      if (!parentFile || parentFile.type !== 'folder') {
        return res
          .status(400)
          .json({
            error: 'Parent not found or is not a folder',
          });
      }
    }

    // Generate a unique filename
    const fileId = uuidv4();
    const localPath = path.join(
      process.env.FOLDER_PATH || '/tmp/files_manager',
      fileId,
    );

    if (type === 'file' || type === 'image') {
      const fileContent = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, fileContent);
    } else if (type === 'folder') {
      fs.mkdirSync(localPath);
    }

    const newFile = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };

    const insertedFile = await dbClient.files.insertOne(newFile);
    const {
      _id: fileIdResult,
      userId: fileUserId,
      ...fileResponse
    } = insertedFile.ops[0];

    return res.status(201).json(fileResponse);
  }
}

export default FilesController;
