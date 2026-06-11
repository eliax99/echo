# Arreglos #1 — Análisis y correcciones del proyecto ECHO

Fecha: 2026-06-11

## Resumen

El proyecto (FastAPI + React/TanStack Start) tenía varios fallos que impedían
arrancarlo en local y algunos bugs funcionales y de seguridad. Aquí está la lista
de lo encontrado y cómo se ha arreglado, más las instrucciones para lanzarlo en local.

---

## Fallos encontrados y arreglados

### 1. Credenciales de la base de datos hardcodeadas (crítico, seguridad)

**Archivo:** `backend/database/db.py`

La conexión a Supabase tenía usuario, contraseña y host escritos directamente en el
código (y subidos a git), ignorando por completo la variable `DATABASE_URL` que el
propio archivo cargaba dos líneas antes.

**Arreglo:** ahora se conecta usando `DATABASE_URL` del `.env`, y lanza un error claro
si no está definida.

> ⚠️ **Importante:** esa contraseña de Supabase (y la API key de Groq del pantallazo de
> Render) están comprometidas: han estado en el código fuente y en capturas de pantalla.
> Conviene **rotarlas** (Supabase → Settings → Database → Reset password; Groq → revocar
> y crear nueva key) y actualizar el `.env` local y las variables de Render.

### 2. Imports inconsistentes: el backend no arrancaba de ninguna manera (crítico)

**Archivos:** `backend/main.py`, `backend/agent/agent.py`

`main.py` y `agent.py` importaban con prefijo `backend.` (`from backend.database.db import ...`),
mientras que el resto de archivos (`routers/`, `services/`, `rag/`) importaban sin prefijo
(`from database.db import ...`). Resultado: daba igual desde dónde lanzaras uvicorn,
siempre fallaba con `ModuleNotFoundError`.

**Arreglo:** todos los imports unificados **sin** prefijo `backend.`. El servidor se lanza
desde la carpeta `backend/` con `uvicorn main:app` (ver instrucciones abajo).

### 3. El registro de usuarios fallaba siempre (crítico)

**Archivo:** `backend/routers/auth.py`

La tabla `users` define `username TEXT NOT NULL`, pero el `INSERT` del endpoint
`/auth/register` solo insertaba `email` y `password`. Todo registro fallaba con un
error 500 de violación de NOT NULL.

**Arreglo:** el `INSERT` ahora incluye `username` (el schema `UserRegister` ya lo pedía
y el frontend ya lo enviaba).

