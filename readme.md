# ECHO

Juego estilo Escape Room donde conversas con una inteligencia artificial a bordo de una nave destruida.

Proyecto final del Bootcamp Fullstack + IA.

---

## Cómo funciona

Eres el comandante William Carter a bordo del **Aphelion**. La nave ha sufrido un accidente catastrófico y tienes que descubrir qué ocurrió.

Te comunicas con **ECHO**, la IA de a bordo, escribiendo en lenguaje natural. A partir de lo que preguntes, la historia avanza. Hay objetivos que completar y un desenlace oculto.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + TanStack Router + Zustand + Tailwind CSS |
| Backend | FastAPI (Python) |
| Base de datos | PostgreSQL |
| IA | OpenAI + LangChain + LangGraph |
| Memoria IA | ChromaDB (RAG sobre documentos de la historia) |
| Autenticación | JWT |

---

## Requisitos

- Node.js >= 18
- Python >= 3.10
- PostgreSQL
- Una API Key de OpenAI

---

## Inicio rápido

### 1. Backend

```bash
cd backend
cp .env.example .env   # rellena DATABASE_URL, SECRET_KEY, OPENAI_API_KEY
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # rellena VITE_API_URL (ej: http://localhost:8000)
npm install
npm run dev
```

Abre el navegador en la URL que indique la terminal.

---

## Variables de entorno

### Backend (.env)

```
DATABASE_URL=postgresql://usuario:password@localhost:5432/echo
SECRET_KEY=clave_secreta_para_jwt
OPENAI_API_KEY=sk-...
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
```

---

## Estructura del proyecto

```
echo/
├── frontend/          # Interfaz de juego
│   └── src/
│       ├── components/   # Hud, visor, popups, espacio
│       ├── routes/       # Páginas (auth, game, etc.)
│       ├── store/        # Estado global con Zustand
│       └── lib/          # API calls, utilidades
│
├── backend/           # API y lógica del juego
│   ├── agent/         # Agente conversacional (LangChain)
│   ├── rag/           # Base de conocimiento (ChromaDB)
│   ├── routers/       # Endpoints REST
│   ├── models/        # Modelos de base de datos
│   └── schemas/       # Validación con Pydantic
│
└── scripts/           # Utilidades
```

---

## Autor

Elías Medina