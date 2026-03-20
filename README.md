# Work Travel Log App

A lightweight web application designed for field technicians to log daily travel activity quickly and accurately.

The app allows users to record multiple trips per day, including departure times, destinations, vehicle kilometers, and fuel levels, and provides a structured preview for manual logbook entry.

---

## Purpose

In many field service workflows, technicians are required to:

- Track multiple daily trips
- Record exact vehicle kilometers at each destination
- Maintain a written logbook at the end of the day

This application eliminates the need for screenshots and memory-based tracking by providing a simple, structured interface to record all travel data in real time.

---

## Features

- Daily travel logging with multiple entries
- Fields per trip:
  - Name (Ονομα)
  - Date (Ημερομηνια)
  - Departure time (Ωρα αναχωρισης)
  - Destination (Προορισμος)
  - Arrival kilometers (ΧΛΜ αφιξης)
  - Fuel percentage (Ποσοστο καυσιμου)
  - Return/departure time
- Automatic data persistence using local storage
- Clean preview table matching manual logbook format
- One-click name autofill across all entries
- Input validation for kilometers and fuel percentage
- Confirmation before clearing daily data

---

## How It Works

- Each day is stored separately based on the selected date
- Data is automatically saved in the browser (localStorage)
- Users can close and reopen the app without losing data
- The preview section provides a clean format for manual transcription

---

## Tech Stack

- React (Vite)
- Tailwind CSS
- Local Storage (browser-based persistence)
- Lucide Icons

---

## Installation (Local Development)

```bash
npm install
npm run dev
