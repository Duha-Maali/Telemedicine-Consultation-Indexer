# Telemedicine Consultation Indexer — Frontend

A React frontend for securely uploading, processing, reviewing, and searching recorded telemedicine consultations.

The application allows doctors to upload consultation videos, monitor their processing status, search indexed transcript segments, and jump directly to matching moments in the video.

## Features

* Doctor registration and login
* Persistent authentication session
* Protected application routes
* Responsive dashboard layout
* Consultation statistics and recent activity
* Consultation upload with:

  * Drag-and-drop file selection
  * MP4, MOV, and MKV validation
  * Maximum file size validation
  * Upload progress tracking
  * Rate-limit and server error handling
* Consultation processing status monitoring
* Automatic status polling while processing
* Secure video playback with range requests
* Transcript search
* Direct navigation to matching video timestamps
* Consultation deletion with confirmation
* Responsive design for desktop and mobile devices
* Structured frontend logging

## Technology Stack

* React
* Vite
* Redux Toolkit
* React Redux
* React Router
* Axios
* React Hook Form
* CSS Modules
* Lucide React
* ESLint

## Project Structure

```text
src/
├── app/                    Redux store configuration
├── components/
│   ├── shared/             Reusable UI components
│   └── ...                 Feature-specific components
├── features/
│   ├── auth/               Authentication Redux state
│   └── consultations/      Consultation Redux state
├── layout/                 Authentication and dashboard layouts
├── pages/                  Route-level pages
├── routes/                 Router and route guards
├── services/               API and logging services
├── styles/                 Global styles and design variables
└── utils/                  Shared utilities and validation
```

## Prerequisites

Before running the frontend, make sure the following are installed:

* Node.js
* npm
* The Telemedicine Consultation Indexer backend API

The development proxy expects the backend API to be available at:

```text
http://localhost:8080
```

This can be changed in `vite.config.js`.

## Environment Configuration

Create a local `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=/api
```

The frontend uses `/api` so requests can pass through the Vite development proxy.

Environment files such as `.env` are intentionally excluded from Git.

## Installation

Install the project dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

The development server forwards `/api` requests to:

```text
http://localhost:8080
```

## Available Scripts

Run the development server:

```bash
npm run dev
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Authentication

The API returns a JWT access token after successful registration or login.

The frontend:

* Stores the authenticated doctor session locally.
* Adds the JWT to protected API requests through an Axios interceptor.
* Clears the session when an unauthorized response is received.
* Redirects unauthenticated users to the login page.

Video playback uses a secure HTTP-only cookie created by the backend. This allows the browser’s native `<video>` element to authenticate video range requests without exposing the cookie to JavaScript.

## Video Upload

Supported formats:

* MP4
* MOV
* MKV

Maximum video size:

```text
1 GB
```

The upload form validates the selected video before sending it and displays upload progress while the request is running.

## Consultation Processing

After a consultation is uploaded, the frontend displays its processing status.

Possible statuses include:

* Pending
* Processing
* Completed
* Failed
* Deletion Requested

The consultation details page polls the API while processing is active. Polling stops when the page is hidden and resumes when the user returns.

## Transcript Search

Once processing is complete, the doctor can search the indexed transcript.

Each result displays:

* Matching transcript text
* Segment start time
* Segment end time

Selecting a result moves the video player to the matching timestamp and starts playback.

## Production Notes

For a production deployment:

* Update the backend proxy or API base URL.
* Serve the frontend and API over HTTPS.
* Configure the backend’s forwarded headers when running behind a reverse proxy.
* Keep environment-specific values outside source control.
* Ensure the video authentication cookie is issued with secure production settings.

## Related Services

This frontend is part of a larger system containing:

* ASP.NET Core Web API
* PostgreSQL database
* RabbitMQ message broker
* Python processing worker
* Whisper transcription
* Shared consultation video storage
