#!/usr/bin/env python3
"""
Download Algorithm Case Images for rubiX
This script downloads case images for OLL, PLL, and F2L algorithms from various sources.
"""

import os
import requests
import time
from pathlib import Path

# Base directory for images
BASE_DIR = Path("frontend/public/assets/images/algorithms")

# Image sources and mappings
ALGORITHM_IMAGES = {
    # OLL Cases - Using publicly available algorithm case images
    "oll": {
        1: "https://www.speedsolving.com/wiki/images/thumb/4/4f/OLL01.png/100px-OLL01.png",
        21: "https://www.speedsolving.com/wiki/images/thumb/a/a8/OLL21.png/100px-OLL21.png", 
        22: "https://www.speedsolving.com/wiki/images/thumb/f/f4/OLL22.png/100px-OLL22.png",
        23: "https://www.speedsolving.com/wiki/images/thumb/e/e4/OLL23.png/100px-OLL23.png",
        26: "https://www.speedsolving.com/wiki/images/thumb/c/c8/OLL26.png/100px-OLL26.png",
        27: "https://www.speedsolving.com/wiki/images/thumb/1/1e/OLL27.png/100px-OLL27.png",
        44: "https://www.speedsolving.com/wiki/images/thumb/9/9a/OLL44.png/100px-OLL44.png",
        45: "https://www.speedsolving.com/wiki/images/thumb/b/b5/OLL45.png/100px-OLL45.png",
    },
    
    # PLL Cases - Using publicly available algorithm case images  
    "pll": {
        1: "https://www.speedsolving.com/wiki/images/thumb/f/f1/PLL-Aa.png/100px-PLL-Aa.png",
        2: "https://www.speedsolving.com/wiki/images/thumb/a/a7/PLL-Ab.png/100px-PLL-Ab.png",
        4: "https://www.speedsolving.com/wiki/images/thumb/8/8f/PLL-H.png/100px-PLL-H.png",
        5: "https://www.speedsolving.com/wiki/images/thumb/d/d1/PLL-Ua.png/100px-PLL-Ua.png",
        6: "https://www.speedsolving.com/wiki/images/thumb/0/0c/PLL-Ub.png/100px-PLL-Ub.png",
        8: "https://www.speedsolving.com/wiki/images/thumb/c/c7/PLL-T.png/100px-PLL-T.png",
    }
}

def download_image(url, filepath):
    """Download an image from URL to filepath"""
    try:
        print(f"Downloading {url} -> {filepath}")
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Write image data
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"✅ Downloaded: {filepath}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def create_placeholder_image(filepath, algorithm_set, case_number):
    """Create a simple SVG placeholder image for cases without downloaded images"""
    try:
        # Create directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Create simple SVG placeholder
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#f0f0f0" stroke="#ccc" stroke-width="2"/>
  <text x="50" y="35" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#666">
    {algorithm_set.upper()}
  </text>
  <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#333">
    {case_number}
  </text>
  <text x="50" y="75" text-anchor="middle" font-family="Arial" font-size="8" fill="#999">
    Case Image
  </text>
</svg>'''
        
        # Change extension to .svg for placeholder
        svg_filepath = filepath.with_suffix('.svg')
        with open(svg_filepath, 'w') as f:
            f.write(svg_content)
        
        print(f"📝 Created placeholder: {svg_filepath}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to create placeholder {filepath}: {e}")
        return False

def main():
    """Main function to download all algorithm images"""
    print("🎯 Starting algorithm image download...")
    
    downloaded_count = 0
    placeholder_count = 0
    
    # Download images from known sources
    for algorithm_set, images in ALGORITHM_IMAGES.items():
        print(f"\n📁 Processing {algorithm_set.upper()} images...")
        
        for case_number, url in images.items():
            filepath = BASE_DIR / algorithm_set / f"{algorithm_set}-{case_number}.png"
            
            if download_image(url, filepath):
                downloaded_count += 1
            
            # Add small delay to be respectful to servers
            time.sleep(0.5)
    
    # Create placeholders for remaining cases
    print(f"\n📝 Creating placeholders for remaining cases...")
    
    # OLL placeholders (cases 1-57)
    for case_num in range(1, 58):
        filepath = BASE_DIR / "oll" / f"oll-{case_num}.png"
        svg_filepath = BASE_DIR / "oll" / f"oll-{case_num}.svg"
        
        if not filepath.exists() and not svg_filepath.exists():
            if create_placeholder_image(filepath, "oll", case_num):
                placeholder_count += 1
    
    # PLL placeholders (cases 1-21)  
    for case_num in range(1, 22):
        filepath = BASE_DIR / "pll" / f"pll-{case_num}.png"
        svg_filepath = BASE_DIR / "pll" / f"pll-{case_num}.svg"
        
        if not filepath.exists() and not svg_filepath.exists():
            if create_placeholder_image(filepath, "pll", case_num):
                placeholder_count += 1
    
    # F2L placeholders (cases 1-41)
    for case_num in range(1, 42):
        filepath = BASE_DIR / "f2l" / f"f2l-{case_num}.png"  
        svg_filepath = BASE_DIR / "f2l" / f"f2l-{case_num}.svg"
        
        if not filepath.exists() and not svg_filepath.exists():
            if create_placeholder_image(filepath, "f2l", case_num):
                placeholder_count += 1
    
    # Other algorithm sets
    for algorithm_set in ["cross", "zbll", "coll", "wv"]:
        for case_num in range(1, 6):  # Assuming max 5 cases for these sets
            filepath = BASE_DIR / algorithm_set / f"{algorithm_set}-{case_num}.png"
            svg_filepath = BASE_DIR / algorithm_set / f"{algorithm_set}-{case_num}.svg"
            
            if not filepath.exists() and not svg_filepath.exists():
                if create_placeholder_image(filepath, algorithm_set, case_num):
                    placeholder_count += 1
    
    print(f"\n✅ Image download complete!")
    print(f"📥 Downloaded images: {downloaded_count}")
    print(f"📝 Created placeholders: {placeholder_count}")
    print(f"📁 Images stored in: {BASE_DIR}")
    
    print(f"\n📋 Next steps:")
    print(f"1. Replace placeholder SVGs with actual case images")
    print(f"2. Update database image URLs to point to correct files")
    print(f"3. Test frontend display of images")

if __name__ == "__main__":
    main()
