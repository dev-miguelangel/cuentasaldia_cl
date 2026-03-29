"""
Genera og-image.png (1200x630) para Cuentas al Día.
Uso: python3 generate_og_image.py
"""

from PIL import Image, ImageDraw, ImageFont
import math

W, H = 1200, 630

# ── Colores del proyecto ───────────────────────────────────────────────────────
BLUE_DARK  = (0,   82,  204)   # #0052cc
BLUE_MID   = (0,  121,  191)   # #0079bf
BLUE_LIGHT = (0,  174,  204)   # #00aecc
GREEN      = (54, 179,  126)   # #36b37e
WHITE      = (255, 255, 255)
TEXT_DARK  = (23,  43,   77)   # #172b4d


# ── Gradiente diagonal (igual que el hero de la landing) ─────────────────────
def make_gradient(w, h):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        for x in range(w):
            t = (x / w * 0.6 + y / h * 0.4)           # diagonal 150°
            t = max(0.0, min(1.0, t))
            if t < 0.5:
                r = int(BLUE_DARK[0]  + (BLUE_MID[0]  - BLUE_DARK[0])  * t * 2)
                g = int(BLUE_DARK[1]  + (BLUE_MID[1]  - BLUE_DARK[1])  * t * 2)
                b = int(BLUE_DARK[2]  + (BLUE_MID[2]  - BLUE_DARK[2])  * t * 2)
            else:
                t2 = (t - 0.5) * 2
                r = int(BLUE_MID[0]  + (BLUE_LIGHT[0] - BLUE_MID[0])  * t2)
                g = int(BLUE_MID[1]  + (BLUE_LIGHT[1] - BLUE_MID[1])  * t2)
                b = int(BLUE_MID[2]  + (BLUE_LIGHT[2] - BLUE_MID[2])  * t2)
            draw.point((x, y), fill=(r, g, b))
    return img


# ── Intenta cargar fuente del sistema, cae back a default ────────────────────
def load_font(size, bold=False):
    candidates_bold = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay-Bold.otf",
        "/System/Library/Fonts/SFCompact-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSText-Regular.otf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in (candidates_bold if bold else candidates):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()


# ── Dibuja rectángulo redondeado ──────────────────────────────────────────────
def rounded_rect(draw, xy, radius, fill, alpha=255):
    x0, y0, x1, y1 = xy
    r = min(radius, (x1 - x0) // 2, (y1 - y0) // 2)
    if r <= 0:
        draw.rectangle([x0, y0, x1, y1], fill=fill)
        return
    draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*r, y0 + 2*r], fill=fill)
    draw.ellipse([x1 - 2*r, y0, x1, y0 + 2*r], fill=fill)
    draw.ellipse([x0, y1 - 2*r, x0 + 2*r, y1], fill=fill)
    draw.ellipse([x1 - 2*r, y1 - 2*r, x1, y1], fill=fill)


