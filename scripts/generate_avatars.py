from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path
import random

# Tutor data
tutors = [
    "director",
    "counselor",
    "science head",
]

# Configuration
IMAGE_SIZE = (400, 400)  # Larger size for better quality
FONT_SIZE = 150
OUTPUT_DIR = Path("../public/team")

# Color palette (professional colors)
COLORS = [
    ("#1a365d", "#ffffff"),  # Dark blue
    ("#2c5282", "#ffffff"),  # Navy blue
    ("#2b6cb0", "#ffffff"),  # Medium blue
    ("#3182ce", "#ffffff"),  # Blue
    ("#4299e1", "#ffffff"),  # Light blue
    ("#63b3ed", "#ffffff"),  # Lighter blue
    ("#144e4e", "#ffffff"),  # Dark teal
    ("#1a5e5e", "#ffffff"),  # Teal
    ("#246e6e", "#ffffff"),  # Light teal
]

def create_directory():
    """Create output directory if it doesn't exist"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def get_initials(name):
    """Get initials from name"""
    parts = name.split()
    return ''.join(part[0].upper() for part in parts if part)

def create_avatar(name, output_path):
    """Create an avatar for a given name"""
    # Create image with random background color
    bg_color, text_color = random.choice(COLORS)
    image = Image.new('RGB', IMAGE_SIZE, bg_color)
    draw = ImageDraw.Draw(image)

    try:
        # Try to load Arial font
        font = ImageFont.truetype("arial.ttf", FONT_SIZE)
    except IOError:
        # Fallback to default font
        font = ImageFont.load_default()

    # Get text and size
    initials = get_initials(name)
    text_bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    # Calculate center position
    x = (IMAGE_SIZE[0] - text_width) // 2
    y = (IMAGE_SIZE[1] - text_height) // 2

    # Draw text
    draw.text((x, y), initials, fill=text_color, font=font)

    # Save image
    image.save(output_path, 'PNG', quality=95)

def main():
    """Main function to generate all avatars"""
    create_directory()
    
    for tutor in tutors:
        # Convert name to filename format
        filename = tutor.lower().replace(' ', '-') + '.jpg'
        output_path = OUTPUT_DIR / filename
        
        print(f"Generating avatar for {tutor}...")
        create_avatar(tutor, output_path)
        print(f"Created {output_path}")

if __name__ == "__main__":
    main()
