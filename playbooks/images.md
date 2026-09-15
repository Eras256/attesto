# images.md — pegar imágenes, capturas y links sin gastar tokens de más

Mini playbook, investigado en vivo 19-ago-2026 contra la documentación
oficial de Anthropic (no memoria de entrenamiento — todas las cifras de
este archivo tienen fuente citada al final, verificable). Complementa
`PLAYBOOK-claude-antigravity-setup.md` y a `continue.md` — ese cubre
retomar sesiones, este cubre el costo real de pegar imágenes/capturas/
enlaces sin perder calidad de análisis.

## Instalación en cualquier proyecto — dos pasos, no uno

**Este archivo solo no hace nada.** Igual que `continue.md`, nadie lo
carga automáticamente — hace falta que `AGENTS.md` apunte a él.

1. Copia este archivo completo a `playbooks/images.md` del proyecto nuevo.
2. Agrega esto al final de `AGENTS.md` de ese proyecto:

```
**El costo en tokens de una imagen es por área, no por peso de archivo —
recórtala al área relevante antes de pegarla.** Comprimir el archivo
(JPEG/WebP) no reduce tokens y puede dañar la legibilidad del texto;
recortar dimensiones sí. Detalle y cifras oficiales verificadas en
`playbooks/images.md`.

**Agrupa varias imágenes en el mismo turno en vez de pegarlas una por una
en turnos separados.** Cada imagen nueva invalida el prompt cache de ese
punto en adelante — pegarlas de una en una fuerza reescritura de cache
repetida en vez de lectura barata. Detalle en `playbooks/images.md`.
```

## Lo que de verdad cuesta tokens

**Confirmado contra `platform.claude.com/docs/en/build-with-claude/vision`,
19-ago-2026:** Claude ve las imágenes en parches de 28×28 píxeles, no en
peso de archivo. La fórmula real es:

```
tokens = ⌈ancho / 28⌉ × ⌈alto / 28⌉
```

Esto significa que **recortar reduce tokens proporcional al área
eliminada** — es la técnica de mayor impacto, gratis, sin instalar nada
(Win+Shift+S en Windows recorta antes de copiar). **Comprimir el archivo
no ahorra tokens** — un JPEG de 500KB y uno de 5MB con las mismas
dimensiones cuestan exactamente lo mismo, porque el costo es geométrico,
no de bytes. Comprimir de más además puede introducir artefactos que
dañan la precisión del modelo, sobre todo en texto — el propio doc
oficial lo marca como riesgo, no solo como no-beneficio.

**Cada modelo tiene un techo de resolución nativa**, expresado como límite
de lado largo y límite de tokens visuales. Imágenes más grandes que
cualquiera de los dos límites se reducen automáticamente antes de
procesarse:

| Nivel de resolución | Modelos | Lado largo máx. | Tokens visuales máx. |
| --- | --- | --- | --- |
| Alta resolución | Claude 4.7 y posteriores (incluye Sonnet 5, el modelo de esta sesión, y Opus 5) | 2576 px | 4784 |
| Estándar | El resto de los modelos | 1568 px | 1568 |

Costo real para tamaños comunes de captura de pantalla (de la tabla
oficial):

| Tamaño de imagen | Nivel estándar: tokens | Nivel alta resolución: tokens |
| --- | --- | --- |
| 1000×1000 px | 1296 | 1296 |
| 1920×1080 px (captura de pantalla típica) | 1560 (reducida a 1456×819) | 2691 (sin reducir) |
| 2000×1500 px | 1564 (reducida a 1269×952) | 3888 (sin reducir) |
| 3840×2160 px (4K) | 1560 (reducida a 1456×819) | 4784 (reducida a 2576×1449) |

Nota práctica para esta sesión (Sonnet 5, nivel alta resolución): una
captura de pantalla completa en 1080p sin recortar cuesta **2691 tokens**
— casi el doble que en el nivel estándar. Recortar a solo el panel o
diálogo relevante antes de pegar, en vez de la pantalla completa, es la
diferencia entre unos cientos de tokens y varios miles.

**Claude no lee metadata de las imágenes** (EXIF, GPS, etc.) — limpiarla
pensando que ahorra tokens no ahorra nada, ese paso es innecesario para
este propósito.

## Los límites reales de una request

