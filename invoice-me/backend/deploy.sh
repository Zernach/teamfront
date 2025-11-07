#!/bin/bash

set -e  # Exit on error

echo "Building invoice-me backend..."
mvn clean package

echo "Copying JAR to root directory..."
cp target/invoice-me-backend-1.0.0.jar ./invoice-me-backend-1.0.0.jar

echo "Deploying to Elastic Beanstalk..."
eb deploy teamfront-invoice-me-archlife

echo "Deployment complete!"

