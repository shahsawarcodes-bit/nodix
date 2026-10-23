import path from "node:path";
import fs from "node:fs";
import { Router, type Request, type Response } from "express";
import multer from "multer";

const getUploadDir = (): string => {
  const dir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${String(Date.now())}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

export const createUploadRoutes = (): Router => {
  const router = Router();

  router.post("/", (req: Request, res: Response, _next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: { message: err instanceof Error ? err.message : "File upload failed" } });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: { message: "No file uploaded" } });
        return;
      }
      const filename = req.file.filename;
      res.status(200).json({
        url: `/uploads/${filename}`,
        fileName: req.file.originalname
      });
    });
  });

  return router;
};
