// Global Variables
const SHEET_NAME = "Safety Interaction Tracker";
const ADMIN_EMAIL = "";
const FOLDER_ID = "";  // Folder ID to save PDFs

// Initialize the sheet
function initializeSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear(); // Clear existing content
  }

  const headers = [
    "Timestamp", "Observer Name", "Observer Employee ID", "Observer Email",
    "ZIC", "Start Time", "End Time", "Duration (hrs)", "Location",
    "Observation Category", "Observation Sub Category", "Risk Potential",
    "Number of Observers", "Situation", "Observation Description",
    "Status (Open/Close)", "Action Details", "Responsibilities",
    "Target Date", "Action Status", "Unique ID"
  ];
  sheet.appendRow(headers);
}

// Handle GET requests for the web app
function doGet(e) {
  const page = e.parameter.page;
  if (page === "admin") {
    return HtmlService.createHtmlOutputFromFile("AdminPanel").setTitle("Admin Panel");
  } else {
    return HtmlService.createHtmlOutputFromFile("UserForm").setTitle("Safety Interaction Form");
  }
}

// Handle user form submission
function submitUserForm(formData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const timestamp = new Date();

  // Generate Unique ID
  const uniqueID = generateUniqueID();

  // Calculate duration in hours
  const startTime = new Date(`1970-01-01T${formData.startTime}:00Z`);
  const endTime = new Date(`1970-01-01T${formData.endTime}:00Z`);
  const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2);

  // Append data to the sheet
  sheet.appendRow([
    timestamp, formData.observerName, formData.observerEmployeeID, formData.observerEmail,
    formData.zic, formData.startTime, formData.endTime, duration, formData.location,
    formData.observationCategory, formData.observationSubCategory, formData.riskPotential,
    formData.numObservers, formData.situation, formData.description,
    "Open", "", "", "", "Pending", uniqueID
  ]);

  // Send confirmation emails
  sendEmailToUser(formData, duration, uniqueID);
  sendEmailToAdmin(formData, duration, uniqueID);
}

// Generate Unique ID
function generateUniqueID() {
  return "ID-" + new Date().getTime();
}

// Handle admin panel submission
function submitAdminPanel(adminData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  const uniqueID = adminData.uniqueID.trim();

  if (!uniqueID) {
    throw new Error("Unique ID is missing or invalid.");
  }

  // Find the row by Unique ID
  const rowIndex = rows.findIndex(row => row[20] && row[20].trim() === uniqueID);

  if (rowIndex > 0) {
    // Update the fields
    sheet.getRange(rowIndex + 1, 16).setValue(adminData.status);
    sheet.getRange(rowIndex + 1, 17).setValue(adminData.actionDetails);
    sheet.getRange(rowIndex + 1, 18).setValue(adminData.responsibilities);
    sheet.getRange(rowIndex + 1, 19).setValue(adminData.targetDate);
    sheet.getRange(rowIndex + 1, 20).setValue(adminData.actionStatus);

    // Retrieve user data for email
    const userData = rows[rowIndex];
    sendAdminActionEmail(userData, adminData);

    // Generate and store PDF
    generateAndStorePDF(userData);

    return "Record updated successfully.";
  } else {
    throw new Error("No matching record found for the provided Unique ID.");
  }
}
// Generate PDF and store in Google Drive
function generateAndStorePDF(userData) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const uniqueID = userData[20];
  const observerID = userData[2];
  const pdfName = `${uniqueID}_${observerID}.pdf`;

  // Create HTML content for PDF
  const htmlContent = `
    <h1>Safety Interaction Form Details</h1>
    <p><strong>Unique ID:</strong> ${uniqueID}</p>
    <p><strong>Observer Name:</strong> ${userData[1]}</p>
    <p><strong>Observer Employee ID:</strong> ${userData[2]}</p>
    <p><strong>Observer Email:</strong> ${userData[3]}</p>
    <p><strong>ZIC:</strong> ${userData[4]}</p>
    <p><strong>Start Time:</strong> ${userData[5]}</p>
    <p><strong>End Time:</strong> ${userData[6]}</p>
    <p><strong>Duration (hrs):</strong> ${userData[7]}</p>
    <p><strong>Location:</strong> ${userData[8]}</p>
    <p><strong>Observation Category:</strong> ${userData[9]}</p>
    <p><strong>Observation Sub Category:</strong> ${userData[10]}</p>
    <p><strong>Risk Potential:</strong> ${userData[11]}</p>
    <p><strong>Number of Observers:</strong> ${userData[12]}</p>
    <p><strong>Situation:</strong> ${userData[13]}</p>
    <p><strong>Observation Description:</strong> ${userData[14]}</p>
    <p><strong>Status:</strong> ${userData[15]}</p>
    <p><strong>Action Details:</strong> ${userData[16]}</p>
    <p><strong>Responsibilities:</strong> ${userData[17]}</p>
    <p><strong>Target Date:</strong> ${userData[18]}</p>
    <p><strong>Action Status:</strong> ${userData[19]}</p>
  `;

  const htmlBlob = HtmlService.createHtmlOutput(htmlContent).getBlob().setName(`${pdfName}.html`);
  const pdfBlob = htmlBlob.getAs(MimeType.PDF);

  // Save the PDF file
  folder.createFile(pdfBlob).setName(pdfName);
}

