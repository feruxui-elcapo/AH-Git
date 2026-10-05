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

- **Menú**: aparece con una animación de entrada (la barra baja y los links entran uno a uno). Al pasar el mouse,
  cada link se subraya con una línea que entra por la izquierda y sale por la derecha; el link de la sección que
  se está viendo queda subrayado (igual que "Inicio" en el original). Al scrollear la barra gana sombra y el botón
  "Contactar" se eleva con el hover. Abajo de 810px aparece la hamburguesa, que se convierte en X y despliega
  los links escalonados; se cierra con Escape, tocando afuera o al elegir un link. Esto es **un agregado
  deliberado**: el original no tenía ninguna animación de menú.
- **Hero**: las 3 fotos se muestran al ~64% de opacidad sobre fondo negro (el original las atenúa con
  `opacity .75 x .85`) y se **deslizan** hacia la izquierda cada 3 s en loop continuo (resorte sin rebote).
- **"Qué hacemos"**: las palabras se van revelando (blur + opacidad) según el scroll.
- **Contadores**: animan de 0 al valor final cuando la sección entra en pantalla.
- **Servicios**: las tarjetas **giran en 3D** al pasar el mouse (ver "Sobre los hovers").
- **Pasos**: el texto de cada paso aparece sólo mientras se pasa el mouse por su ícono "i" (en touch, al tocarla).
- **Trabajos**: carrusel en loop infinito con un punto por trabajo (15), 2 tarjetas por vista en desktop y 1 en
  mobile, flechas siempre visibles y autoplay cada 5 s.
- **WhatsApp**: el globito con el mensaje aparece visible desde que carga la página (como en el original) y se
  puede cerrar con la X; queda cerrado mientras dure la pestaña (`sessionStorage`).
- Todo respeta `prefers-reduced-motion`: si el visitante pidió menos animaciones, se muestra sin movimiento.

## Sobre los hovers

Antes de escribir el CSS probé, uno por uno, los hovers reales del sitio de Framer (con eventos de mouse
genuinos, no simulados, comparando `getComputedStyle` antes/después): links del menú, los botones ("Contactar",
"Ver más", "Ir a tienda"), logos de clientes, fotos del equipo, imágenes del carrusel de trabajos y los links
del pie de página. **Ninguno tiene efecto hover** — ni cambio de color, ni de opacidad, ni de escala. Por eso
esos elementos tampoco tienen ninguno acá (salvo el menú, que se animó a pedido, ver arriba).

**La interacción real de hover son las tarjetas de Servicios.** En el original la tarjeta cambia de golpe; acá
se rediseñó como un **giro 3D** (`rotateY`, 0,8 s): el frente muestra la foto, la pill oscura con el nombre y el
botón "Ver más"; el dorso es beige (`--beige`) con el título en gris y una lista de 4 puntos con tilde que
detalla el servicio (en "Capacitaciones" el título pasa a "Capacitaciones y acompañamiento"). Los textos son
los del original. En pantallas táctiles se tocan: tocar una tarjeta la gira, volver a tocarla la devuelve,
tocar otra cierra la anterior y tocar afuera las cierra todas. El texto de cada lista está en `index.html`
(`.servicio__checklist`) y los estilos del giro en `styles.css`, bajo "Tarjeta con giro 3D".

## Detalles heredados del sitio original (por si los querés cambiar)

1. **Botones "Ver más" de Servicios**: en el sitio de Framer no tienen enlace, así que acá quedaron como
   `<button>` sin acción. Para activarlos, reemplazá el `<button class="btn btn--block">` por
   `<a class="btn btn--block" href="...">`.
2. **Descripciones de los 4 pasos**: en el original están en color transparente y **no se ven nunca** (ni con
   hover, ni en mobile) — un error de carga del sitio viejo. Acá se corrigió a pedido: el texto aparece mientras
   se pasa el mouse por la "i" de cada paso (en touch, al tocarla) y su lugar queda reservado para que nada salte.
3. **Anclas del menú**: se mantuvieron los ids originales (`#sevices`, `#about`, `#team`, `#store`) para que
   cualquier link viejo siga funcionando. `#sevices` tiene ese error de tipeo desde el sitio anterior.
4. **"Nuestras certificaciones"** usaba una variante de Helvetica Neue licenciada que Framer alojaba.
   Acá se usa la pila del sistema (`'Helvetica Neue', Helvetica, Arial`) para no incluir una fuente con licencia
   en el repo. Se ve prácticamente igual (es un texto de 12px).


## Publicar

Al ser estático, sirve cualquier hosting: GitHub Pages, Netlify, Vercel o Cloudflare Pages
(subir la carpeta tal cual, sin comando de build). Después se apunta el dominio
`alternativahumus.com` al nuevo hosting y se puede dar de baja Framer.
