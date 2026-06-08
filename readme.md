# Escape Room AI

Proyecto final del Bootcamp Fullstack + IA.

## Descripción

Escape Room AI es una aplicación web donde el usuario debe escapar de una habitación interactuando mediante lenguaje natural con una inteligencia artificial.

La IA actúa como narrador del juego, responde a las acciones del jugador y utiliza una base de conocimiento mediante RAG para mantener la coherencia de la historia y los acertijos.

## Tecnologías

### Frontend

* React
* Vite
* React Router
* Context API

### Backend

* FastAPI
* PostgreSQL
* JWT Authentication
* SQLAlchemy

### Inteligencia Artificial

* OpenAI
* LangChain
* LangGraph
* ChromaDB

### Automatización

* N8N

## Funcionalidades

* Registro e inicio de sesión
* Rutas protegidas con JWT
* Creación de partidas
* Chat con IA
* Historial de conversaciones
* RAG sobre documentos del juego
* Workflow N8N conectado a la API

## Base de Datos

### users

* id
* username
* email
* password_hash

### games

* id
* user_id
* status

### chat_history

* id
* game_id
* user_message
* ai_response

## Endpoints principales

### Autenticación

```http
POST /auth/register
POST /auth/login
```

### Chat

```http
POST /api/chat
GET /api/chat/history/{game_id}
```

## Estructura del proyecto

```text
escape-room-ai/
│
├── frontend/
│
├── backend/
│   ├── agent/
│   ├── docs/
│   ├── models/
│   ├── routers/
│   └── main.py
│
├── n8n-workflows/
│
└── README.md
```

## Variables de entorno

### Backend

```env
DATABASE_URL=
SECRET_KEY=
OPENAI_API_KEY=
N8N_WEBHOOK_URL=
```

### Frontend

```env
VITE_API_URL=
```

## Autor

Elías Medina
