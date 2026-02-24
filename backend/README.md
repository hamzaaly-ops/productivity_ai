productivity-ai/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── core/
│   │   └── utils/
│   │
│   ├── ml/
│   │   ├── feature_engineering.py
│   │   ├── productivity_score.py
│   │   ├── anomaly_detector.py
│   │   └── burnout_detector.py
│   │
│   ├── tasks/
│   │   └── daily_jobs.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── .env.local
│   └── package.json
│
├── docker-compose.yml
└── README.md

mkdir productivity-ai
cd productivity-ai

mkdir backend
cd backend

python -m venv venv


venv\Scripts\activate

pip install fastapi uvicorn sqlalchemy psycopg2-binary \
pydantic python-dotenv passlib[bcrypt] python-jose \
pandas numpy scikit-learn redis celery

uvicorn app.main:app --reload