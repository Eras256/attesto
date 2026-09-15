# git.md — cómo se escriben PRs, issues y contribuciones en GitHub

Mini playbook, escrito 20-ago-2026. Complementa `playbooks/PLAYBOOK-register-cleanup.md`
(ese cubre limpiar tells de IA en texto ya escrito) y `AGENTS.md`'s regla de
coautoría — este archivo es la regla de cómo escribir algo NUEVO desde el
principio, no una limpieza posterior.

## Instalación en cualquier proyecto — dos pasos, no uno

**Este archivo solo no hace nada.** Igual que `continue.md` e `images.md`,
nadie lo carga automáticamente — hace falta que `AGENTS.md` apunte a él.

1. Copia este archivo completo a `playbooks/git.md` del proyecto nuevo (o
   donde ese proyecto guarde sus playbooks).
2. Agrega esto al final de `AGENTS.md` de ese proyecto:

```
**Todo PR, issue o comentario que se publique en un repo de GitHub —
propio o ajeno — se escribe humanizado al máximo, sin verbosidad, con el
trailer de coautoría de IA incluido, nunca oculto.** No basta con
reportar "encontré algo" — cuando la causa raíz ya está confirmada con
evidencia real, se propone el fix, no solo el hallazgo. Detalle en
`playbooks/git.md`.
```

## La regla, en corto

Tres cosas, no una:

1. **Humanizado al máximo, sin verbosidad.** Nada de relleno tipo "es
   importante destacar que", nada de repetir en la conclusión lo que ya
   se dijo arriba, nada de listas de adjetivos vacíos. Se escribe como
   escribe una persona que ya sabe de qué habla, directo al hallazgo, la
   evidencia, y qué se hizo al respecto. Aplica la misma disciplina de
   caracteres y ritmo que `PLAYBOOK-register-cleanup.md` ya documenta
   (guiones largos, comillas curvas, el resto de los tells) — esto no
   reemplaza esa limpieza, la extiende a contenido nuevo desde el momento
   en que se escribe, no como pasada posterior.
2. **El trailer de coautoría de IA nunca se oculta ni se quita.** Mismo
   principio que ya es regla dura en `AGENTS.md`: el riesgo real no es
   que aparezca IA, es que **solo** aparezca IA sin juicio humano visible
   detrás — verificar en código real, correr los tests, confirmar contra
   la fuente, no solo redactar bonito.
3. **No basta con reportar — cuando la causa raíz está confirmada, se
   propone el fix.** Un issue que solo dice "encontré un bug" es más
   débil que uno que además incluye una reparación verificada con código
   real, no solo razonamiento. Pero esto tiene un límite explícito: si la
   causa raíz **no** está confirmada todavía (el propio issue dice "no
   estoy seguro si es nuestro error o un gap real"), no se fuerza un fix
   — se investiga primero, con la misma reproducción aislada y verificada
   que ya se exige para el reporte original, y solo después de confirmar
   se escribe la reparación.
4. **Proponer el fix en el texto del issue no es el final del paso 3 —
   es abrir el PR, en la misma sesión.** Lección de un incidente real en
   otro proyecto de este portafolio (detalle localizado ahí, no repetido
   aquí — la regla es lo que importa): un issue trajo el fix completo en
   código, con la línea "happy to open a PR with this if useful" — y ese
   "si útil" se quedó sin ejecutar. Un contribuidor externo tomó
   exactamente esa propuesta y la convirtió en PR antes que el equipo;
   el PR quedó bien hecho, coincidía línea por línea con lo propuesto,
   pero el crédito de la reparación ya no era del equipo. En un repo
   activo con contribuidores externos leyendo issues abiertos, la ventana
   entre "propuse el fix en texto" y "alguien más lo convierte en PR"
   puede ser de horas. Si hay tiempo en la misma sesión para escribir el
   código del fix dentro del issue, hay tiempo para abrir el PR — no se
   deja como
   oferta pendiente.

## El trailer de disclosure — texto exacto, y cuándo se extiende

Toda vez que el texto lleva asistencia de IA visible (lo normal, per la
regla dura de `AGENTS.md`), el disclosure cierra con esta línea, sin
variar el fraseo entre proyectos:

```
Disclosure: drafted with AI assistance under my direction and reviewed
by hand.
```

**Si el comentario cita o parafrasea algo de otro hilo/comentario/PR
(un "dice X" sobre lo que alguien más escribió), primero se relee la
fuente real, hoy — no se cita desde lo que ya está en contexto de una
lectura anterior. Solo *después* de haber releído, y solo si de verdad
se hizo, el disclosure agrega una segunda oración diciéndolo:**

```
Both quotations above were re-verified against the linked comments
today.
```

(ajustar "both"/"the" al número real de citas — una, dos, tres). **La
oración es la consecuencia de haber releído, no una plantilla que se
pega y después se justifica.** Si no hubo tiempo de releer la fuente
antes de publicar, la oración no va — se prefiere el disclosure corto
y verdadero a uno largo y sin respaldo.

**Por qué esto es una regla dura, no un detalle de estilo:** esta misma
sesión encontró más de una vez que una cita recordada de memoria —no
releída— salía ligeramente mal (a quién pertenecía qué fila en una
tabla, si un punto contaba como "nuevo" o no, si una mischaracterización
ya había sido corregida). El costo de re-leer la fuente antes de citar
es bajo; el costo de una cita mal atribuida en un repo público, ajeno,
es alto — corrige la percepción de quien lee, no solo el propio texto.

## Antes de publicar cualquier PR/issue/comentario — checklist

1. ¿Se lee como lo escribiría la persona que de verdad encontró esto, o
   como una lista de features generada? Si es lo segundo, reescribir.
2. ¿El trailer de coautoría sigue ahí? Nunca se borra para que "se vea
   más humano" — esa no es la forma correcta de humanizar el texto.
3. ¿La causa raíz está confirmada con evidencia real (código corrido, no
   solo la descripción de otro)? Si sí, y hay una reparación razonable,
   inclúyela. Si no, no inventes una — reporta el hallazgo tal cual y
   sigue investigando aparte.
3b. ¿El issue trae el fix en código, listo? Entonces el PR se abre ahora,
   en esta misma sesión — no como "happy to open a PR if useful" flotando
   en el texto. Ver caso #3270/#3278 arriba.
4. ¿Se probó algo más allá de lo mínimo pedido (un caso límite extra, una
   verificación cruzada), o solo se repitió el caso obvio? La evidencia
   extra es lo que separa un reporte creíble de uno superficial.
5. **¿El texto cita o parafrasea algo de otro hilo?** Si sí, esa cita se
   releyó hoy contra la fuente real (no se recicló de un resumen anterior
   en el propio contexto), y el disclosure lo dice explícito con la
   segunda oración de arriba.
