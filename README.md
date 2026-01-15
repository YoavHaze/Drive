# Drive
# 📂 Google Drive Clone - Advanced System Programming

## Description
This project is a comprehensive **Full-Stack File Storage System** inspired by Google Drive. It was built as a cumulative project for the "Advanced System Programming" course, evolving from a basic local CLI tool into a distributed, multi-client cloud storage solution.

The system allows users to upload, download, manage, and share files securely across different platforms (Web & Mobile), utilizing efficient compression algorithms and a robust architecture.

## 🚀 Key Features
* **Cross-Platform Access:** Accessible via a **React Web Interface** and a native **Android App**.
* **High-Performance Storage:** The core storage engine is written in **C++** for optimal performance and file handling.
* **Smart Compression:** Implements **RLE (Run-Length Encoding)** to save space on the server.
* **Secure Authentication:** User registration, login, and role-based permissions (Viewer/Editor) managed via **Node.js**.
* **Scalable Database:** Uses **MongoDB** for managing user metadata, directory structures, and file permissions.
* **Containerized:** Fully Dockerized environment for easy deployment.

## 🏗️ Architecture & Tech Stack

We designed the system using **Microservices** and **MVC** principles to ensure separation of concerns and scalability.

### 1. The Core (Storage Server) - `C++`
* Acts as the heavy-lifter of the system.
* Handles physical file I/O operations and compression algorithms.
* Supports concurrent connections using **Multi-threading** and **Thread Pool**.
* **Communication:** Listens for TCP commands from the API Gateway.

### 2. The API Gateway (Backend) - `Node.js` & `Express`
* Serves as the entry point for all clients.
* **Logic:** Handles Business Logic, JWT Authentication, and Permissions.
* **Database:** Connects to **MongoDB** to store user info and file metadata (names, paths, owners).
* **Bridge:** Validates requests and forwards file operations to the C++ server via TCP.

### 3. The Clients (Frontend)
* **Web Client:** A modern SPA built with **React** for desktop users.
* **Mobile Client:** A native **Android** application for on-the-go access.

## 🛠️ Project Evolution

The project was built in 4 main milestones, strictly adhering to **SOLID** and **Open/Closed** principles:

* **Part 1: CLI Tool** - A local C++ program for file compression and management using the Command Pattern.
* **Part 2: TCP Server** - Converted the CLI into a Multi-threaded TCP Server supporting concurrent C++ and Python clients.
* **Part 3: Web API & React** - Wrapped the C++ server with a Node.js REST API and added a React Frontend.
* **Part 4: Database & Mobile** - Integrated **MongoDB** for robust data persistence and added an **Android** client.

## 📦 How to Build and Run

The entire system is containerized. You can bring up all services (Database, Backend, Storage, Web) with a single command.

### Prerequisites
* Docker & Docker Compose

### Build & Start
To build and run the entire system:
```bash
docker-compose up --build
