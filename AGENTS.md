<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas duras del proyecto — siempre, sin excepción

Fuente única de las reglas que aplican en cualquier sesión, en cualquier
herramienta (Claude Code o Antigravity), en este repo. `CLAUDE.md` la
importa con `@AGENTS.md` — no dupliques estas reglas ahí.

**Nunca acumular un saldo o estado por cliente entre requests — cada
skill-check se liquida de forma atómica.** Ver Test 1 (IFPE) en
`.claude/skills/mexico-legal-check/SKILL.md` y el porqué completo en
`DECISIONS.md`. Si algo empieza a parecer "crédito prepagado" o "cuenta
de cliente," es la señal de que se rompió esta regla.

**Attesto nunca es la contraparte que liquida, reconcilia o empareja el
pago de otra parte — verifica pagos ya confirmados directamente contra
RPC, nunca delega a un facilitador de terceros.** Decidido 2026-09-15
después de investigar el ecosistema x402-Solana existente (PayAI); ver
`DECISIONS.md`.

**`attesto_program` es un programa separado de `prova_program` — Attesto
solo LEE del registro de Prova, nunca escribe en su programa.** No
fusionar los dos "para simplificar" — decisión explícita del usuario
2026-09-15, ver `DECISIONS.md`.

**Nunca en copy público: "wallet," "exchange," "custody," "broker,"
"intermediary," "matching engine," "deposit," "balance."** Ver
`.claude/skills/mexico-legal-check/SKILL.md`.

**Tres keys, tres roles, nunca colapsados:** `attesto-deployer` (upgrade
authority), `attesto-issuer` (firma atestaciones/disputas),
`attesto-treasury` (recibe pagos). Ver `DECISIONS.md`.

## Playbooks de portafolio instalados

Patrón replicado desde RFP 1 (`c:\DaAps\RFP 1`), a pedido explícito del
usuario 2026-09-15. Ver `.claude/skills/claude-antigravity-setup/SKILL.md`
para el resto del checklist de este patrón.

- `playbooks/continue.md` — retomar sesión sin gastar tokens de más.
- `playbooks/images.md` — costo real de pegar imágenes/capturas.
- `playbooks/drive.md` — cuándo (no) usar el MCP de Google Drive.
- `playbooks/git.md` — cómo se escriben PRs/issues/comentarios en GitHub.

**Al retomar con `claude --continue`, no releas lo que ya está en el
contexto ni reverifiques lo ya verificado esta sesión.** Responde directo
sobre lo ya establecido. Detalle y por qué en `playbooks/continue.md`.

**Cero alucinación. Todo lo dependiente de fecha se verifica en vivo antes
de afirmarlo, nunca desde memoria de entrenamiento** — versiones, precios,
reglas de plataforma, plazos legales. Está permitido decir "no lo sé, hay
que verificarlo." Cada afirmación debe poder rastrearse a algo
verificable; si no, se marca como inferencia. Guía oficial y técnicas en
`playbooks/continue.md`.

**El costo en tokens de una imagen es por área, no por peso de archivo —
recórtala al área relevante antes de pegarla.** Comprimir el archivo
(JPEG/WebP) no reduce tokens y puede dañar la legibilidad del texto;
recortar dimensiones sí. Detalle y cifras oficiales verificadas en
`playbooks/images.md`.

**Agrupa varias imágenes en el mismo turno en vez de pegarlas una por una
en turnos separados.** Cada imagen nueva invalida el prompt cache de ese
punto en adelante — pegarlas de una en una fuerza reescritura de cache
repetida en vez de lectura barata. Detalle en `playbooks/images.md`.

**El MCP de Google Drive no es la vía por defecto para leer un
Doc/Sheet/Slide.** Antes de cargarlo, prueba más barato: pídele al
usuario que pegue el contenido directo, o si el documento es público, usa
WebFetch en vez del MCP. Resérvalo para cuando de verdad haga falta
verificar contenido privado antes de que salga hacia afuera. Detalle en
`playbooks/drive.md`.

**Todo PR, issue o comentario que se publique en un repo de GitHub —
propio o ajeno — se escribe humanizado al máximo, sin verbosidad, con el
trailer de coautoría de IA incluido, nunca oculto.** No basta con
reportar "encontré algo" — cuando la causa raíz ya está confirmada con
evidencia real, se propone el fix, y si el fix ya está en código, se abre
el PR en la misma sesión, no como oferta pendiente ("happy to open a PR
if useful" sin ejecutar). Detalle en `playbooks/git.md`.