# ── Dibuja el ícono de calendario con check ───────────────────────────────────
def draw_calendar_icon(draw, cx, cy, size):
    s = size
    # Cuerpo del calendario (azul claro)
    body_color = (219, 234, 254)   # #dbeafe
    rounded_rect(draw, [cx - s//2, cy - s//2 + 4, cx + s//2, cy + s//2], 10, body_color)
    # Cabecera (azul oscuro)
    header_color = BLUE_DARK
    rounded_rect(draw, [cx - s//2, cy - s//2 + 4, cx + s//2, cy - s//2 + 4 + s//3], 10, header_color)
    draw.rectangle([cx - s//2, cy - s//2 + 4 + 10, cx + s//2, cy - s//2 + 4 + s//3], fill=header_color)
    # Aritos (azul medio)
    ring_color = BLUE_MID
    rx = s // 5
    ry_top = cy - s//2
    ry_bot = cy - s//2 + 4 + s//5
    rounded_rect(draw, [cx - rx - 4, ry_top, cx - rx + 4, ry_bot], 4, ring_color)
    rounded_rect(draw, [cx + rx - 4, ry_top, cx + rx + 4, ry_bot], 4, ring_color)
    # Check (verde)
    check_color = GREEN
    lw = max(3, s // 12)
    p1 = (cx - s//5, cy + s//10)
    p2 = (cx - s//20, cy + s//4)
    p3 = (cx + s//4, cy - s//8)
    draw.line([p1, p2], fill=check_color, width=lw)
    draw.line([p2, p3], fill=check_color, width=lw)


# ── Dibuja mini tarjeta Kanban ────────────────────────────────────────────────
def draw_kanban_card(draw, x, y, w, title, tag, tag_color, amount):
    h = 62
    rounded_rect(draw, [x, y, x + w, y + h], 8, WHITE)
    f_title = load_font(13, bold=True)
    f_tag   = load_font(10, bold=True)
    f_amt   = load_font(12)
    draw.text((x + 10, y + 10), title,  font=f_title, fill=TEXT_DARK)
    rounded_rect(draw, [x + 10, y + 30, x + 10 + len(tag) * 7 + 14, y + 46], 4, tag_color)
    draw.text((x + 17, y + 33), tag, font=f_tag, fill=WHITE)
    draw.text((x + w - 60, y + 32), amount, font=f_amt, fill=(94, 108, 132))


# ── Canvas principal ──────────────────────────────────────────────────────────
img  = make_gradient(W, H)
draw = ImageDraw.Draw(img)

# Overlay sutil para profundidad
overlay = Image.new("RGBA", (W, H), (0, 0, 0, 30))
img.paste(Image.new("RGB", (W, H), (0, 0, 0)), mask=overlay.split()[3])

draw = ImageDraw.Draw(img)

# ── Panel derecho (mock kanban) ───────────────────────────────────────────────
panel_x, panel_y = 680, 60
panel_w, panel_h = 470, 510
rounded_rect(draw, [panel_x, panel_y, panel_x + panel_w, panel_y + panel_h], 18,
             (255, 255, 255, 20))

# Usamos un color semitransparente aproximado
draw.rectangle([panel_x, panel_y, panel_x + panel_w, panel_y + panel_h],
               fill=(0, 52, 120))
# re-draw redondeado encima
rounded_rect(draw, [panel_x, panel_y, panel_x + panel_w, panel_y + panel_h], 18,
             (10, 60, 130))

# Columnas Kanban
col_titles  = ["Por Pagar", "Carrito", "Pagado"]
col_colors  = [(255, 153, 31), (79, 195, 247), (54, 179, 126)]
col_x_start = panel_x + 16
col_w       = 138
col_gap     = 10

f_col = load_font(11, bold=True)

cards = [
    [("Internet Hogar", "VITAL",    (222, 53, 11),   "$29.990"),
     ("Netflix",        "GUSTO",    (0,  121, 191),  "$8.490"),
     ("Revista",        "CAPRICHO", (101, 84, 192),  "$4.990")],
    [("Supermercado",   "VITAL",    (222, 53, 11),   "$32.000"),
     ("Zapatillas",     "CAPRICHO", (101, 84, 192),  "$12.800")],
    [("Arriendo",       "VITAL",    (222, 53, 11),   "$55.000"),
     ("Spotify",        "GUSTO",    (0,  121, 191),  "$5.990")],
]

for i, (col_title, col_color) in enumerate(zip(col_titles, col_colors)):
    cx = col_x_start + i * (col_w + col_gap)
    # Header de columna
    rounded_rect(draw, [cx, panel_y + 16, cx + col_w, panel_y + 38], 6, col_color)
    draw.text((cx + 8, panel_y + 20), col_title, font=f_col, fill=WHITE)
    # Tarjetas
    card_y = panel_y + 50
    for title, tag, tag_color, amount in cards[i]:
        draw_kanban_card(draw, cx, card_y, col_w, title, tag, tag_color, amount)
        card_y += 72

# ── Lado izquierdo: contenido principal ──────────────────────────────────────
LEFT = 72

# Ícono de calendario
draw_calendar_icon(draw, LEFT + 32, 108, 56)

# Nombre de la app
f_brand = load_font(22, bold=True)
draw.text((LEFT + 68, 88), "Cuentas al Día", font=f_brand, fill=WHITE)

# Badge "100% Gratis · Sin Registro · Offline"
badge_text = "100% Gratis · Sin Registro · Funciona Offline"
f_badge = load_font(13)
bw = len(badge_text) * 7 + 28
rounded_rect(draw, [LEFT, 150, LEFT + bw, 178], 14,
             (255, 255, 255, 40))
draw.rectangle([LEFT, 162, LEFT + bw, 178], fill=(30, 80, 160))
rounded_rect(draw, [LEFT, 150, LEFT + bw, 178], 14, (30, 80, 160))
draw.ellipse([LEFT + 10, 158, LEFT + 20, 168], fill=GREEN)
draw.text((LEFT + 26, 155), badge_text, font=f_badge,
          fill=(255, 255, 255))

# Headline principal
f_h1_big = load_font(56, bold=True)
f_h1_em  = load_font(52, bold=True)

draw.text((LEFT, 200), "Tus gastos", font=f_h1_big, fill=WHITE)
draw.text((LEFT, 258), "organizados", font=f_h1_big, fill=WHITE)

# "en segundos." en verde
draw.text((LEFT, 316), "en segundos.", font=f_h1_em, fill=GREEN)

# Subtítulo
f_sub = load_font(17)
sub1 = "Tablero Kanban visual · Sin registro"
sub2 = "Comparte por QR · Funciona offline"
draw.text((LEFT, 395), sub1, font=f_sub, fill=(200, 220, 255))
draw.text((LEFT, 420), sub2, font=f_sub, fill=(200, 220, 255))

# CTA button
btn_x, btn_y, btn_w, btn_h = LEFT, 460, 210, 50
rounded_rect(draw, [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], 12, WHITE)
f_btn = load_font(16, bold=True)
draw.text((btn_x + 28, btn_y + 16), "Probar Gratis →", font=f_btn, fill=BLUE_DARK)

# Dominio
f_domain = load_font(14)
draw.text((LEFT, 530), "cuentasaldia.cl", font=f_domain,
          fill=(180, 210, 255))

# ── Guardar ───────────────────────────────────────────────────────────────────
out = "og-image.png"
img.save(out, "PNG", optimize=True)
print(f"✓ Imagen guardada: {out} ({W}×{H}px)")
