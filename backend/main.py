from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
from sqlalchemy import text

from database import engine, SessionLocal
from logger import logger, correlation_id_ctx
from middleware import TracingMiddleware
from routers import products, customers, orders, notifications

# Background task to refresh materialized view
async def refresh_materialized_view():
    while True:
        try:
            await asyncio.sleep(300) # Every 5 minutes
            logger.info("Refreshing Materialized View: dashboard_metrics")
            with SessionLocal() as db:
                db.execute(text("REFRESH MATERIALIZED VIEW dashboard_metrics"))
                db.commit()
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error refreshing materialized view: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up FastAPI application")
    refresh_task = asyncio.create_task(refresh_materialized_view())
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application")
    refresh_task.cancel()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Inventory & Order Management API", version="1.0.0", lifespan=lifespan)

# Add CORS Middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Tracing Middleware
app.add_middleware(TracingMiddleware)

# Include Routers
app.include_router(products.router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(orders.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "correlation_id": correlation_id_ctx.get()}
    )

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    # Check DB connection
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Healthcheck DB connection failed: {e}")
        db_status = "disconnected"
        
    return {"status": "ok", "db": db_status}

@app.get("/api/v1/dashboard", tags=["Dashboard"])
def get_dashboard_metrics():
    try:
        with SessionLocal() as db:
            result = db.execute(text("SELECT * FROM dashboard_metrics")).first()
            if result:
                return dict(result._mapping)
            return {"total_products": 0, "total_customers": 0, "total_orders": 0, "low_stock_count": 0}
    except Exception as e:
        logger.error(f"Error fetching dashboard metrics: {e}")
        return {"total_products": 0, "total_customers": 0, "total_orders": 0, "low_stock_count": 0}
