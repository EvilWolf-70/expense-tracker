# Render Deployment Guide: Separate Frontend and Backend

This guide details how to deploy your Expense Tracker application to **Render** now that the `/backend` and `/frontend` folders are completely separate.

Since they are separate, we will deploy them as **two separate services** on Render (a Node.js Web Service for the backend, and a Static Site for the frontend).

---

## Step 1: Push Your Code to GitHub

Your local repository is now clean (with root `.gitignore` ignoring dependencies and local `.env` files).

1. Push your latest separate folder structure to GitHub:
   ```bash
   git add .
   git commit -m "Separate frontend and backend completely"
   git push origin master
   ```

---

## Step 2: Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Network Access** and make sure you allow connections from anywhere (`0.0.0.0/0`).
3. Copy your MongoDB connection string (looks like `mongodb+srv://...`) and keep it ready.

---

## Step 3: Deploy the Backend (Web Service)

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Link your GitHub repository.
4. Set the following configuration:
   * **Name**: `expense-tracker-backend`
   * **Root Directory**: `backend` *(CRITICAL: This tells Render to run inside the backend folder)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   * `NODE_ENV` = `production`
   * `MONGO_URI` = *(Your MongoDB Atlas connection string)*
6. Click **Deploy Web Service**.
7. Once deployed, **copy the URL of your backend** (e.g., `https://expense-tracker-backend.onrender.com`).

---

## Step 4: Deploy the Frontend (Static Site)

1. In the Render Dashboard, click **New +** -> **Static Site**.
2. Link your GitHub repository.
3. Set the following configuration:
   * **Name**: `expense-tracker-frontend`
   * **Root Directory**: `frontend` *(CRITICAL: This tells Render to run inside the frontend folder)*
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `dist`
4. Under **Redirects/Rewrites** (on the sidebar of your Static Site once created, or during setup):
   * Add a rule to forward frontend API requests to your backend:
     * **Source**: `/api/*`
     * **Destination**: `https://your-backend-url.onrender.com/api/*` *(Replace with your backend URL from Step 3)*
     * **Action**: `Rewrite`
   > [!NOTE]
   > This Rewrite rule is extremely important! It forwards all requests from `/api/...` on the frontend directly to the backend without any CORS issues or needing to change your React code.
5. Click **Create Static Site**.

---

## Step 5: Verify

Open your Frontend Static Site URL. Everything should work perfectly!
