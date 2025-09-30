from flask import Blueprint, jsonify
import redis
import os
from datetime import datetime

health_bp = Blueprint('health', __name__)

def check_redis_connection():
    try:
        redis_client = redis.from_url(os.getenv('REDIS_URL'))
        redis_client.ping()
        return True
    except:
        return False

@health_bp.route('/health')
def health_check():
    redis_status = check_redis_connection()
    
    status = 'healthy' if redis_status else 'unhealthy'
    http_status = 200 if redis_status else 503
    
    response = {
        'status': status,
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'redis': 'connected' if redis_status else 'disconnected'
        }
    }
    
    return jsonify(response), http_status