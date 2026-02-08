To run the CreoKidsBank project, you need to start both the Python backend and the Next.js frontend in separate terminals.

Option 1:<br>
run the project bat in the root folder. Just run it, and it will open two windows for you automatically.<br>
.\run_project.bat

Option 2: Manual Setup
1. Start the Backend (API) Open a terminal and run:
cd backend
python -m uvicorn main:app --reload
This will start the server on http://localhost:8000.

3. Start the Frontend (App) Open a new terminal (keep the backend running!) and run:
bash
cd creo-kids-bank
npm run dev
This will start the web app on http://localhost:3000.

Once running, simply go to http://localhost:3000 in your browser to use the app!

