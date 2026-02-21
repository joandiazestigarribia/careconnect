import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const isProduction = process.env.NODE_ENV === 'production';

    let status: number;
    let message: string;
    let code: string;
    let details: Record<string, any> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCodeFromStatus(status);
      } else {
        const resp = exceptionResponse as any;
        message = resp.message || this.getDefaultMessage(status);
        code = resp.error || this.getErrorCodeFromStatus(status);
        details = resp.details;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_ERROR';
      
      if (isProduction) {
        message = 'An unexpected error occurred';
      } else {
        message = exception instanceof Error 
          ? exception.message 
          : 'An unexpected error occurred';
      }
    }

    this.logError(exception, request, status);

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        message,
        code,
        ...(details && !isProduction && { details }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    const codes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  private getDefaultMessage(status: number): string {
    const messages: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad request',
      [HttpStatus.UNAUTHORIZED]: 'Authentication required',
      [HttpStatus.FORBIDDEN]: 'Access denied',
      [HttpStatus.NOT_FOUND]: 'Resource not found',
      [HttpStatus.CONFLICT]: 'Resource conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Validation failed',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal server error',
    };
    return messages[status] || 'An error occurred';
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const logData: Record<string, any> = {
      statusCode: status,
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    if (exception instanceof Error) {
      logData.errorName = exception.name;
      logData.message = exception.message;
      if (!isProduction) {
        logData.stack = exception.stack;
      }
    } else {
      logData.unknownError = String(exception);
    }

    const user = (request as any).user;
    if (user?.id) {
      logData.userId = user.id;
    }

    if (status >= 500) {
      this.logger.error(logData, 'Server error occurred');
    } else if (status >= 400) {
      this.logger.warn(logData, 'Client error occurred');
    }
  }
}
