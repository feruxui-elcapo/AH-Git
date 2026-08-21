# Alternativa Humus — sitio web

Réplica en código propio de la landing de **alternativahumus.com**, hecha para dejar de depender de Framer.
Es un sitio estático: HTML + CSS + un archivo JS, sin frameworks, sin build y sin dependencias externas
(las fuentes y las imágenes están dentro del repo).

## Cómo verlo

Abrí `index.html` en el navegador, o levantá un servidor local:

```bash
npx serve .
```

## Estructura

```
index.html            todo el contenido de la página
assets/css/styles.css estilos (tokens de color, tipografías, secciones, responsive)
assets/js/main.js     menú, slideshows, contadores y animaciones
assets/img/           imágenes (nombradas por sección: hero-, servicio-, paso-, cliente-, equipo-, trabajo-…)
assets/fonts/         Rubik (woff2, self-hosted)
```

## Sistema de diseño

Colores (en `:root` de `styles.css`):

| Token | Valor | Uso |
|---|---|---|
| `--beige` | `#fbefe6` | fondo general, textos sobre el hero, barra de navegación |
| `--green` | `#387b6e` | títulos, botones, pie de página |
| `--mint` | `#bcd3c3` | círculo de los íconos de servicios |
| `--muted` | `#444` | textos secundarios |
| `--white` / `--black` | `#fff` / `#000` | fondos de sección y títulos |

Tipografía: **Rubik** (300–700). Escala de títulos por breakpoint:

| | >1199px | 810–1199px | ≤809px |
|---|---|---|---|
| Título de sección (`.h2`) | 52px | 46px | 36px |
| `.h3` | 44px | 38px | 32px |
| `.h4` | 36px | 30px | 28px |
| `.h6` | 22px | 21px | 20px |
| Párrafo animado | 37px | 34px | 20px |

Los breakpoints son los mismos que usaba el sitio original: `1200px`, `907px`, `810px`.

## Contenido que se edita seguido

- **Números de resultados**: en `index.html`, atributos `data-count` y `data-suffix` de cada `.stat__number`
  (hoy: 1180 Tn compostadas, 800 personas capacitadas, 51 Tn de CO₂ evitadas).
- **Trabajos**: cada `<article class="carousel__slide">` de la sección "Nuestros trabajos".
  Se agregan o quitan libremente; los puntos del carrusel se recalculan solos.
- **Equipo**: bloques `<article class="miembro">`.
- **Clientes**: imágenes de `.clientes__grid` (el `width`/`height` de cada logo define su tamaño en desktop).
- **Enlaces**: WhatsApp (`wa.me/5492615439850`), tienda, brochure y manuales están en `index.html`.

## Comportamientos

- **Menú**: en desktop se ven los links; abajo de 810px aparece el botón hamburguesa.
- **Hero**: slideshow de 3 imágenes con fundido, cambia cada 3 s (igual que el original).
- **"Qué hacemos"**: las palabras se van revelando (blur + opacidad) según el scroll.
- **Contadores**: animan de 0 al valor final cuando la sección entra en pantalla.
- **Trabajos**: carrusel con 2 tarjetas visibles en desktop, flechas al pasar el mouse, puntos y autoplay cada 5 s.
- Todo respeta `prefers-reduced-motion`: si el visitante pidió menos animaciones, se muestra sin movimiento.

## Detalles heredados del sitio original (por si los querés cambiar)

1. **Botones "Ver más" de Servicios**: en el sitio de Framer no tienen enlace, así que acá quedaron como
   `<button>` sin acción. Para activarlos, reemplazá el `<button class="btn btn--block">` por
   `<a class="btn btn--block" href="...">`.
2. **Descripciones de los 4 pasos**: en el original están en color transparente (no se ven).
   Acá se muestran al pasar el mouse por el paso, y siempre en mobile. Si querés que se vean siempre en desktop,
   borrá `color: transparent;` de `.paso__text` en `styles.css`.
3. **Anclas del menú**: se mantuvieron los ids originales (`#sevices`, `#about`, `#team`, `#store`) para que
   cualquier link viejo siga funcionando. `#sevices` tiene ese error de tipeo desde el sitio anterior.
4. **"Nuestras certificaciones"** usaba una variante de Helvetica Neue licenciada que Framer alojaba.
   Acá se usa la pila del sistema (`'Helvetica Neue', Helvetica, Arial`) para no incluir una fuente con licencia
   en el repo. Se ve prácticamente igual (es un texto de 12px).
5. **Pie de página en mobile**: en el original las columnas se superponen; acá los bloques se apilan prolijos.

## Publicar

Al ser estático, sirve cualquier hosting: GitHub Pages, Netlify, Vercel o Cloudflare Pages
(subir la carpeta tal cual, sin comando de build). Después se apunta el dominio
`alternativahumus.com` al nuevo hosting y se puede dar de baja Framer.
