RetailIQ — AI-Powered Retail Platform(Currently In Active Development)RetailIQ is an AI-driven retail management system designed to revolutionize seller operations. Our platform currently streamlines core flows—from authentication to cart management—with a future roadmap focused on delivering comprehensive dashboards, advanced analytics, and seamless order fulfillment.This project is built using a modern stack: a Next.js 14 frontend and a Node.js + Firebase backend, all housed within a clean monorepo structure for efficient development.Current Progress & FeaturesWe've established a solid foundation for the platform. Here is a summary of our completed modules:Frontend (Next.js)StatusFeatureCompletedHome PageCompletedLogin PageCompletedSignup PageCompletedCart Page (QR flow base)CompletedAuth routing + Basic State ManagementBackend (Node.js + Firebase)StatusFeatureCompletedFirebase Admin ConfigurationCompletedLogin / Signup APIsCompletedCart APIsCompletedQR Scanning API BaseIn Progress & RoadmapWe are actively working on the following key areas to bring the full vision of RetailIQ to life:AreaFeaturesCore FlowFull Seller Dashboard, Product Listing / Inventory Flow, Final QR → Cart → Order JourneyAdvancedAdvanced Analytics, Role-based Access (Admin/Seller), Order History + Customer Tracking, Payments IntegrationDeploymentFrontend (Vercel) and Backend (Firebase/Render) DeploymentTech StackRetailIQ is built with robust and scalable technologies:FrontendNext.js 14ReactTailwindCSSShadCN UIBackendNode.jsExpressFirebase Admin SDKFirestore (Database)Project StructureThe monorepo organizes the different parts of the application cleanly:RetailIQ/
├── retailiqfrontend/       # Next.js 14 frontend application
├── retailiqbackend/        # Node.js + Express backend server
├── assets/                 # App screenshots and media
├── .gitignore
├── README.md
Local SetupFollow these simple steps to get RetailIQ running on your local machine:1. Clone the repositoryBashgit clone https://github.com/RohitKamble171012/RetailIQ.git
cd RetailIQ
2. Start the FrontendBashcd retailiqfrontend
npm install
npm run dev
3. Start the BackendBashcd retailiqbackend
npm install
npm start
ScreenshotsSee what we've built so far!Home Page<img src="./assets/Home.jpg" width="700" alt="Screenshot of the RetailIQ Home Page"/>Login Page<img src="./assets/login.jpg" width="700" alt="Screenshot of the RetailIQ Login Page"/>Signup Page<img src="./assets/signup.jpg" width="700" alt="Screenshot of the RetailIQ Signup Page"/>Dashboard Page<img src="./assets/dashboard.jpg" width="700" alt="Screenshot of the RetailIQ Dashboard Page"/>
