# Campaña Instagram: CuentasRápidas
## Pack Completo de Contenido + Copy + Estrategia

**Fecha**: 19 de Marzo, 2026
**Plataforma**: Instagram Feed
**Formato**: 6 posts de 1080x1080px (PNG)
**Total de archivos**: 290 KB de imágenes optimizadas

---

## Contenido del Pack

### Imágenes Generadas (6 PNG)

```
post_01_hero.png              84 KB  - Hero/Presentación (gradiente azul)
post_02_sin_registro.png      44 KB  - Feature: Sin Registro (fondo blanco)
post_03_kanban.png            36 KB  - Feature: Kanban Visual (azul oscuro)
post_04_compartir.png         44 KB  - Feature: Compartir (gradiente verde)
post_05_prioridades.png       52 KB  - Feature: Prioridades (3 tarjetas)
post_06_cta.png               40 KB  - CTA Final (gradiente azul profundo)
```

### Documentación

1. **ESTRATEGIA_CONTENIDO.md** - Guía completa con:
   - Copy optimizado para cada post
   - Hashtags SEO categorizados
   - Keywords para alt text
   - Calendrio de publicación
   - Métricas de éxito
   - URLs con tracking

2. **COPY_ALTERNATIVAS_Y_VARIACIONES.md** - A/B testing:
   - 3 variantes de copy por post
   - Recomendaciones de cuál usar
   - Copy bonus para Stories
   - Recomendaciones de inversión publicitaria

3. **README.md** (este archivo) - Instrucciones de uso

4. **generate_posts.py** - Script Python que generó las imágenes
   - Usa solo Pillow (PIL)
   - Totalmente personalizable
   - Reutilizable para futuras campañas

---

## Cómo Usar Este Pack

### Paso 1: Cargar imágenes a Instagram

1. Ir a **Instagram Creator Studio** o **Meta Business Suite**
2. Seleccionar **Posts**
3. Crear un nuevo post (o Carrusel de 6 imágenes)
4. Subir `post_01_hero.png` a `post_06_cta.png`
5. Copiar el copy de **ESTRATEGIA_CONTENIDO.md** para cada post
6. Añadir hashtags (según especificación)
7. **Programar** para las fechas/horas recomendadas

### Paso 2: Configurar URLs de tracking

En **ESTRATEGIA_CONTENIDO.md** encontrarás URLs con parámetros UTM:

```
Post 1: cuentasrapidas.app?utm_source=ig&utm_medium=feed&utm_campaign=hero
Post 2: cuentasrapidas.app?utm_source=ig&utm_medium=feed&utm_campaign=registro
...
```

**Configurar en**:
- Google Analytics (crear cuenta de tracking)
- Meta Pixel (si boosteás posts)
- UTM Builder: https://utm.io/

### Paso 3: A/B Testing (Semana 2+)

Después de la primera semana:

1. Revisar **ESTADÍSTICAS** en Instagram Insights:
   - Guardados (% del total de impresiones)
   - CTR (click-through rate)
   - Comentarios

2. Si una variante underperforma, cambiar a alternativa de **COPY_ALTERNATIVAS_Y_VARIACIONES.md**

3. Medir nuevamente después de 3-5 días

### Paso 4: Boost con presupuesto (Opcional)

Si aplica budget de publicidad (recomendado: $225 USD para 3 semanas):

**Semana 1**:
- Post 4 (Compartir): $75 USD
  - Objetivo: Reach + Engagement
  - Audience: 25-45 años, parejas, interés en finanzas

**Semana 2**:
- Post 6 (CTA): $100 USD
  - Objetivo: Conversión (link clicks)
  - Audience: Custom Audience (vieron Videos/Posts de CuentasRápidas)

**Semana 3+**:
- Retargeting: $50 USD
  - Objetivo: Conversión
  - Audience: Lookalike de visitantes a cuentasrapidas.app

---

## Calendario de Publicación Recomendado

