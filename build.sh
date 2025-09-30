#!/bin/bash

# Build script for AI Interview Assistant
echo "🚀 Building AI Interview Assistant..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run build
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build successful! Files are ready in the build/ directory"
    echo "📁 Build size:"
    du -sh build/
    echo ""
    echo "🌐 Ready for deployment to:"
    echo "   • Vercel: vercel --prod"
    echo "   • Netlify: netlify deploy --prod --dir=build"
    echo "   • GitHub Pages: npm run deploy (after setting up gh-pages)"
else
    echo "❌ Build failed!"
    exit 1
fi