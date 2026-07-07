import fs from "fs";
import multer from "multer";
import path from "path";

const createStorage = (folder) =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(folder, { recursive: true });
            cb(null, folder);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const uniqueSuffix =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                "-" +
                file.originalname;
            cb(null, file.fieldname + "-" + uniqueSuffix);
        },
    });

export const uploadCategory = multer({
    storage: createStorage("uploads/categories"),
});
export const uploadProduct = multer({
    storage: createStorage("uploads/products"),
});
export const uploadUser = multer({
    storage: createStorage("uploads/users"),
});
