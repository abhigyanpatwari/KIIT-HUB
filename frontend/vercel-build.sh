#!/bin/bash
# Custom build script for KiitHub frontend deployment

# Install dependencies
npm install

# Build the application
npm run build

# Any additional post-build operations can go here
# For example, copying custom files or configurations 