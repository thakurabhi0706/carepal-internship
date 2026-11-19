# TheCarePal – Care Plan Builder & Price Estimator

A responsive, bilingual care plan builder that helps families estimate home healthcare costs based on their care requirements. The application allows customers to customize care plans, view detailed price breakdowns, compare two plans, and submit enquiries directly to the operations team.

**Internship Assignment:** FS-01 – Care Plan Builder and Price Estimator  
**Role:** Full Stack Developer Intern  
**Project:** TheCarePal

---

## Overview

TheCarePal is a home healthcare platform designed to simplify the process of understanding and estimating the cost of professional home care services.

Families often need to contact healthcare providers just to understand the approximate cost of care. This application addresses that problem through an interactive price estimator that allows users to configure their requirements and receive an instant estimate.

The application also includes an admin dashboard where authorized administrators can manage customer enquiries.

<img width="2838" height="1434" alt="image" src="https://github.com/user-attachments/assets/bae80fe9-2a63-4c6d-b72d-8dc2a8768c74" />
<img width="2866" height="1446" alt="image" src="https://github.com/user-attachments/assets/368f08c0-647d-429a-98cc-6b5369ab515e" />
<img width="2846" height="1442" alt="image" src="https://github.com/user-attachments/assets/80740efd-2722-48be-be5b-d5573db54c1a" />

## Features

### 1. Interactive Care Plan Builder
- Step-by-step care plan configuration.
- Supports four care categories:
  - Elderly Care
  - Alzheimer's / Dementia Care
  - Baby Care
  - Post-Surgery Recovery
- City-based care selection.
- Daily care duration: 8, 12 or 24 hours.
- Day shift and live-in care options.
- Flexible care plan duration.
- Optional physiotherapy visits.

### 2. Dynamic Price Estimation
- Automatically calculates estimates based on selected requirements.
- Pricing configuration maintained separately from UI components.
- Itemized cost breakdown.
- Includes care costs, add-ons and GST.
- Updates estimates whenever the user changes their selections.

### 3. Plan Comparison
- Compare two different care plans side by side.
- Customize the alternative plan independently.
- View individual pricing breakdowns.
- Identify the price difference between plans.
- Responsive comparison modal.

### 4. Customer Enquiry Management
- Customer details collection.
- Name, phone number, email and preferred callback time.
- Form validation.
- Enquiries stored in Firebase Firestore.
- Submission confirmation and error handling.

### 5. WhatsApp Estimate Sharing
- Generate a prefilled WhatsApp message containing care plan details.
- Share the estimated price and selected requirements.
- Supports sharing estimates in the selected language.

### 6. English and Hindi Support
- Complete English / Hindi language toggle.
- Centralized translation management.
- Instant language switching without refreshing.
- Selected language preference persists using localStorage.
- Supports both customer-facing pages and admin interface.

### 7. Admin Dashboard
- Firebase Authentication-based admin login.
- Protected admin routes.
- Real-time enquiry updates using Firestore listeners.
- Dashboard statistics.
- Search enquiries by customer information.
- Filter enquiries by status.
- View detailed customer and care plan information.
- Update enquiry statuses.
- Export filtered enquiries as CSV.
- Responsive dashboard layout.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend development |
| Vite | Development server and build tool |
| Tailwind CSS v4 | Styling and responsive UI |
| JavaScript | Application logic |
| Firebase Authentication | Admin authentication |
| Cloud Firestore | Enquiry storage and real-time updates |
| React Router | Application routing |
| Lucide React | Icons |

---

## Project Structure

The application follows a component-based React architecture.

```text
src/
├── components/
│   ├── EstimateForm.jsx
│   ├── PlanComparison.jsx
│   └── ...shared components
│
├── pages/
│   ├── ...customer-facing pages
│   └── ...admin pages
│
├── context/
│   └── ...application contexts
│
├── locales/
│   ├── en.js
│   └── hi.js
│
├── lib/
│   └── firebase.js
│
├── utils/
│   └── pricing.js
│
├── App.jsx
└── main.jsx
```

---

