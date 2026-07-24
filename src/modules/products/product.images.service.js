export const addNewImages = async (seller, files) => {
    const uploadedImages = [];
    const failedImages = [];

    for (const file of files) {
        try {
            const uploadResult = await uploadToCloudinary(
                file.path,
                `users/${seller._id}/productsImages`,
            );

            uploadedImages.push({
                public_id: uploadResult.public_id,
                secure_url: uploadResult.secure_url,
            });
        } catch (error) {
            failedImages.push({
                fileName: file.originalname,
                cause: error.message,
            });
        }
    }

    if (uploadedImages.length === 0)
        throw e.BadRequestException({
            message: "Must upload 1 image at least",
        });

    return { uploadedImages, failedImages };
};

export const deleteOldImages = async (oldImages, delPublicIds) => {
    const deletedImages = [];
    const failedImages = [];
    const notFoundIds = [];

    const existingIds = new Set(oldImages.map((img) => img.public_id));

    for (const publicId of delPublicIds) {
        if (!existingIds.has(publicId)) {
            notFoundIds.push(publicId);
            continue;
        }

        try {
            await cloudinary.uploader.destroy(publicId);
            deletedImages.push(publicId);
        } catch (error) {
            failedImages.push({ publicId, cause: error.message });
        }
    }

    return { deletedImages, failedImages, notFoundIds };
};

export const rollbackUploadedImages = async (uploadedImages) => {
    if (!uploadedImages?.length) return;

    await Promise.allSettled(
        uploadedImages.map((img) => cloudinary.uploader.destroy(img.public_id)),
    );
};
