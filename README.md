# TGC Website

This repository contains the source code for the TGC website, a professional corporate website showcasing our services, team, and partnerships.

## Project Structure

```
├── index.html          # Main landing page
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── scripts.js      # JavaScript functionality
├── images/             # Image assets including partner logos
└── pages/             # Website pages
    ├── about.html     # About us page
    ├── contact.html   # Contact information
    ├── partners.html  # Partner showcase
    ├── services.html  # Services offered
    └── team.html      # Team members
```

## Features

- Responsive design for all device sizes
- Modern and professional layout
- Partner showcase section
- Team member profiles
- Services overview
- Contact information and form

## Partners

We are proud to work with leading organizations including:
- Microsoft
- HP
- Dell
- Lenovo
- Huawei
- Acer
- City of Tshwane
- Airports Company of South Africa (ACSA)
- PRASA
- Department of Justice and Constitutional Development
- Gauteng Department of Agriculture and Rural Development (GDARD)
- Johannesburg Road Agency (JRA)
- Nando's
- Sun International

## Getting Started

1. Clone this repository
2. Create a `.env` file based on `.env.example` with your Firebase configuration
3. Install dependencies: `npm install`
4. Run the security script: `node scripts/deploySecurityRules.js`
5. Start the server: `npm start`

## Security Features

This website implements multiple layers of security for Firebase configuration:

### 1. Firebase App Check
We use Firebase App Check with reCAPTCHA v3 to verify legitimate requests.

### 2. Security Rules
- Firestore and Storage have strict security rules that limit access based on authentication and authorization
- Admin-only features are protected by custom claims
- User data is protected through proper validation

### 3. Environment Variables
- Sensitive configuration is stored in environment variables
- The public config is injected at runtime
- No hardcoded credentials in client-side code

### 4. API Security
- Rate limiting prevents abuse
- CORS protection restricts origins
- Security headers prevent common web vulnerabilities

## Environment Setup
Create a `.env` file with the following variables:

```
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (Server-side only)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_SERVICE_ACCOUNT_ID=your-service-account

# Security
RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key
JWT_SECRET=your-secret-jwt-key
CORS_ORIGIN=https://your-domain.com
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## License

All rights reserved. This project and its contents are proprietary to TGC.