# Continuous Delivery Pipeline using GitHub Actions

## CI/CD Pipeline

```yaml
name: Python CI/CD Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run tests
        run: |
          python -m unittest discover

      - name: Lint code
        run: |
          pip install flake8
          flake8 .

      - name: Package application
        run: |
          python setup.py sdist

      - name: Deploy application
        run: |
          chmod +x deploy.sh
          ./deploy.sh
```

## Python App

```python
# Application Code

def add(a, b):
    return a + b

if __name__ == "__main__":
    print(add(2, 3))
```

## Packaging Script

```python
from setuptools import setup

setup(
    name="demo-app",
    version="1.0",
    py_modules=["app"],
)
```

## Deployment Script

```bash
#!/bin/bash

echo "Starting deployment process..."
echo "Building application..."
echo "Running deployment steps..."
echo "Deployment successful!"
```
