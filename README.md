# ☁️ Google Drive Cloud

A comprehensive **Full-Stack Cloud Storage System** inspired by Google Drive.
This project represents the culmination of the "Advanced System Programming" course, evolving from a local CLI tool into a distributed, multi-platform system with web and mobile interfaces.

**Created by:** Yoav Haze & Ophir Finchelstein & Yehonatan Shemesh
**Course:** Advanced System Programming @ BIU

🔗 **Repository:** [GitHub - YoavHaze/Drive](https://github.com/YoavHaze/Drive.git)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation & Run](#installation--run)
- [API Documentation](#api-documentation)
- [Design Patterns](#design-patterns)
- [Project Evolution](#project-evolution)

---

## Overview

[cite_start]CloudDrive is a high-performance, distributed file storage service[cite: 1, 4]. It allows users to store files securely, organize them in folders, and access them from anywhere via a **Web Dashboard** or a dedicated **Android App**.

**Core Capabilities:**
* [cite_start]📁 **Smart Storage:** Efficient file handling with **RLE Compression** and multi-threaded processing[cite: 5].
* 🔄 **Cross-Platform:** Seamless synchronization between Web (React) and Mobile (Android).
* 🗄️ **Persistent Data:** User metadata and file structure managed by **MongoDB**.
* [cite_start]⚡ **High Performance:** Core storage engine written in **C++** for maximum speed[cite: 9].

---

## Architecture

[cite_start]The system follows a **Microservices Architecture**, separating the frontend, business logic, and storage engine[cite: 4, 7].