- **Cuántas imágenes:** 20 por turno en claude.ai · 100 por request en la
  API para modelos con ventana de 200k tokens · 600 por request para el
  resto. Si un request supera 20 bloques de imagen/documento, aplica un
  límite de dimensión más estricto por imagen — para evitarlo, recorta
  cada imagen a ≤2000 px por lado o mantén el request en ≤20 bloques.
- **Dimensión máxima por imagen:** 8000×8000 px.
- **Tamaño máximo por imagen (base64):** 10 MB en la API directa y en
  claude.ai · 5 MB en Amazon Bedrock / Google Cloud.
- **Formatos soportados:** JPEG, PNG, GIF (sin animación, solo se usa el
  primer cuadro), WebP.
- Las imágenes subidas son efímeras — se borran después de procesar la
  request, no se usan para entrenar modelos.

## Por qué agrupar en un turno gana contra pegar una por una

**Confirmado contra `platform.claude.com/docs/en/build-with-claude/prompt-caching`,
19-ago-2026:** las imágenes sí se pueden cachear igual que los bloques de
texto — pero **agregar o quitar una imagen en cualquier parte del prompt
invalida el cache de mensajes** desde ese punto en adelante. La lectura
de cache cuesta ~10% del precio base; una escritura de cache nueva cuesta
125% (TTL de 5 min) o 200% (TTL de 1 hora) del precio base.

Consecuencia práctica: pegar 5 capturas relacionadas en 5 turnos
separados fuerza 5 reescrituras de cache completas. Pegarlas juntas en un
solo mensaje ("aquí van 3 capturas del mismo bug") paga una sola
escritura, y todo lo que sigue en la conversación puede leer ese bloque
barato en vez de reescribirlo cada vez.

Si algo en el proyecto automatiza llamadas a la API con las mismas
imágenes repetidas entre turnos (un hook, un script, no Claude Code
interactivo), usar la Files API — subir la imagen una vez y referenciarla
por `file_id` — evita reenviar los bytes base64 completos en cada turno.

## Cómo pegar imágenes en Claude Code específicamente

**Confirmado contra `code.claude.com/docs/en/common-workflows`,
19-ago-2026** — tres formas, todas soportadas:

1. Arrastrar y soltar la imagen a la ventana de Claude Code.
2. Copiar la imagen y pegarla con **Ctrl+V** en la CLI (en macOS, Cmd+V
   también funciona en iTerm2).
3. Dar la ruta del archivo directamente: "Analyze this image:
   /ruta/a/imagen.png".

**No hay, en esta página oficial, un límite de tamaño específico de
Claude Code distinto al de la API general** (10 MB, 8000×8000 px). Cifras
más bajas que circulan en blogs de terceros (ej. "límite de 5MB en Claude
Code") no están confirmadas en la documentación oficial — no repetirlas
como hecho, marcarlas como no verificadas si aparecen.

`@archivo` incluye el contenido completo de un archivo de texto sin
esperar a que Claude lo lea — no aplica a imágenes pegadas (son bloques
de contenido, no referencias por ruta), pero sí es la alternativa
correcta cuando lo que ibas a capturar en pantalla es código o texto que
ya existe en el repo: referencia el archivo, no captures su pantalla.

## Checklist accionable antes de pegar

1. **Recorta a la región relevante** — Win+Shift+S (Snipping Tool) en vez
   de la pantalla completa. Esta es la técnica de mayor impacto.
2. **No comprimas de más si el contenido es texto denso** (terminal,
   código, dashboard) — la guía oficial advierte que la compresión
   agresiva vuelve el texto ilegible, y eso sí daña la calidad del
   análisis. Prioriza legibilidad sobre ahorro cuando el contenido es
   texto.
3. **Junta varias capturas relacionadas en un solo mensaje** en vez de
   mandarlas una por una en turnos separados.
4. **Si la información ya existe como texto en el repo** (código, logs,
   un archivo de configuración), pega o referencia el texto con
   `@archivo`, no una captura de ese texto.
5. **Para links e investigación**, pega la URL y deja que WebFetch/
   WebSearch la traiga como texto ya limpio, en vez de pegar una captura
   de pantalla del navegador con esa página abierta.

## Fuentes

- [Vision — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/vision) (fetched 19-ago-2026)
- [Prompt caching — Claude Platform Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) (fetched 19-ago-2026)
- [Common workflows — Claude Code Docs](https://code.claude.com/docs/en/common-workflows) (fetched 19-ago-2026)
