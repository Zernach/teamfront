#!/bin/bash

set -e  # Exit on error

echo "Building rapid-photo-upload backend..."
mvn clean package

echo "Copying JAR to root directory..."
cp target/rapid-photo-upload-backend-1.0.0.jar ./rapid-photo-upload-backend-1.0.0.jar

echo "Deploying to Elastic Beanstalk..."
eb deploy teamfront-rapid-photo-upload-archlife

echo "Deployment complete!"

