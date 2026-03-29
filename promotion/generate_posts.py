#!/usr/bin/env python3
"""
Campaign Generator for CuentasRápidas Instagram
Generates 6 professional 1080x1080 PNG images for social media promotion
"""

from PIL import Image, ImageDraw, ImageFont
import os
from typing import Tuple
import math

# Color palette (from brand guidelines)
COLORS = {
    'primary_blue': '#0079bf',
    'dark_blue': '#0052cc',
    'light_blue': '#00aecc',
    'green': '#36b37e',
    'dark_green': '#00875a',
    'orange': '#ff991f',
    'red': '#de350b',
    'light_red': '#ffcccc',
    'purple': '#6554c0',
    'light_purple': '#e6e0ff',
    'dark_text': '#172b4d',
    'light_gray': '#f5f5f5',
    'white': '#ffffff',
    'light_blue_bg': '#e6f2ff',
}

# Image dimensions
IMG_SIZE = (1080, 1080)
OUTPUT_DIR = '/Users/miguelangelgonzalezjaimen/2026/AI/cuentashtml/clean_code/promotion'

def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Load a font with fallback handling."""
    fonts_to_try = [
        f'/System/Library/Fonts/Supplemental/Arial{"  Bold" if bold else ""}.ttf',
        f'/System/Library/Fonts/Supplemental/Arial.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/Arial.ttf',
    ]

    for font_path in fonts_to_try:
        try:
            return ImageFont.truetype(font_path, size)
        except (IOError, OSError):
            continue

    # Fallback to default font if nothing found
    return ImageFont.load_default()

def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(width: int, height: int, color1: str, color2: str, direction: str = 'diagonal') -> Image.Image:
    """Create a gradient background image."""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)

    c1 = hex_to_rgb(color1)
    c2 = hex_to_rgb(color2)

    if direction == 'diagonal':
        for y in range(height):
            for x in range(width):
                ratio = (x + y) / (width + height)
                r = int(c1[0] + (c2[0] - c1[0]) * ratio)
                g = int(c1[1] + (c2[1] - c1[1]) * ratio)
                b = int(c1[2] + (c2[2] - c1[2]) * ratio)
                draw.point((x, y), fill=(r, g, b))
    elif direction == 'vertical':
        for y in range(height):
            ratio = y / height
            r = int(c1[0] + (c2[0] - c1[0]) * ratio)
            g = int(c1[1] + (c2[1] - c1[1]) * ratio)
            b = int(c1[2] + (c2[2] - c1[2]) * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))
    elif direction == 'horizontal':
        for x in range(width):
            ratio = x / width
            r = int(c1[0] + (c2[0] - c1[0]) * ratio)
            g = int(c1[1] + (c2[1] - c1[1]) * ratio)
            b = int(c1[2] + (c2[2] - c1[2]) * ratio)
            draw.line([(x, 0), (x, height)], fill=(r, g, b))

    return img

def draw_rounded_rectangle(draw, xy, radius: int = 20, fill: str = None, outline: str = None, width: int = 1):
    """Draw a rounded rectangle."""
    x1, y1, x2, y2 = xy
    fill_rgb = hex_to_rgb(fill) if fill else None
    outline_rgb = hex_to_rgb(outline) if outline else None

    # Draw corners
    for angle in [0, 90, 180, 270]:
        if angle == 0:
            bbox = (x2 - radius * 2, y1, x2, y1 + radius * 2)
        elif angle == 90:
            bbox = (x1, y1, x1 + radius * 2, y1 + radius * 2)
        elif angle == 180:
            bbox = (x1, y2 - radius * 2, x1 + radius * 2, y2)
        else:  # 270
            bbox = (x2 - radius * 2, y2 - radius * 2, x2, y2)
        draw.arc(bbox, angle, angle + 90, fill=outline_rgb, width=width)

    # Draw rectangles for straight sections
    draw.rectangle((x1 + radius, y1, x2 - radius, y2), fill=fill_rgb, outline=outline_rgb, width=width)
    draw.rectangle((x1, y1 + radius, x2, y2 - radius), fill=fill_rgb, outline=outline_rgb, width=width)

def post_01_hero() -> Image.Image:
    """Post 1 - Hero/Presentación"""
    img = create_gradient_background(IMG_SIZE[0], IMG_SIZE[1], COLORS['dark_blue'], COLORS['light_blue'], 'diagonal')
    draw = ImageDraw.Draw(img, 'RGBA')

    # Decorative circles
    circle_color = hex_to_rgb(COLORS['light_blue'])
    draw.ellipse([80, 80, 280, 280], fill=(circle_color[0], circle_color[1], circle_color[2], 80))
    draw.ellipse([820, 750, 1000, 930], fill=(circle_color[0], circle_color[1], circle_color[2], 60))

    # Decorative lines
    line_color = hex_to_rgb(COLORS['white'])
    draw.line([100, 100, 400, 150], fill=(line_color[0], line_color[1], line_color[2], 150), width=3)
    draw.line([700, 900, 1000, 950], fill=(line_color[0], line_color[1], line_color[2], 100), width=2)

    # Main headline
    font_large = load_font(90, bold=True)
    font_small = load_font(36)
    font_tiny = load_font(32)

    text_main = "Tus gastos\norganizados\nen segundos."
    text_sub = "Sin registro · Sin servidor · Gratis"

    # Draw main text (centered)
    y_offset = 250
    for line in text_main.split('\n'):
        bbox = draw.textbbox((0, 0), line, font=font_large)
        text_width = bbox[2] - bbox[0]
        x = (IMG_SIZE[0] - text_width) // 2
        draw.text((x, y_offset), line, fill=COLORS['white'], font=font_large)
        y_offset += 110

    # Subtitle
    bbox = draw.textbbox((0, 0), text_sub, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 640), text_sub, fill=COLORS['light_blue'], font=font_small)

    # App name at bottom
    app_name = "CuentasRápidas"
    bbox = draw.textbbox((0, 0), app_name, font=font_tiny)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 950), app_name, fill=COLORS['white'], font=font_tiny)

    return img

def post_02_sin_registro() -> Image.Image:
    """Post 2 - Feature: Sin Registro"""
    img = Image.new('RGB', IMG_SIZE, hex_to_rgb(COLORS['white']))
    draw = ImageDraw.Draw(img)

    # Accent bar on left
    draw.rectangle([0, 0, 15, IMG_SIZE[1]], fill=hex_to_rgb(COLORS['primary_blue']))

    # Decorative circles
    circle_blue = hex_to_rgb(COLORS['light_blue'])
    draw.ellipse([800, 50, 1050, 300], fill=(circle_blue[0], circle_blue[1], circle_blue[2], 40))
    draw.ellipse([50, 850, 250, 1050], fill=(circle_blue[0], circle_blue[1], circle_blue[2], 30))

    font_large = load_font(85, bold=True)
    font_medium = load_font(42)
    font_small = load_font(34)
    font_badge = load_font(32, bold=True)

    # Draw pencil icon (simplified)
    icon_y = 180
    icon_x = 540
    pencil_color = hex_to_rgb(COLORS['primary_blue'])
    draw.polygon(
        [(icon_x, icon_y), (icon_x + 80, icon_y + 80), (icon_x + 40, icon_y + 120), (icon_x - 40, icon_y + 40)],
        fill=pencil_color
    )
    draw.ellipse([icon_x - 30, icon_y - 30, icon_x + 30, icon_y + 30], outline=pencil_color, width=2)

    # Main headline
    text_main = "Solo escribe\ntu nombre."
    y_offset = 380
    for line in text_main.split('\n'):
        bbox = draw.textbbox((0, 0), line, font=font_large)
        text_width = bbox[2] - bbox[0]
        x = (IMG_SIZE[0] - text_width) // 2
        draw.text((x, y_offset), line, fill=COLORS['dark_text'], font=font_large)
        y_offset += 100

    # Subtitle
    text_sub = "Nada de emails. Nada de contraseñas.\nEn 5 segundos ya estás adentro."
    y_offset = 650
    for line in text_sub.split('\n'):
        bbox = draw.textbbox((0, 0), line, font=font_medium)
        text_width = bbox[2] - bbox[0]
        x = (IMG_SIZE[0] - text_width) // 2
        draw.text((x, y_offset), line, fill=COLORS['dark_blue'], font=font_medium)
        y_offset += 55

    # Badge "100% Gratis"
    badge_x, badge_y = 540, 850
    badge_width, badge_height = 280, 80
    draw.rectangle(
        [badge_x - badge_width//2, badge_y - badge_height//2,
         badge_x + badge_width//2, badge_y + badge_height//2],
        fill=hex_to_rgb(COLORS['light_blue']),
        outline=hex_to_rgb(COLORS['primary_blue']),
        width=3
    )
    badge_text = "100% Gratis"
    bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    text_width = bbox[2] - bbox[0]
    draw.text((badge_x - text_width//2, badge_y - 20), badge_text, fill=COLORS['primary_blue'], font=font_badge)

    return img

def post_03_kanban() -> Image.Image:
    """Post 3 - Feature: Kanban Visual"""
    img = Image.new('RGB', IMG_SIZE, hex_to_rgb(COLORS['dark_text']))
    draw = ImageDraw.Draw(img)

    font_large = load_font(70, bold=True)
    font_medium = load_font(32)
    font_small = load_font(24)

    # Headline
    headline = "Tu tablero Kanban"
    subline = "personal"
    bbox = draw.textbbox((0, 0), headline, font=font_large)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 80), headline, fill=COLORS['white'], font=font_large)

    bbox = draw.textbbox((0, 0), subline, font=font_large)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 170), subline, fill=COLORS['light_blue'], font=font_large)

    # Draw Kanban columns
    col_width = 300
    col_height = 600
    col_y = 320
    col_spacing = 30

    columns_data = [
        ("Por Pagar", [("Arriendo", COLORS['red']), ("Internet", COLORS['red'])]),
        ("Carrito", [("Despensa", COLORS['primary_blue']), ("Dulces", COLORS['purple'])]),
        ("Pagado", [("Luz", COLORS['green']), ("Gas", COLORS['green'])])
    ]

    col_x = 60
    for col_title, items in columns_data:
        # Column background
        col_bg = hex_to_rgb(COLORS['light_gray'])
        draw.rectangle(
            [col_x, col_y, col_x + col_width, col_y + col_height],
            fill=col_bg,
            outline=hex_to_rgb(COLORS['light_blue']),
            width=2
        )

        # Column title
        bbox = draw.textbbox((0, 0), col_title, font=font_medium)
        text_width = bbox[2] - bbox[0]
        title_x = col_x + (col_width - text_width) // 2
        draw.text((title_x, col_y + 20), col_title, fill=COLORS['dark_text'], font=font_medium)

        # Cards
        card_y = col_y + 80
        for card_text, card_color in items:
            card_color_rgb = hex_to_rgb(card_color)
            draw.rectangle(
                [col_x + 15, card_y, col_x + col_width - 15, card_y + 80],
                fill=(255, 255, 255),
                outline=card_color_rgb,
                width=2
            )
            bbox = draw.textbbox((0, 0), card_text, font=font_small)
            text_width = bbox[2] - bbox[0]
            card_text_x = col_x + (col_width - text_width) // 2
            draw.text((card_text_x, card_y + 25), card_text, fill=COLORS['dark_text'], font=font_small)
            card_y += 100

        col_x += col_width + col_spacing

    return img

def post_04_compartir() -> Image.Image:
    """Post 4 - Feature: Compartir"""
    img = create_gradient_background(IMG_SIZE[0], IMG_SIZE[1], COLORS['green'], COLORS['dark_green'], 'vertical')
    draw = ImageDraw.Draw(img, 'RGBA')

    font_large = load_font(75, bold=True)
    font_medium = load_font(40)
    font_small = load_font(32)

    # Headline
    headline = "Comparte tus gastos"
    subline = "con tu pareja"
    y_offset = 150
    for line, font in [(headline, font_large), (subline, font_large)]:
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (IMG_SIZE[0] - text_width) // 2
        draw.text((x, y_offset), line, fill=COLORS['white'], font=font)
        y_offset += 90

    # Draw QR icon (simplified grid)
    qr_x, qr_y = 540, 450
    qr_size = 200
    qr_color = hex_to_rgb(COLORS['white'])
    cell_size = qr_size // 4

    # QR pattern
    pattern = [
        [1, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [1, 1, 1, 1]
    ]

    for i, row in enumerate(pattern):
        for j, cell in enumerate(row):
            if cell:
                x = qr_x - qr_size//2 + j * cell_size
                y = qr_y - qr_size//2 + i * cell_size
                draw.rectangle([x, y, x + cell_size, y + cell_size], fill=qr_color)

    # Subtitle
    text_sub = "Por QR, WhatsApp o URL\nSin cuenta. Sin servidor."
    y_offset = 720
    for line in text_sub.split('\n'):
        bbox = draw.textbbox((0, 0), line, font=font_medium)
        text_width = bbox[2] - bbox[0]
        x = (IMG_SIZE[0] - text_width) // 2
        draw.text((x, y_offset), line, fill=COLORS['white'], font=font_medium)
        y_offset += 60

    # Icons at bottom
    icons_text = "📱    💬    🔗"
    bbox = draw.textbbox((0, 0), icons_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 900), icons_text, fill=COLORS['white'], font=font_large)

    return img

def post_05_prioridades() -> Image.Image:
    """Post 5 - Feature: Prioridades"""
    img = Image.new('RGB', IMG_SIZE, hex_to_rgb(COLORS['light_gray']))
    draw = ImageDraw.Draw(img)

    font_large = load_font(70, bold=True)
    font_medium = load_font(32)
    font_small = load_font(28)

    # Headline
    headline = "¿Qué cortar"
    subline = "cuándo aprieta el mes?"
    y_offset = 60
    bbox = draw.textbbox((0, 0), headline, font=font_large)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, y_offset), headline, fill=COLORS['dark_text'], font=font_large)

    y_offset += 85
    bbox = draw.textbbox((0, 0), subline, font=font_large)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, y_offset), subline, fill=COLORS['dark_text'], font=font_large)

    # Three priority cards
    cards = [
        ("VITAL", "Arriendo, luz,\nalimentación", COLORS['red'], COLORS['light_red']),
        ("GUSTO", "Streaming, gym,\nsalidas", COLORS['primary_blue'], COLORS['light_blue_bg']),
        ("CAPRICHO", "Gadgets y\ngustitos", COLORS['purple'], COLORS['light_purple'])
    ]

    card_width = 300
    card_height = 280
    card_y = 320
    cards_x_start = 90
    card_spacing = 25

    for idx, (title, description, bg_color, title_color) in enumerate(cards):
        card_x = cards_x_start + idx * (card_width + card_spacing)

        # Card background
        draw.rectangle(
            [card_x, card_y, card_x + card_width, card_y + card_height],
            fill=hex_to_rgb(title_color),
            outline=hex_to_rgb(bg_color),
            width=3
        )

        # Title
        bbox = draw.textbbox((0, 0), title, font=font_medium)
        text_width = bbox[2] - bbox[0]
        title_x = card_x + (card_width - text_width) // 2
        draw.text((title_x, card_y + 30), title, fill=hex_to_rgb(bg_color), font=font_medium)

        # Description
        desc_y = card_y + 100
        for line in description.split('\n'):
            bbox = draw.textbbox((0, 0), line, font=font_small)
            text_width = bbox[2] - bbox[0]
            line_x = card_x + (card_width - text_width) // 2
            draw.text((line_x, desc_y), line, fill=hex_to_rgb(bg_color), font=font_small)
            desc_y += 45

    # Emoji indicators at bottom
    emojis = "🔴          🔵          🟣"
    bbox = draw.textbbox((0, 0), emojis, font=font_large)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 850), emojis, fill=COLORS['dark_text'], font=font_large)

    return img

def post_06_cta() -> Image.Image:
    """Post 6 - CTA Final"""
    img = create_gradient_background(IMG_SIZE[0], IMG_SIZE[1], COLORS['dark_blue'], COLORS['primary_blue'], 'vertical')
    draw = ImageDraw.Draw(img, 'RGBA')

    font_huge = load_font(100, bold=True)
    font_large = load_font(60, bold=True)
    font_medium = load_font(40)
    font_small = load_font(32)

    # Decorative elements
    circle_color = hex_to_rgb(COLORS['light_blue'])
    draw.ellipse([100, 100, 350, 350], fill=(circle_color[0], circle_color[1], circle_color[2], 80))
    draw.ellipse([750, 800, 950, 1000], fill=(circle_color[0], circle_color[1], circle_color[2], 60))

    # Main CTA
    cta_text = "Pruébalo"
    subtext = "gratis hoy."

    y_offset = 250
    for line in [cta_text, subtext]:
        bbox = draw.textbbox((0, 0), line, font=font_huge)
        text_width = bbox[2] - bbox[0]
        x = (IMG_SIZE[0] - text_width) // 2
        draw.text((x, y_offset), line, fill=COLORS['white'], font=font_huge)
        y_offset += 120

    # CTA Button
    button_y = 650
    button_width = 500
    button_height = 100
    button_x = (IMG_SIZE[0] - button_width) // 2

    # Button background
    draw.rectangle(
        [button_x, button_y, button_x + button_width, button_y + button_height],
        fill=hex_to_rgb(COLORS['light_blue']),
        outline=hex_to_rgb(COLORS['white']),
        width=3
    )

    # Button text
    button_text = "Ir a la app"
    bbox = draw.textbbox((0, 0), button_text, font=font_large)
    text_width = bbox[2] - bbox[0]
    text_x = button_x + (button_width - text_width) // 2
    draw.text((text_x, button_y + 20), button_text, fill=COLORS['dark_blue'], font=font_large)

    # URL
    url = "cuentasrapidas.app"
    bbox = draw.textbbox((0, 0), url, font=font_medium)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 800), url, fill=COLORS['white'], font=font_medium)

    # Bottom text
    bottom_text = "Sin registro · Sin servidor · Funciona offline"
    bbox = draw.textbbox((0, 0), bottom_text, font=font_small)
    text_width = bbox[2] - bbox[0]
    x = (IMG_SIZE[0] - text_width) // 2
    draw.text((x, 920), bottom_text, fill=COLORS['light_blue'], font=font_small)

    return img

def main():
    """Generate all 6 Instagram posts."""
    print("[CuentasRápidas] Iniciando generación de posts...")

    # Create output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    posts = [
        ('post_01_hero.png', post_01_hero, 'Hero/Presentación'),
        ('post_02_sin_registro.png', post_02_sin_registro, 'Sin Registro'),
        ('post_03_kanban.png', post_03_kanban, 'Kanban Visual'),
        ('post_04_compartir.png', post_04_compartir, 'Compartir'),
        ('post_05_prioridades.png', post_05_prioridades, 'Prioridades'),
        ('post_06_cta.png', post_06_cta, 'CTA Final'),
    ]

    for filename, generator_func, description in posts:
        print(f"\n  Generando {description}...", end=' ')
        try:
            img = generator_func()
            filepath = os.path.join(OUTPUT_DIR, filename)
            img.save(filepath, 'PNG', quality=95)
            print(f"✓ Guardado en {filepath}")
        except Exception as e:
            print(f"\n  ✗ Error: {e}")
            raise

    print("\n[CuentasRápidas] Generación completada!")
    print(f"\nArchivos generados en: {OUTPUT_DIR}")

    # List generated files
    print("\nArchivos generados:")
    for filename, _, description in posts:
        filepath = os.path.join(OUTPUT_DIR, filename)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath) / 1024  # KB
            print(f"  ✓ {filename:<25} ({size:.1f} KB) - {description}")

if __name__ == '__main__':
    main()
