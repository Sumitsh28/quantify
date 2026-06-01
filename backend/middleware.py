import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from logger import correlation_id_ctx, logger

class TracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        token = correlation_id_ctx.set(correlation_id)
        
        logger.info(f"Incoming request: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        response.headers["X-Correlation-ID"] = correlation_id
        
        logger.info(f"Outgoing response: {response.status_code}")
        correlation_id_ctx.reset(token)
        
        return response
