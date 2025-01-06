# Form-Manager



## Overview
The **Form-Manager** is a Google Apps Script (GAS) project designed to facilitate the tracking and management of safety observations within an organization. This project automates form submissions, generates PDFs, and notifies users and administrators via email.

## Features
- **Dynamic Spreadsheet Initialization**: Automatically creates or resets a Google Sheet with appropriate headers to store safety observations.
- **Web App Integration**: Provides a user-friendly interface for submitting safety observations and an admin panel for managing records.
- **Unique ID Generation**: Ensures each submission is uniquely identified for easy tracking.
- **PDF Generation and Storage**: Generates PDFs for each submission and stores them in a specified Google Drive folder.
- **Email Notifications**: Sends email confirmations to users and alerts to administrators with submission details.


## How It Works
1. **Initialization**: When deployed, the script creates a sheet named "Safety Interaction Tracker" with predefined headers.
2. **Form Submission**: Users fill out a web form with safety observation details.
3. **Data Processing**: The script calculates observation duration, generates a unique ID, and logs the data into the sheet.
4. **Email Notifications**: Upon submission, the user receives a confirmation email, and the admin receives an alert with submission details.
5. **Admin Panel**: Admins can update the status of observations via a dedicated panel. Updates trigger notifications to the user.
6. **PDF Generation**: After admin action, a PDF summary is generated and stored in Google Drive.

## Setup

 1. Open Google Apps Script
 2. Copy the code from Code.gs into the script editor
 3. Create HTML files for AdminPanel.html and UserForm.html
 4. Replace the following placeholders in Code.gs:
const ADMIN_EMAIL = "your-admin-email@example.com";  // Admin email
const FOLDER_ID = "your-google-drive-folder-id";      // Folder ID for PDF storage

 5. Deploy the project as a Web App:
 - Click Deploy > New Deployment > Web app
 - Set Who has access to "Anyone with the link"

 6. Share the web app URL with users for form submissions