## How the Application Works

### Customer Workflow

1. The customer visits the homepage.
2. Selects their preferred language (English or Hindi).
3. Opens the care plan calculator.
4. Selects the care category, city, daily hours, shift and duration.
5. Adds optional services such as physiotherapy.
6. Receives an automatically calculated estimate.
7. Optionally compares the selected plan with an alternative plan.
8. Shares the estimate through WhatsApp or submits an enquiry.
9. The enquiry is stored in Firebase Firestore.

### Admin Workflow

1. The administrator accesses the admin login page.
2. Authenticates using Firebase Authentication.
3. Views incoming enquiries in the dashboard.
4. Searches and filters enquiries.
5. Opens individual enquiries to view customer and care plan details.
6. Updates enquiry statuses.
7. Exports filtered enquiry records as CSV.

### Pricing Logic

Pricing is calculated using a centralized pricing utility rather than being scattered across UI components.

The calculator uses the selected care requirements and pricing configuration to calculate:

- Base care cost.
- Additional service costs.
- Applicable GST.
- Final estimated amount.

The same pricing logic is used for both the original and alternative care plans.

---

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js and npm installed.
- Git installed.
- A Firebase project.
- Firebase Authentication and Cloud Firestore enabled.

### 1. Clone the Repository

```bash
git clone https://github.com/thakurabhi0706/carepal-internship
```

Navigate into the project directory:

```bash
cd carepal-internship
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project through the [Firebase Console](https://console.firebase.google.com/).

Enable:
- Firebase Authentication.
- Cloud Firestore.

Configure your Firebase web application credentials.

Create a `.env` file in the project root using the environment variable names expected by your Firebase configuration.

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Important:** These are example variable names. Match them with the actual variable names used in `src/lib/firebase.js`.

Never commit your `.env` file, Firebase service-account credentials or other secrets to GitHub.

### 4. Configure Firestore

Create the `careLeads` collection through your application by submitting an enquiry.

Configure Firestore security rules to ensure:

- Customers can submit valid enquiries.
- Only authorized administrators can read enquiries.
- Only authorized administrators can update permitted enquiry fields.

Use the project's actual Firestore security rules when deploying.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

### 6. Create a Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Security Considerations

- Firebase Authentication protects administrator access.
- Protected routes restrict access to the admin dashboard.
- Firestore security rules enforce data access permissions.
- Sensitive configuration values are stored in environment variables.
- CSV export includes protection against spreadsheet formula injection.
- Only synthetic or self-generated demonstration data should be used.

Do not expose Firebase service-account credentials, passwords or private configuration files in the public repository.

---

## Future Improvements

Some improvements that could be considered in future versions:

- PDF generation for downloadable care estimates.
- Automated email and SMS notifications for new enquiries.
- More detailed admin analytics and reporting.
- Editable pricing configuration through the admin dashboard.
- Additional regional language support.
- Improved customer enquiry tracking.
- Deployment with a custom domain and production monitoring.

---

## AI Tools Used

AI tools were used as development assistants during the project.

- **ChatGPT:** Assistance with debugging, React component development, Firebase integration, UI improvements, documentation and implementation guidance.
- **VS Code AI Agent:** Assistance with codebase analysis, implementation of the bilingual language system and code modifications.

All generated and modified code was reviewed and tested as part of the development process.

---

## Assignment Requirements

The project implements the core requirements of the FS-01 assignment:

| Requirement | Implementation |
|---|---|
| Step-by-step care form | Implemented |
| Multiple care categories | Implemented |
| City, hours, shift and duration | Implemented |
| Configurable pricing | Implemented |
| Live estimate with GST | Implemented |
| Customer enquiry capture | Implemented |
| Admin login | Implemented |
| Admin enquiry management | Implemented |
| CSV export | Implemented |
| Mobile responsiveness | Implemented |
| Compare two plans | Implemented |
| WhatsApp sharing | Implemented |
| Hindi language toggle | Implemented |

---

## Author

Abhishek (thakurabhi0706)
---

## License

This project was developed as an internship assignment. No additional license has been specified.
