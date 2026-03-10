import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    // DESTINATION MANQUANTE !
    destination: function(req, file, callback) {
        callback(null, 'uploads/'); // Dossier où sauvegarder les images
    },
    filename: function(req, file, callback) {
        // Nom unique pour éviter les conflits
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        callback(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    fileFilter: function(req, file, cb) {
        // Accepter seulement les images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

export default upload;