# Portfolio Simulation Service

A high-performance microservice for portfolio optimization and simulation, implementing various portfolio allocation strategies with a focus on risk management and performance optimization.

## Features

- Multiple portfolio optimization algorithms:
  - Mean-Variance Optimization (MVO)
  - Risk Parity
  - Hierarchical Risk Parity (HRP)
  - Black-Litterman Model
- Support for custom constraints and objectives
- Backtesting capabilities
- Risk metrics calculation
- Efficient frontier calculation

## Getting Started

### Prerequisites

- Python 3.9+
- pip
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/beginner-investor-hub.git
   cd services/portfolio-simulation-service
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Service

Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

The service will be available at `http://localhost:8000`

## API Documentation

Once the service is running, you can access:
- Interactive API documentation: `http://localhost:8000/docs`
- Alternative API documentation: `http://localhost:8000/redoc`

## Available Endpoints

### Portfolio Optimization
- `POST /optimize/mean-variance`: Mean-Variance Optimization
- `POST /optimize/risk-parity`: Risk Parity Allocation
- `POST /optimize/hrp`: Hierarchical Risk Parity
- `POST /optimize/black-litterman`: Black-Litterman Model

### Simulation
- `POST /simulate/monte-carlo`: Run Monte Carlo simulations
- `POST /backtest`: Backtest a strategy

### Risk Analysis
- `POST /risk/metrics`: Calculate portfolio risk metrics
- `GET /efficient-frontier`: Calculate efficient frontier

## Example Request

```python
import requests
import json

url = "http://localhost:8000/optimize/mean-variance"
payload = {
    "tickers": ["AAPL", "MSFT", "GOOGL", "AMZN"],
    "start_date": "2020-01-01",
    "end_date": "2023-01-01",
    "risk_free_rate": 0.02,
    "target_return": 0.1,
    "constraints": {
        "min_weight": 0.05,
        "max_weight": 0.4
    }
}

response = requests.post(url, json=payload)
print(json.dumps(response.json(), indent=2))
```

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

This project uses `black` for code formatting and `flake8` for linting:

```bash
black .
flake8
```

## Deployment

### Docker

Build the Docker image:
```bash
docker build -t portfolio-simulation-service .
```

Run the container:
```bash
docker run -d -p 8000:8000 portfolio-simulation-service
```

### Kubernetes

Deploy using the provided Kubernetes manifests:
```bash
kubectl apply -f k8s/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Modern Portfolio Theory by Harry Markowitz
- Risk Parity and other portfolio optimization techniques
- FastAPI for the awesome web framework
