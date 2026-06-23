# Render Deployment Guide: MERN Expense Tracker

This guide details the step-by-step process of deploying your MERN stack Expense Tracker application to **Render**.

---

## Prerequisites
1. A **GitHub** account.
2. A **Render** account (free at [render.com](https://render.com)).
3. A **MongoDB Atlas** account (free at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)).

---

## Step 1: Push Your Code to GitHub

We have already cleaned up your local repository by untracking `node_modules` and `.env` files and creating a `.gitignore` at the root.

To push your code to your GitHub repository:

1. Open your terminal at the project root.
2. If you haven't linked a GitHub repository yet, run:
   ```bash
   git remote add origin <YOUR_GITHUB_REPO_URL>
   ```
3. Push your committed changes to GitHub:
   ```bash
   git branch -M master
   git push -u origin master
   ```

---

## Step 2: Set Up MongoDB Atlas (Production Database)

Render does not host MongoDB databases directly, so you need a free hosted MongoDB database.

1. **Log in** to your [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas).
2. Create a new **Shared Cluster** (which is 100% Free).
3. Under **Security -> Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`).
   > [!NOTE]
   > This is required because Render's outbound IPs are dynamic and change constantly.
4. Under **Security -> Database Access**, create a database user with a password. Write these down.
5. Go to your **Database** dashboard, click **Connect** on your cluster, and choose **Drivers** (Node.js).
6. Copy the connection string. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
7. Replace `<username>` and `<password>` with your database user's details. Keep this connection string ready.

---

## Step 3: Create a Web Service on Render

We will deploy both the backend API and the compiled React frontend together as a single Web Service. The Express server will serve the static React frontend in production.

1. **Log in** to your [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top right and select **Web Service**.
3. Select **Connect a repository** and link your GitHub repository.
4. Set the following configuration values:
   * **Name**: `expense-tracker`
   * **Region**: Choose the region closest to you or your users (e.g., `Singapore` or `Oregon`).
   * **Branch**: `master` (or `main` depending on your default branch name).
   * **Root Directory**: *Leave empty* (we are deploying from the root of the repository).
   * **Runtime**: `Node`
   * **Build Command**: `npm run build`
   * **Start Command**: `npm start`

---

## Step 4: Configure Environment Variables on Render

Scroll down to the **Environment Variables** section (or go to the **Env Groups** / **Environment** tab after creation) and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Tells Express to serve the built React files statically. |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 2. |

> [!IMPORTANT]
> Double check that your MongoDB Atlas password in `MONGO_URI` doesn't contain special characters (like `@`, `:`, `/`, etc.) that aren't URL-encoded. If it does, URL-encode them or change your password to alphanumeric characters.

---

## Step 5: Deploy and Verify

1. Click **Deploy Web Service**.
2. Render will download your repository, run `npm run build` (which installs both frontend and backend dependencies, and builds the React frontend), and then run `npm start` to run your backend.
3. Once the build finishes and says `Live`, click the URL provided at the top of your Render page.
4. Your Expense Tracker application should load and connect successfully to MongoDB Atlas!
