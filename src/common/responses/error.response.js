const ErrorResponse = ({
    status = 500,
    message = "Something went wrong!",
    extra,
} = {}) => {
    throw new Error(message, { cause: { status, extra } });
};

//! Not found
export const NotFoundException = ({ message = "Not found", extra } = {}) =>
    ErrorResponse({ status: 404, message, extra });

//! Bad request
export const BadRequestException = ({ message = "Bad request", extra } = {}) =>
    ErrorResponse({ status: 400, message, extra });

//! Conflict
export const ConflictException = ({ message = "Conflict", extra } = {}) =>
    ErrorResponse({ status: 409, message, extra });

//! Forbidden
export const ForbiddenException = ({ message = "Forbidden", extra } = {}) =>
    ErrorResponse({ status: 403, message, extra });

//! UnAuthorized
export const UnAuthorizedException = ({
    message = "Unauthorized",
    extra,
} = {}) => ErrorResponse({ status: 401, message, extra });

//! InternalServerError
export const InternalServerErrorException = ({
    message = "Internal Server Error",
    extra,
} = {}) => ErrorResponse({ status: 500, message, extra });
