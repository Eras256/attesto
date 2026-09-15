# continue.md — retomar sesión sin gastar tokens de más

Mini playbook, investigado 19-ago-2026. Complementa
`PLAYBOOK-claude-antigravity-setup.md` — este archivo es solo la parte de
"cómo retomar," no repite el resto. Su hermano es `images.md` — ese cubre
el costo de pegar imágenes/capturas/links, este cubre reanudar sesiones.

## Instalación en cualquier proyecto — dos pasos, no uno

**Este archivo solo no hace nada por sí solo.** Nadie lo carga
automáticamente — hace falta que `AGENTS.md` apunte a él, igual que
cualquier otro archivo de referencia en este workspace.

1. Copia este archivo completo a `playbooks/continue.md` del proyecto
   nuevo (o donde ese proyecto guarde sus playbooks — ajusta la ruta en el
   paso 2 si el nombre de la carpeta es distinto).
2. **Si este proyecto ya tiene `.claude/skills/claude-antigravity-setup/SKILL.md` instalado de antes**, esa copia quedó desactualizada — no incluye este paso. Sobrescríbela con la versión más reciente del Skill (en la §11 de `PLAYBOOK-claude-antigravity-setup.md`), o al menos agrégale a mano un paso que diga "copiar `playbooks/continue.md` y agregar sus dos reglas a `AGENTS.md`" — si no, la próxima sesión que confíe en el Skill para saber qué instalar se va a saltar esto sin darse cuenta.
3. Agrega esto al final de `AGENTS.md` de ese proyecto:

```
**Al retomar con `claude --continue`, no releas lo que ya está en el
contexto ni reverifiques lo ya verificado esta sesión.** Responde directo
sobre lo ya establecido. Detalle y por qué en `playbooks/continue.md`.

**Cero alucinación. Todo lo dependiente de fecha se verifica en vivo antes
de afirmarlo, nunca desde memoria de entrenamiento — versiones, precios,
reglas de plataforma, plazos legales.** Está permitido decir "no lo sé, hay
que verificarlo." Cada afirmación debe poder rastrearse a algo verificable;
si no, se marca como inferencia. Guía oficial y técnicas en
`playbooks/continue.md`.
```

## Lo que `claude --continue` (o `-c`) hace de verdad

**Confirmado, no se puede evitar desde un archivo de proyecto:** `--continue`
recarga la conversación completa — cada prompt, cada cambio de archivo, cada
decisión — no es un resumen liviano por diseño. Carga la conversación más
reciente **de la carpeta actual**, sin pedir ID. `--resume` es distinto: deja
elegir una sesión específica por nombre o ID, útil si hay varios hilos de
trabajo en la misma carpeta y no quieres el más reciente por default.

**Si de verdad quieres algo más liviano que un reload completo:** usa
`/recap` *dentro* de una sesión ya abierta en vez de reabrir con
`--continue` — da un resumen de dónde quedó todo sin repetir el historial
completo. Es la herramienta correcta cuando lo único que hace falta es
"¿en qué quedamos?", no el contexto completo de nuevo.

## La regla real para no desperdiciar tokens al retomar

El ahorro no está en evitar la recarga — está en qué hace la sesión con
el contexto que ya tiene:

- **No vuelvas a leer un archivo que ya está en el contexto cargado.** Si
  `--continue` ya trajo el historial completo, ese archivo ya se leyó una
  vez — leerlo de nuevo "para confirmar" es gasto sin beneficio real.
- **No vuelvas a verificar un hecho que ya quedó verificado con fuente esta
  sesión.** Si ya se citó con link y fecha, es válido reusarlo sin repetir
  la búsqueda, salvo que haya pasado tiempo real desde entonces o el hecho
  sea de los que cambian rápido.
- **Responde directo sobre lo que ya se estableció**, en vez de resumir
  todo el historial antes de actuar — el resumen ya existe en el contexto
  cargado, repetirlo en la respuesta es ruido, no ayuda.

## La regla de cero alucinación e información fresca

Basado en la guía oficial de Anthropic para reducir alucinaciones — técnicas
reales, no genéricas:

- **Está permitido decir "no lo sé" o "hay que verificarlo."** Darle permiso
  explícito a admitir incertidumbre reduce información falsa de forma
  medible — es mejor que inventar una respuesta segura que no lo es.
- **Todo lo que dependa de la fecha (versiones, precios, reglas de
  plataforma, plazos legales) se verifica en vivo antes de afirmarlo, nunca
  desde memoria de entrenamiento.** Esta ya es la disciplina que se ha
  seguido toda esta sesión — se vuelve regla explícita aquí para que
  cualquier sesión nueva la aplique desde el arranque, no solo cuando se
  le ocurre.
- **Cada afirmación debe poder rastrearse a algo verificable** — una cita,
  un link, un hash, un test. Si no se puede rastrear, se marca como
  inferencia o no se afirma.
- **Si algo no se puede confirmar, se retracta en vez de sostenerse.** No
  se defiende una afirmación solo porque ya se dijo antes.

## Fuentes

- [What is the --continue Flag in Claude Code — ClaudeLog](https://claudelog.com/faqs/what-is-continue-flag-in-claude-code/)
- [Claude Code --continue and --resume — The Prompt Shelf](https://thepromptshelf.dev/blog/claude-code-session-resume-continue-guide-2026/)
- [Reduce hallucinations — Claude Platform Docs](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)