| Semana | Día | Hora | Post | Tema |
|--------|-----|------|------|------|
| Semana 1 | Lunes | 9 AM | #1 | Hero |
| | Martes | 8 PM | #4 | Compartir |
| | Miércoles | 6 PM | #2 | Sin Registro |
| | Jueves | 10 AM | #5 | Prioridades |
| | Viernes | 9 AM | #3 | Kanban |
| | Domingo | 7 PM | #6 | CTA |
| Semana 2 | Repetir con variantes | Si resulta necesario |

**Notas de timing**:
- **9 AM**: Horario de desayuno (Chile, UTC-4)
- **6 PM**: Horario de trabajo tardío (planificación de gastos)
- **7 PM**: Domingo = planificación de semana
- **8 PM**: Fin de tarde (engagement máximo)

---

## Métricas de Éxito

### Por Post

**Target mínimo**:
- **Guardados**: >10% de impresiones
- **Comentarios**: >5% de impresiones
- **CTR a sitio**: >2%

**Excelente**:
- **Engagement rate**: >5% (likes + comentarios + guardados / impresiones)
- **Alcance orgánico**: +500 personas
- **Compartidos**: >3%

### Dashboard de monitoreo

Crear en Google Sheets:

| Post | Impresiones | Guardados | CTR | Engagement % | Conversión |
|------|-------------|-----------|-----|--------------|------------|
| #1 | | | | | |
| #2 | | | | | |
| #3 | | | | | |
| #4 | | | | | |
| #5 | | | | | |
| #6 | | | | | |

**Actualizar**: Cada 48 horas durante primera semana, luego semanal

---

## Personalizaciones Posibles

### Cambiar colores

Abrir `generate_posts.py` y editar el diccionario `COLORS`:

```python
COLORS = {
    'primary_blue': '#0079bf',      # ← cambiar aquí
    'dark_blue': '#0052cc',          # ← o aquí
    ...
}
```

Luego ejecutar:
```bash
python3 generate_posts.py
```

### Cambiar copy en imágenes

Editar funciones específicas en `generate_posts.py`:

```python
def post_01_hero() -> Image.Image:
    """Post 1 - Hero/Presentación"""
    # ...
    text_main = "Tus gastos\norganizados\nen segundos."  # ← cambiar
    text_sub = "Sin registro · Sin servidor · Gratis"     # ← cambiar
```

### Agregar logo/marca

En `post_01_hero()`, antes del `return img`:

```python
from PIL import Image as PILImage

logo = PILImage.open('path/to/logo.png')
logo = logo.resize((200, 200))
img.paste(logo, (440, 800), logo)
```

---

## Mejores Prácticas de Instagram

### Caption

- **Primera línea**: Hook irresistible (pregunta, dato, emoción)
- **Línea 2-5**: Beneficios/Diferenciadores
- **Línea 6+**: CTA + hashtags
- **Longitud óptima**: 150-300 caracteres (para no truncar)

### Hashtags

- **Total**: 5-10 hashtags
- **Mezcla**: 50% alto volumen + 40% nicho + 10% brand
- **Distribución**: Algunos en caption, resto en primer comentario
- **Evitar**: Hashtags sin validez, demasiados genéricos

### Timing de publicación

- **Lunes-Viernes 6-10 PM**: Máximo engagement (post-laboral)
- **Sábado 9 AM**: Fin de semana, planificación
- **Domingo 7-8 PM**: Planificación de semana
- **Evitar**: Lunes antes de 7 AM, miércoles mediodía

### Engagement

Responder comentarios dentro de **30 minutos** de publicar (boost del algoritmo)

### Reels (Bonus)

Cada post puede convertirse a Reel 15-30seg:
1. Mantener copy de caption
2. Añadir audio trending
3. Animación simple (transiciones entre conceptos)
4. Voz en off (opcional, pero aumenta engagement)

---

## Troubleshooting

### Las imágenes se ven cortadas en Instagram

**Solución**: Instagram muestra primero 1080x1080. Si el texto se corta, abrir imagen original y verificar que el texto esté dentro de márgenes.

### Los colores se ven diferentes en app vs. web

**Causa**: Problema de perfiles de color ICC.
**Solución**: Asegurar que las imágenes estén en sRGB (ya lo están en generate_posts.py)

### Copy muy largo para Instagram

**Solución**: Ver secciones de "COPY_ALTERNATIVAS_Y_VARIACIONES.md" para versiones más cortas

