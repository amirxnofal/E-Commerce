export const SuccessResponse = ({
    res,
    status = 200,
    message = "Success",
    data,
    token,
}) => {
    res.status(status).json({
        success: true,
        message,
        ...(data !== undefined && { data }),
        ...(token !== undefined && { token }),
    });
};
