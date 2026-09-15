# drive.md — evitar el MCP de Google Drive por defecto

Mini playbook, escrito 20-ago-2026. Complementa `images.md` (mismo espíritu:
elegir el camino barato antes de cargar algo caro) — este archivo es
específico al MCP de Google Drive, no una regla general de todos los MCP.

## Instalación en cualquier proyecto — dos pasos, no uno

**Este archivo solo no hace nada.** Igual que los otros cuatro, nadie lo
carga automáticamente — hace falta que `AGENTS.md` apunte a él.

1. Copia este archivo completo a `playbooks/drive.md` del proyecto nuevo.
2. Agrega esto al final de `AGENTS.md` de ese proyecto:

```
**El MCP de Google Drive no es la vía por defecto para leer un Doc/Sheet/
Slide.** Antes de cargarlo, prueba más barato: pídele al usuario que pegue
el contenido directo, o si el documento es público, usa WebFetch en vez
del MCP. Resérvalo para cuando de verdad haga falta verificar contenido
privado antes de que salga hacia afuera. Detalle en `playbooks/drive.md`.
```

## La regla, en corto

1. **No es el default.** Cargar el MCP de Drive y traer un documento
   completo como texto cuesta tokens reales — la definición de la
   herramienta más el contenido completo del documento — para algo que
   muchas veces tiene una vía más barata.
2. **Antes de usarlo, dos alternativas a probar primero:**
   - Pedirle al usuario que pegue el contenido directo del documento en
     el chat, si ya lo tiene abierto de todos modos.
   - Si el documento es genuinamente público (no pide login), usar
     WebFetch en vez del MCP — no carga la definición de herramienta
     extra y suele devolver texto igual de limpio.
3. **Resérvalo para cuando de verdad haga falta**: verificar contenido
   privado antes de que se mande a alguien afuera (un documento que va a
   un funder, un cliente, un tercero), donde pegar el texto a mano no
   sirve porque hace falta confirmar que es completo y exacto, no una
   versión resumida o parcial de lo que el usuario recuerda.

## Checklist antes de cargar el MCP de Drive

1. ¿Ya le pedí al usuario que pegue el contenido directo? Si no, pedirlo
   primero.
2. ¿El documento es realmente privado, o WebFetch podría traerlo igual de
   bien sin cargar el MCP?
3. ¿Lo que está en juego justifica verificar el documento completo y
   exacto (algo que sale hacia afuera, con stakes reales), o alcanza con
   confiar en lo que el usuario ya resumió?