// Send email confirmation to the user
function sendEmailToUser(formData, duration, uniqueID) {
  const subject = "Safety Interaction Form Submission Confirmation";
  const body = `
    Dear ${formData.observerName},

    Your Safety Interaction Form has been submitted successfully with the following details:

    **Form Details:**
    - Unique ID: ${uniqueID}
    - Observer Name: ${formData.observerName}
    - Employee ID: ${formData.observerEmployeeID}
    - Email: ${formData.observerEmail}
    - ZIC: ${formData.zic}
    - Start Time: ${formData.startTime}
    - End Time: ${formData.endTime}
    - Duration: ${duration} hrs
    - Location: ${formData.location}
    - Observation Category: ${formData.observationCategory}
    - Sub Category: ${formData.observationSubCategory}
    - Risk Potential: ${formData.riskPotential}
    - Number of Observers: ${formData.numObservers}
    - Situation: ${formData.situation}
    - Description: ${formData.description}
    
    Thank you for your submission.
  `;
  GmailApp.sendEmail(formData.observerEmail, subject, body);
}

// Send email notification to the admin
// Send email notification to the admin with a button to access the Admin Panel
function sendEmailToAdmin(formData, duration, uniqueID) {
  const adminPanelUrl = `${ScriptApp.getService().getUrl()}?page=admin`; // URL to access Admin Panel
  const subject = "New Safety Interaction Form Submission";
  const htmlBody = `
    <p>A new Safety Interaction Form has been submitted:</p>
    <ul>
      <li><strong>Unique ID:</strong> ${uniqueID}</li>
      <li><strong>Observer Name:</strong> ${formData.observerName}</li>
      <li><strong>Email:</strong> ${formData.observerEmail}</li>
      <li><strong>Employee ID:</strong> ${formData.observerEmployeeID}</li>
      <li><strong>ZIC:</strong> ${formData.zic}</li>
      <li><strong>Start Time:</strong> ${formData.startTime}</li>
      <li><strong>End Time:</strong> ${formData.endTime}</li>
      <li><strong>Duration (hrs):</strong> ${duration}</li>
      <li><strong>Location:</strong> ${formData.location}</li>
      <li><strong>Observation Category:</strong> ${formData.observationCategory}</li>
      <li><strong>Sub Category:</strong> ${formData.observationSubCategory}</li>
      <li><strong>Risk Potential:</strong> ${formData.riskPotential}</li>
      <li><strong>Number of Observers:</strong> ${formData.numObservers}</li>
      <li><strong>Situation:</strong> ${formData.situation}</li>
      <li><strong>Description:</strong> ${formData.description}</li>
    </ul>
    <p>
      <a href="${adminPanelUrl}" target="_blank" style="
        display: inline-block;
        padding: 10px 20px;
        color: #ffffff;
        background-color: #007BFF;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;">
        Open Admin Panel
      </a>
    </p>
    <p>Click the button above to review and take action on the submitted form.</p>
  `;

  // Send email with HTML content
  GmailApp.sendEmail(ADMIN_EMAIL, subject, "", { htmlBody: htmlBody });
}


// Send confirmation email after admin action
function sendAdminActionEmail(userData, adminData) {
  const observerEmail = userData[3];
  const subject = `Update on Your Safety Interaction Form (ID: ${adminData.uniqueID})`;
  const body = `
    Dear ${userData[1]},

    An update has been made to your form submission:

    **Form Details:**
    - Observer Name: ${userData[1]}
    - Email: ${userData[3]}
    - Unique ID: ${adminData.uniqueID}
    - Status: ${adminData.status}
    - Action Details: ${adminData.actionDetails}
    - Responsibilities: ${adminData.responsibilities}
    - Target Date: ${adminData.targetDate}
    - Action Status: ${adminData.actionStatus}
  `;
  GmailApp.sendEmail(observerEmail, subject, body);

  const adminSubject = `Admin Action Update (ID: ${adminData.uniqueID})`;
  const adminBody = `
    Update details:

    **Form Details:**
    - Observer Name: ${userData[1]}
    - Email: ${userData[3]}
    - Unique ID: ${adminData.uniqueID}
    - Status: ${adminData.status}
    - Action Details: ${adminData.actionDetails}
    - Responsibilities: ${adminData.responsibilities}
    - Target Date: ${adminData.targetDate}
    - Action Status: ${adminData.actionStatus}
  `;
  GmailApp.sendEmail(ADMIN_EMAIL, adminSubject, adminBody);
}