Además, al probarlo contra la base de datos real de Supabase apareció el problema
inverso: la tabla `users` ya existente se creó con una versión antigua del código y
**no tiene** la columna `username` (`CREATE TABLE IF NOT EXISTS` no modifica tablas que
ya existen). Añadida una mini-migración en `backend/models/user.py`
(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`) que se ejecuta al arrancar.

### 4. Secreto JWT hardcodeado y distinto al de la firma (crítico)

**Archivo:** `backend/routers/chat.py`

Los tokens se **firman** con `SECRET_KEY` del `.env` (en `auth_service.py`), pero se
**verificaban** con la cadena literal `"supersecretkey"` y algoritmo `"HS256"` hardcodeados.
Si en producción `SECRET_KEY` era otra cosa, ningún token era válido y el chat devolvía
siempre 401. Además, el secreto estaba expuesto en el código.

**Arreglo:** la verificación usa ahora `SECRET_KEY` y `ALGORITHM` desde `core/config.py`,
los mismos que la firma. Añadida también una comprobación en `core/config.py` que avisa
con un mensaje claro si falta `SECRET_KEY` en el `.env`.

### 5. Errores 400/401/403 convertidos en 500 (bug)

**Archivos:** `backend/routers/auth.py`, `backend/routers/chat.py`

Los `raise HTTPException(400, ...)` estaban dentro de bloques `try` con un
`except Exception` genérico que los re-lanzaba como 500. Por ejemplo, "User already
exists" o "Invalid credentials" llegaban al frontend como error 500 genérico.

**Arreglo:** añadido `except HTTPException: raise` antes del `except Exception` en todos
los endpoints, para que los códigos de estado correctos lleguen al cliente.

### 6. El historial de chat no comprobaba el dueño de la partida (seguridad)

**Archivo:** `backend/routers/chat.py`

`GET /api/chat/history/{game_id}` solo validaba que el token fuera válido, pero no que
la partida perteneciera al usuario: cualquier usuario logueado podía leer las
conversaciones de cualquier otro cambiando el `game_id` de la URL.

**Arreglo:** se comprueba que `games.user_id` coincide con el usuario del token; si no,
devuelve 403.

### 7. Rutas de ChromaDB relativas al directorio de ejecución (bug)

**Archivos:** `backend/rag/retriever.py`, `backend/rag/build_db.py`

`retriever.py` abría `"backend/rag/chroma_db"` y `build_db.py` usaba `"rag/docs"` /
`"rag/chroma_db"`: cada archivo asumía un directorio de trabajo distinto, así que
según desde dónde ejecutaras, uno u otro creaba una base de datos vacía en el sitio
equivocado en vez de usar la existente.

**Arreglo:** ambos usan ahora rutas absolutas calculadas a partir de la ubicación del
propio archivo (`Path(__file__).parent`). Funcionan desde cualquier directorio.

### 8. Import de `langgraph` sin instalar y sin usar (crítico)

**Archivo:** `backend/agent/agent.py`

Importaba `StateGraph` de `langgraph`, que **no está en `requirements.txt`** y además
no se usaba en ninguna parte. El import roto tumbaba toda la API al arrancar.

**Arreglo:** import eliminado.

### 9. `chromadb==0.4.24` no instala en Windows con Python 3.12 (bloqueante en local)

**Archivo:** `backend/requirements.txt`

Esa versión depende de `chroma-hnswlib==0.7.3`, que no tiene binario precompilado para
Python 3.12 e intenta compilarse con Visual C++ (que normalmente no está instalado):
`pip install` fallaba con "Microsoft Visual C++ 14.0 or greater is required".

**Arreglo:** actualizado a `chromadb>=1.0,<2`, que ya no depende de `chroma-hnswlib`
(la implementación es nativa, con binarios precompilados para Windows) y se instala
sin necesidad de Visual C++. Verificado que la base vectorial incluida en el repo
(`backend/rag/chroma_db`, 5 documentos) abre y consulta correctamente con la versión
nueva, sin necesidad de regenerarla.

### 10. `build_db.py` usaba embeddings deprecados (warning/futuro error)

**Archivo:** `backend/rag/build_db.py`

Usaba `HuggingFaceEmbeddings` de `langchain_community` (deprecado y eliminado en
versiones recientes), mientras `retriever.py` usaba el paquete correcto.

**Arreglo:** unificado a `langchain_huggingface` (que ya estaba en requirements).

### 11. URL del backend hardcodeada en el frontend (bloqueante en local)

**Archivo:** `frontend/src/lib/echo-api.ts`

La URL base era la de Render (`https://echo-e69p.onrender.com`) escrita a fuego:
imposible apuntar al backend local.

**Arreglo:** ahora usa `import.meta.env.VITE_API_URL` con fallback a
`http://localhost:8000`. Creado `frontend/.env.example` y `frontend/.env`.

### 12. Llamada a `chatRequest` con argumentos de menos (error de compilación TS)

**Archivo:** `frontend/src/routes/game.tsx`

`chatRequest(token, message, game_id)` requiere 3 argumentos, pero se llamaba con 2
(`chatRequest(token, text)`). TypeScript no compila con ese error.

**Arreglo:** se pasa el `gameId` del store de Zustand.

### 13. `.env.example` del backend incompleto (documentación)

**Archivo:** `backend/.env.example`

Solo listaba `SECRET_KEY` y `GROQ_API_KEY`; faltaban `DATABASE_URL` (imprescindible),
`ALGORITHM` y `ACCESS_TOKEN_EXPIRE_MINUTES`.

**Arreglo:** completado con todas las variables y comentarios de ejemplo.

### 14. `numpy<2` y `sentence-transformers==2.7.0` no instalan en Python 3.13/3.14

**Archivo:** `backend/requirements.txt`

Detectado al hacer `npm run l` en otra máquina con Python 3.14: el pin `numpy<2`
resuelve a `numpy 1.26.4`, que solo publica binarios hasta Python 3.12. En 3.13/3.14
pip intenta compilar numpy desde el código fuente y falla si no hay compilador de C
instalado (`ERROR: Unknown compiler(s): [['icl'], ['cl'], ['gcc']...]`). Lo mismo
aplicaba a `sentence-transformers==2.7.0`, anterior a numpy 2.

Ese pin era una protección para el `chromadb 0.4` antiguo; con chromadb 1.x (arreglo 9)
ya no hace falta.

**Arreglo:** eliminado `numpy<2` (numpy 2.x tiene binarios para Python 3.12–3.14) y
relajado a `sentence-transformers>=3.0`. Verificado en local: la instalación actualiza
numpy/sentence-transformers y el flujo completo (login + chat con RAG) sigue funcionando.

### 15. Limpieza menor

- `__pycache__/*.pyc` estaban versionados en git (el `.gitignore` ya los ignoraba, pero
  se subieron antes): sacados del índice con `git rm --cached`.
- `datetime.utcnow()` (deprecado en Python 3.12) sustituido por
  `datetime.now(timezone.utc)` en `auth_service.py`.

### Notas (no arreglado, para tener en cuenta)

- **El agente IA es un stub:** `agent.py` no llama a ningún LLM, solo devuelve el mensaje
  del usuario + el contexto del RAG. La `GROQ_API_KEY` y `langchain-groq` están instalados
  pero sin usar. El frontend tiene respuestas de fallback, por eso "parece" que contesta.
- La conexión a PostgreSQL es un único `conn`/`cursor` global compartido entre peticiones:
  funciona para una demo, pero no es seguro con concurrencia y si la conexión se cae no se
  reconecta. Lo razonable sería un pool (`psycopg2.pool`) o SQLAlchemy.
- El login crea una partida nueva en cada inicio de sesión; las partidas viejas quedan
  huérfanas en estado `active`.
- El README menciona OpenAI, N8N y React Router, pero el código real usa Groq (previsto),
  TanStack Router y no hay carpeta de workflows N8N.

---

## Cómo lanzar el proyecto en local

### Requisitos

- Python 3.12 (instalado: el venv ya está creado en `backend/venv`)
- Node.js (el frontend está pensado para Bun —hay `bun.lock`—)
- Acceso a la base de datos PostgreSQL (Supabase) — ya configurado en `backend/.env`

### Opción rápida: un solo comando

Desde la **raíz** del repo:

```powershell
npm run l
```

Este comando (`scripts/launch.mjs`) hace todo lo necesario:

1. Si falta `backend/.env` o `frontend/.env`, los crea desde los `.env.example` y avisa.
2. Si falta el venv del backend, lo crea con `python -m venv`.
3. Si `requirements.txt` cambió desde la última instalación (se guarda un hash en
   `backend/venv/.requirements.sha256`), ejecuta `pip install`.
4. Si falta `frontend/node_modules`, ejecuta `npm install`.
5. Arranca **backend** (`http://localhost:8000`, con `--reload`) y **frontend**
   (`http://localhost:8080`) a la vez, con la salida de cada uno prefijada
   (`[back]` / `[front]`).

`Ctrl+C` para los dos procesos. `npm run launch` es un alias del mismo comando.

> Si el frontend sale por el puerto 8081 en vez del 8080, es que quedó un proceso
> antiguo ocupando el 8080: ciérralo (o reinicia) y vuelve a lanzar.

### Opción manual (paso a paso)

#### 1. Backend (FastAPI)

```powershell
cd backend

# Solo la primera vez (ya hecho):
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt

# Configuración (ya hecho): copia .env.example a .env y rellena los valores
# copy .env.example .env

# Lanzar el servidor:
.\venv\Scripts\python -m uvicorn main:app --reload --port 8000
```

La API queda en `http://localhost:8000` (documentación interactiva en
`http://localhost:8000/docs`).

> Nota: la primera petición de chat tarda, porque `sentence-transformers` descarga el
> modelo de embeddings `all-MiniLM-L6-v2` (~90 MB) la primera vez.

Si cambias los documentos del RAG (`backend/rag/docs/`), regenera la base vectorial:

```powershell
cd backend
.\venv\Scripts\python rag\build_db.py
```

#### 2. Frontend (Vite + TanStack Start)

```powershell
cd frontend

# Solo la primera vez:
bun install        # (o: npm install)

# Configuración (ya hecho): frontend/.env con VITE_API_URL=http://localhost:8000

# Lanzar:
bun run dev        # (o: npm run dev)
```

Abre la URL que indique Vite (en esta máquina: `http://localhost:8080`).

### Flujo de prueba

1. Abre el frontend → te redirige a `/auth`.
2. Pulsa "NEW OPERATOR? REGISTER" y crea un usuario (email + contraseña).
3. Tras registrarte hace login automático, crea una partida y entra en `/game`.
4. Escribe en el chat: el backend responde con tu mensaje + contexto recuperado del RAG
   (recuerda que el LLM aún no está conectado, ver Notas).

### Verificación realizada (2026-06-11)

Todo el flujo se ha probado en esta máquina y funciona:

- `GET /` → `{"message": "ECHO system online"}`
- `POST /auth/register` → usuario creado en Supabase
- `POST /auth/login` → token JWT + partida nueva
- `POST /api/chat` → respuesta con contexto recuperado del RAG (ChromaDB)
- `GET /api/chat/history/{id}` → historial propio OK; partida de otro usuario → 403
- Frontend: `npm install` + `npm run dev` OK, typecheck (`tsc --noEmit`) sin errores,
  página servida en `http://localhost:8080`