### No hay engagement

**Checklist**:
1. ¿Publicaste en horarios correctos? → Ver "Timing de publicación"
2. ¿Respondiste comentarios en 30 min? → Responder ahora
3. ¿Los hashtags son relevantes? → Revisar "ESTRATEGIA_CONTENIDO.md"
4. ¿El copy tiene hook fuerte? → Cambiar a Variante B o C
5. ¿Falta CTA claro? → Añadir "Pruébalo: cuentasrapidas.app"

---

## Preguntas Frecuentes

**P: ¿Puedo publicar todos los posts el mismo día?**
R: No. Espaciar 24-48 horas permite que cada post acumule engagement sin competencia de feed.

**P: ¿Cambio el copy cada semana?**
R: Prueba la Variante A (actual) por 5-7 días. Si underperforma, cambia a B o C por otros 5-7 días.

**P: ¿Necesito boost con presupuesto?**
R: No es obligatorio. Prueba organic primero. Si después de 3 semanas los resultados son menores al target, entonces boost.

**P: ¿Qué hago si un post "fracasa"?**
R: Esperar 7 días, cambiar copy a variante de "COPY_ALTERNATIVAS_Y_VARIACIONES.md" y re-publicar en diferente horario.

**P: ¿Puedo reutilizar estas imágenes en otras plataformas?**
R: Sí, pero adaptar:
- **TikTok**: Convertir a 9:16 vertical, añadir sonido
- **LinkedIn**: Cambiar copy a tono profesional, añadir perspectiva de negocio
- **Facebook**: Ídem Instagram, pero copy puede ser más largo
- **Pinterest**: Convertir a 2:3 (600x900), incluir keywords en descripción

**P: ¿Qué hago después de publicar los 6 posts?**
R: Pasar a **content continuity**:
- 2-3 posts/semana de contenido generado por usuario (testimonios, tips)
- 1 post/semana educativo (cómo calcular presupuesto, etc.)
- Stories diarias (behind-the-scenes, polls, quizzes)

---

## Recursos Adicionales

### Herramientas recomendadas

- **Programador de posts**: Buffer (https://buffer.com) o Meta Business Suite
- **Analytics**: Google Analytics 4 + Instagram Insights
- **UTM Builder**: https://utm.io/ o Google Campaign URL Builder
- **Hashtag research**: Hashtagify o Instagram stesso (buscar hashtag, ver volumen)
- **Diseño futuro**: Este mismo script (generate_posts.py) reutilizable

### Referencias competitivas

Analizar cuentas de:
- Splitwise (@splitwise)
- Tricount (cuenta oficial)
- Bunq (@bunq) - fintech
- Wise (@wiseapp) - fintech

### Documentación de plataforma

- Instagram Creator Academy: https://creators.instagram.com/
- Meta Ads Manager: https://business.facebook.com/
- Google Analytics: https://analytics.google.com/

---

## Versionamiento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 19/03/2026 | Lanzamiento inicial: 6 posts + estrategia completa |

---

## Soporte

Si las imágenes necesitan ajustes:

1. Editar `generate_posts.py` (el código está bien comentado)
2. Cambiar variables en la función correspondiente
3. Ejecutar: `python3 generate_posts.py`
4. Nuevas imágenes se generan en el mismo directorio

**Ejemplo**: Para cambiar el texto del Post 1:

```python
# En función post_01_hero()
text_main = "Nuevo texto\naquí"  # ← cambiar
```

---

## Checksum de Archivos

Para verificar integridad:

```bash
md5sum *.png
```

Archivos esperados (6 PNG, ~290 KB total):
- post_01_hero.png: 84 KB
- post_02_sin_registro.png: 44 KB
- post_03_kanban.png: 36 KB
- post_04_compartir.png: 44 KB
- post_05_prioridades.png: 52 KB
- post_06_cta.png: 40 KB

---

**Campaña generada por**: Claude Code (Anthropic)
**Especialización**: Diseño gráfico digital, RRSS, SEO, copywriting
**Última actualización**: 19 de Marzo, 2026

¡Éxito con la campaña! 🚀
