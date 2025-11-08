#!/bin/bash

set -e  # Exit on error

# Function to clean build artifacts from root directory (but keep obj/ for NuGet restore)
clean_root() {
    echo "Cleaning build artifacts from root directory..."
    # Remove all build artifacts but keep source files, config, and obj/ (needed for NuGet restore)
    find . -maxdepth 1 -type f \( -name "*.dll" -o -name "*.so" -o -name "*.pdb" -o -name "SmartScheduler" -o -name "createdump" -o -name "*.runtimeconfig.json" -o -name "*.deps.json" -o -name "*.staticwebassets.endpoints.json" \) -delete 2>/dev/null || true
    rm -rf bin/ 2>/dev/null || true
    # Note: obj/ is kept because it contains NuGet restore files needed for build
}

echo "Cleaning up old deployment files..."
clean_root
rm -rf publish/

echo "Restoring NuGet packages..."
dotnet restore

# Clean up any files created during restore
clean_root

echo "Publishing smart-scheduler backend as self-contained deployment..."
# Create publish directory first
mkdir -p ./publish

# Publish directly to publish/ with MSBuild properties to prevent files in root
# Use absolute path to avoid any relative path issues
PUBLISH_DIR=$(cd ./publish && pwd)
OBJ_DIR=$(pwd)/obj
dotnet publish -c Release -r linux-x64 --self-contained true \
  -o "$PUBLISH_DIR" \
  -p:BaseOutputPath="$PUBLISH_DIR/" \
  -p:OutputPath="$PUBLISH_DIR/" \
  -p:OutDir="$PUBLISH_DIR/" \
  -p:BaseIntermediateOutputPath="$OBJ_DIR/" \
  -p:IntermediateOutputPath="$OBJ_DIR/"

# Aggressively clean up any files that might have been created in root during build
echo "Cleaning up any files created in root during publish..."
clean_root
# Double-check: remove any remaining build artifacts
find . -maxdepth 1 -type f \( -name "*.dll" -o -name "*.so" -o -name "*.pdb" -o -name "SmartScheduler" -o -name "createdump" -o -name "*.runtimeconfig.json" -o -name "*.deps.json" -o -name "*.staticwebassets.endpoints.json" \) -delete 2>/dev/null || true
rm -rf bin/ 2>/dev/null || true

# Ensure the executable has proper permissions
if [ -f "./publish/SmartScheduler" ]; then
    chmod +x ./publish/SmartScheduler
fi

# Remove web.config as it's Windows/IIS-specific and not needed for Linux Procfile deployment
rm -f ./publish/web.config

echo "Build artifacts are in ./publish/ directory"

echo "Preparing for Elastic Beanstalk deployment..."
# Copy published files to root for deployment (EB deploys from root based on .ebignore)
cp -r publish/* ./
# Ensure the executable has proper permissions
if [ -f "./SmartScheduler" ]; then
    chmod +x ./SmartScheduler
fi

echo "Deploying to Elastic Beanstalk..."
eb deploy teamfront-smart-scheduler-archlife

echo "Cleaning up build files from root after deployment..."
clean_root

echo "Deployment complete! Build artifacts remain in ./publish/ directory"
