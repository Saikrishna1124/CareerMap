export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract';
  salary: string;
  postedAt: string;
  matchScore: number;
  skills: string[];
  missingSkills: string[];
  learningRoadmap: string[];
  suggestedProjects: string[];
  interviewTips: string[];
  description: string;
  url: string;
  whyRecommended?: string;
  eligibilityStatus?: 'High' | 'Medium' | 'Low';
}

export const MASTER_OPPORTUNITIES: Omit<Opportunity, 'matchScore' | 'missingSkills' | 'whyRecommended'>[] = [
  // --- INTERNSHIPS ---
  {
    id: "intern-google-swe-2025",
    title: "Software Engineering Intern, Summer 2025",
    company: "Google",
    location: "Mountain View, CA / Remote",
    type: "Internship",
    salary: "$8,500/month + Housing Stipend",
    postedAt: "Active Now",
    skills: ["Python", "Java", "C++", "Data Structures", "Algorithms"],
    learningRoadmap: [
      "Master Big-O analysis and advanced graph/tree traversal algorithms",
      "Build a scalable multi-threaded client-server project",
      "Practice 50+ LeetCode Medium data structures problems with edge-case tests"
    ],
    suggestedProjects: [
      "Distributed In-Memory Key-Value Cache",
      "Real-Time Collaborative Code Editor"
    ],
    interviewTips: [
      "Clarify all boundary conditions before writing the first line of code",
      "Communicate your thought process and trade-offs out loud during live coding"
    ],
    description: "Join Google as a Software Engineering Intern to build impactful software applications used by billions of users worldwide. You will collaborate with elite engineers on Google Search, Cloud, YouTube, or Android ecosystems.",
    url: "https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineering%20Intern",
    eligibilityStatus: "High"
  },
  {
    id: "intern-meta-frontend",
    title: "Frontend Engineering Intern",
    company: "Meta",
    location: "Menlo Park, CA / London / Remote",
    type: "Internship",
    salary: "$8,200/month + Relocation",
    postedAt: "1 day ago",
    skills: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "UI/UX"],
    learningRoadmap: [
      "Master modern React concurrent features, hooks, and virtual DOM reconciliation",
      "Build accessible and high-performance user interface components",
      "Study web performance profiling, Lighthouse optimization, and asset bundling"
    ],
    suggestedProjects: [
      "Interactive Real-Time Social Dashboard with WebSockets",
      "Headless UI Component Library with Tailwind CSS & Motion"
    ],
    interviewTips: [
      "Demonstrate deep knowledge of JavaScript closures, promises, and the event loop",
      "Be prepared to break down complex UI design requirements into modular components"
    ],
    description: "Build the next generation of social applications and virtual experiences across Instagram, WhatsApp, and Meta Reality Labs. Work closely with product designers and full-stack architects.",
    url: "https://www.metacareers.com/jobs/?q=Frontend%20Intern",
    eligibilityStatus: "High"
  },
  {
    id: "intern-aws-backend",
    title: "Cloud & Backend Engineering Intern",
    company: "Amazon Web Services (AWS)",
    location: "Seattle, WA / Bangalore, India / Remote",
    type: "Internship",
    salary: "₹85,000/mo (India) / $8,000/mo (US)",
    postedAt: "2 days ago",
    skills: ["Java", "Python", "Node.js", "AWS", "REST APIs", "SQL"],
    learningRoadmap: [
      "Master RESTful API design standards and idempotent microservice endpoints",
      "Deploy containerized microservices using Docker and AWS Lambda / ECS",
      "Understand distributed system principles, eventual consistency, and relational database indexing"
    ],
    suggestedProjects: [
      "Serverless Event-Driven Order Processing System with SQS & Lambda",
      "High-Throughput URL Shortener with Redis Caching and PostgreSQL"
    ],
    interviewTips: [
      "Review the Amazon Leadership Principles with concrete behavioral STAR examples",
      "Explain system scale trade-offs: latency vs. throughput, consistency vs. availability"
    ],
    description: "Architect secure, cloud-scale backend services powering AWS products. You will design APIs, optimize database queries, and contribute to production cloud infrastructure.",
    url: "https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer+Intern",
    eligibilityStatus: "High"
  },
  {
    id: "intern-aicte-virtual",
    title: "AICTE Emerging Technologies Virtual Internship",
    company: "AICTE / EduSkills",
    location: "Remote (All India)",
    type: "Internship",
    salary: "Govt Certificate + Performance Stipend",
    postedAt: "Active Now",
    skills: ["Python", "Web Development", "AI/ML", "Cloud Computing", "Git"],
    learningRoadmap: [
      "Complete AICTE guided emerging tech modules and capstone assignments",
      "Build and document an end-to-end full stack or machine learning project",
      "Present project outcomes to industry panel evaluators for national certification"
    ],
    suggestedProjects: [
      "Smart Citizen Grievance Redressal Portal",
      "AI-Based Crop Health Diagnostic Web App"
    ],
    interviewTips: [
      "Highlight foundational computer science concepts and project problem-solving",
      "Showcase your willingness to learn rapidly across multiple domains"
    ],
    description: "Official National Virtual Internship supported by the Ministry of Education & AICTE. Get certified, learn from industry leaders, and build practical tech solutions.",
    url: "https://internship.aicte-india.org/",
    eligibilityStatus: "High"
  },
  {
    id: "intern-microsoft-ai",
    title: "AI & Machine Learning Research Intern",
    company: "Microsoft",
    location: "Redmond, WA / Hyderabad, India / Remote",
    type: "Internship",
    salary: "₹1,00,000/mo (India) / $8,400/mo (US)",
    postedAt: "3 days ago",
    skills: ["Python", "PyTorch", "Machine Learning", "NLP", "Generative AI", "Algorithms"],
    learningRoadmap: [
      "Learn transformer architectures, self-attention, and prompt engineering fundamentals",
      "Fine-tune open-weights LLMs using Hugging Face PEFT/LoRA techniques",
      "Deploy scalable inference pipelines with FastAPI and ONNX Runtime"
    ],
    suggestedProjects: [
      "Enterprise Retrieval-Augmented Generation (RAG) Document Assistant",
      "Multimodal Sentiment Analysis Engine with PyTorch"
    ],
    interviewTips: [
      "Be prepared to derive key machine learning loss functions and evaluation metrics",
      "Explain how to mitigate hallucination and measure semantic relevance in RAG architectures"
    ],
    description: "Collaborate with Microsoft Research and Azure AI teams to invent groundbreaking AI solutions. Work with Copilot, OpenAI models, and foundational AI models.",
    url: "https://jobs.careers.microsoft.com/global/en/search?q=Intern%20AI",
    eligibilityStatus: "Medium"
  },
  {
    id: "intern-flipkart-sde",
    title: "Software Development Engineering Intern (SDE Intern)",
    company: "Flipkart",
    location: "Bangalore, India",
    type: "Internship",
    salary: "₹75,000/month + Perks",
    postedAt: "Just now",
    skills: ["Java", "Python", "Data Structures", "MySQL", "Object Oriented Programming"],
    learningRoadmap: [
      "Practice multi-threading and concurrency models in Java or Python",
      "Learn relational database normalization, indexing, and query plan optimization",
      "Build clean modular code utilizing SOLID design principles"
    ],
    suggestedProjects: [
      "E-Commerce Flash Sale Inventory Locker with Redis",
      "Order Delivery Routing & Dispatch Optimizer"
    ],
    interviewTips: [
      "Focus heavily on clean Object Oriented Design and clean code during live interviews",
      "Master standard interview problems on arrays, linked lists, and binary trees"
    ],
    description: "Experience hyper-scale e-commerce engineering at India's leading online marketplace. Work on payment gateways, catalogue systems, or delivery logistics engines.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Flipkart%20Intern",
    eligibilityStatus: "High"
  },
  {
    id: "intern-zoho-web",
    title: "Web Developer & Cloud Platform Intern",
    company: "Zoho Corporation",
    location: "Chennai, India / Remote",
    type: "Internship",
    salary: "₹35,000/month + Accommodation",
    postedAt: "Active Now",
    skills: ["JavaScript", "HTML", "CSS", "Java", "SQL", "Problem Solving"],
    learningRoadmap: [
      "Master raw DOM manipulation and pure JavaScript fundamentals without framework dependency",
      "Deep dive into browser networking, HTTP/2, and secure cookie management",
      "Solve logical algorithmic puzzles and write clean, maintainable backend code"
    ],
    suggestedProjects: [
      "Vanilla JS Interactive Kanban Board with LocalStorage Sync",
      "Modular CRM Customer Ticket Tracking System"
    ],
    interviewTips: [
      "Zoho strongly emphasizes core language fundamentals over external libraries",
      "Practice solving algorithmic and logical questions from scratch without external packages"
    ],
    description: "Join Zoho's engineering division to build SaaS software powering millions of global businesses. Hands-on exposure to cloud architecture and scalable product engineering.",
    url: "https://www.zoho.com/careers/",
    eligibilityStatus: "High"
  },
  {
    id: "intern-techflow-fullstack",
    title: "Full Stack Developer Intern",
    company: "TechFlow AI",
    location: "Remote / Hybrid",
    type: "Internship",
    salary: "$3,500/month",
    postedAt: "Recent",
    skills: ["React", "Node.js", "Express", "TypeScript", "PostgreSQL", "Git"],
    learningRoadmap: [
      "Build full-stack applications with type-safe APIs using TypeScript",
      "Configure modern CI/CD pipelines with GitHub Actions",
      "Implement user authentication using JWT and OAuth2 standards"
    ],
    suggestedProjects: [
      "AI Powered Resume Reviewer & Keyword Matcher Web App",
      "Collaborative Kanban Board with Real-Time Updates"
    ],
    interviewTips: [
      "Walk through your GitHub portfolio and highlight code quality and commit history",
      "Showcase eagerness to adapt quickly to early-stage agile development pace"
    ],
    description: "High-growth tech startup looking for an ambitious junior engineer to contribute across frontend React applications and Node.js microservices.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Intern",
    eligibilityStatus: "High"
  },
  {
    id: "intern-tata-pm",
    title: "Project Management & Tech Intern",
    company: "TATA Projects (via AICTE Portal)",
    location: "Hyderabad / Mumbai / Remote",
    type: "Internship",
    salary: "₹25,000/month",
    postedAt: "Active Now",
    skills: ["Project Management", "Agile", "Jira", "Data Analysis", "Communication"],
    learningRoadmap: [
      "Learn Agile Scrum ceremonies, sprint planning, and backlog grooming",
      "Master Jira issue tracking, velocity charts, and burndown analytics",
      "Practice business requirement translation into clear technical user stories"
    ],
    suggestedProjects: [
      "Sprint Management & Velocity Dashboard in React",
      "Automated Milestone Tracking Spreadsheet with Python Scripting"
    ],
    interviewTips: [
      "Highlight leadership experiences, team coordination, and clear communication",
      "Be prepared to answer behavioral questions using structured STAR methodology"
    ],
    description: "Corporate internship with TATA Projects. Gain hands-on exposure to agile execution, cross-functional engineering management, and enterprise technology delivery.",
    url: "https://internship.aicte-india.org/",
    eligibilityStatus: "High"
  },
  {
    id: "intern-apple-ios",
    title: "Mobile App Development Intern (iOS / Swift)",
    company: "Apple",
    location: "Cupertino, CA / Remote",
    type: "Internship",
    salary: "$8,800/month + Housing",
    postedAt: "4 days ago",
    skills: ["Swift", "iOS", "Objective-C", "UI/UX", "Mobile Development"],
    learningRoadmap: [
      "Learn Swift modern concurrency (async/await, actors) and SwiftUI architecture",
      "Understand iOS memory management (ARC) and Instruments profiling",
      "Build mobile applications with smooth 60fps animations and fluid touch gestures"
    ],
    suggestedProjects: [
      "Personal Finance & Habit Tracker with CoreData and SwiftUI",
      "Offline-First Podcast Player with Background Audio Playback"
    ],
    interviewTips: [
      "Demonstrate obsession with micro-interactions, responsive typography, and accessibility",
      "Understand app lifecycle, background tasks, and persistent storage mechanisms"
    ],
    description: "Design and implement beautiful iOS software that delights hundreds of millions of Apple users. Work with world-class engineers and Human Interface Guidelines.",
    url: "https://jobs.apple.com/en-us/search?search=Intern",
    eligibilityStatus: "Medium"
  },
  {
    id: "intern-razorpay-backend",
    title: "Backend Engineering Intern (Python / Go)",
    company: "Razorpay",
    location: "Bangalore, India / Remote",
    type: "Internship",
    salary: "₹60,000/month",
    postedAt: "Active Now",
    skills: ["Python", "Django", "FastAPI", "Go", "PostgreSQL", "Redis"],
    learningRoadmap: [
      "Learn transaction isolation levels, ACID guarantees, and database locking",
      "Build asynchronous job queues using Celery and Redis",
      "Implement secure webhook notification delivery with retry backoffs"
    ],
    suggestedProjects: [
      "Fintech Payment Webhook Processing Engine with Exponential Backoff",
      "High-Performance API Rate Limiter using Redis Token Bucket Algorithm"
    ],
    interviewTips: [
      "Be prepared for deep dives into database consistency, foreign keys, and indexes",
      "Demonstrate thorough error handling and secure programming best practices"
    ],
    description: "Power the digital payments backbone of India. Work on high-availability fintech architectures processing millions of transactions every single day.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Razorpay%20Intern",
    eligibilityStatus: "High"
  },
  {
    id: "intern-netflix-data",
    title: "Data Science & Analytics Intern",
    company: "Netflix",
    location: "Los Gatos, CA / Remote",
    type: "Internship",
    salary: "$9,000/month",
    postedAt: "5 days ago",
    skills: ["Python", "SQL", "Data Science", "Pandas", "Machine Learning", "A/B Testing"],
    learningRoadmap: [
      "Master statistical inference, hypothesis testing, and rigorous A/B experiment design",
      "Write advanced SQL queries with window functions and analytical aggregations",
      "Develop predictive models using Scikit-Learn and visualize signals clearly"
    ],
    suggestedProjects: [
      "Streaming Content Recommendation & Churn Predictor",
      "A/B Experimentation Statistical Significance Visualizer"
    ],
    interviewTips: [
      "Walk through end-to-end experiment designs: hypothesis, sample size, metrics, and pitfalls",
      "Demonstrate clear storytelling: converting statistical numbers into actionable business decisions"
    ],
    description: "Help optimize streaming algorithms, content recommendation, and product features using massive datasets at global entertainment pioneer Netflix.",
    url: "https://jobs.netflix.com/search?q=Intern",
    eligibilityStatus: "Medium"
  },

  // --- FULL-TIME ROLES ---
  {
    id: "ft-google-swe",
    title: "Software Engineer, Full Stack",
    company: "Google",
    location: "Bangalore, India / Remote",
    type: "Full-time",
    salary: "₹24L - ₹42L / year",
    postedAt: "2 days ago",
    skills: ["Python", "TypeScript", "React", "Distributed Systems", "Algorithms"],
    learningRoadmap: [
      "Solve advanced algorithmic problems (Dynamic Programming, Graph Theory)",
      "Design distributed, horizontally scalable microservice architectures",
      "Implement robust unit, integration, and end-to-end automated testing suites"
    ],
    suggestedProjects: [
      "Global Distributed CDN Simulation with Consistent Hashing",
      "Real-Time Collaborative Document Canvas with Operational Transformation"
    ],
    interviewTips: [
      "Structure your system design: Functional vs Non-functional requirements, API contracts, Schema, Scale estimates",
      "Write bug-free, cleanly structured code with sensible variable naming"
    ],
    description: "Design and implement next-generation software platforms for billions of users. Lead technical discussions, craft clean APIs, and mentor junior engineers.",
    url: "https://www.google.com/about/careers/applications/jobs/results/?q=Software%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-microsoft-azure-dev",
    title: "Software Engineer - Azure Cloud Infrastructure",
    company: "Microsoft",
    location: "Noida / Hyderabad / Remote",
    type: "Full-time",
    salary: "₹22L - ₹38L / year",
    postedAt: "1 day ago",
    skills: ["C#", "TypeScript", "Cloud Computing", "Docker", "Kubernetes", "System Design"],
    learningRoadmap: [
      "Master container orchestration with Kubernetes and Helm charts",
      "Build resilient microservices with circuit breakers and retry policies",
      "Implement automated infrastructure as code using Terraform or Bicep"
    ],
    suggestedProjects: [
      "Cloud Health Sentinel: Auto-Remediation Kubernetes Operator",
      "Multi-Region Active-Active Microservices Mesh"
    ],
    interviewTips: [
      "Be prepared for deep system design conversations on fault-tolerance and failovers",
      "Highlight your dedication to code maintainability, telemetry, and observability"
    ],
    description: "Build the foundational infrastructure powering Microsoft Azure. Deliver high-availability distributed compute, storage, and networking services globally.",
    url: "https://jobs.careers.microsoft.com/global/en/search?q=Software%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-meta-product-engineer",
    title: "Product Software Engineer (React / TypeScript)",
    company: "Meta",
    location: "London, UK / Remote",
    type: "Full-time",
    salary: "£90,000 - £135,000 / year",
    postedAt: "Active Now",
    skills: ["React", "TypeScript", "GraphQL", "JavaScript", "Web Performance"],
    learningRoadmap: [
      "Master advanced GraphQL schema stitching and caching with Relay/Apollo",
      "Optimize critical rendering path and bundle size budgets",
      "Architect complex client-side state machines with modern state management"
    ],
    suggestedProjects: [
      "Ultra-Fast Virtualized Feed with Infinite Scroll and Predictive Prefetching",
      "Real-Time Video Messaging Web Client with WebRTC"
    ],
    interviewTips: [
      "Focus on user experience edge cases: low bandwidth, error recovery, and internationalization",
      "Demonstrate thorough mastery of JavaScript asynchronous patterns and modern browser APIs"
    ],
    description: "Ship high-impact user experiences across Facebook, Messenger, and Instagram. Collaborate with top product managers and data scientists.",
    url: "https://www.metacareers.com/jobs/?q=Product%20Software%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-amazon-sde",
    title: "Software Development Engineer (SDE II)",
    company: "Amazon",
    location: "Bangalore / Hyderabad / Remote",
    type: "Full-time",
    salary: "₹28L - ₹48L / year",
    postedAt: "3 days ago",
    skills: ["Java", "Distributed Systems", "AWS", "NoSQL", "System Design"],
    learningRoadmap: [
      "Master DynamoDB single-table design patterns and partition key strategies",
      "Design event-driven architectures with Apache Kafka or Amazon EventBridge",
      "Deep dive into operational excellence: monitoring, alarms, and incident post-mortems"
    ],
    suggestedProjects: [
      "High-Scale Distributed Rate Limiting & Fraud Detection Engine",
      "Event-Driven Order Workflow Coordinator with Saga Pattern"
    ],
    interviewTips: [
      "Structure every response with concrete metrics (e.g., 'reduced latency by 35%')",
      "Review Amazon Leadership Principles: Customer Obsession, Bias for Action, Ownership"
    ],
    description: "Take ownership of complex technical initiatives at Amazon. Build customer-obsessed features, reduce operational overhead, and maintain high standards of software quality.",
    url: "https://www.amazon.jobs/en/search?base_query=Software+Development+Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-tcs-cloud-developer",
    title: "Associate Software Engineer - Enterprise Cloud",
    company: "TCS",
    location: "Hyderabad / Pune / Bangalore",
    type: "Full-time",
    salary: "₹6.5L - ₹9.5L / year",
    postedAt: "Just now",
    skills: ["Java", "Spring Boot", "SQL", "Git", "REST APIs", "Agile"],
    learningRoadmap: [
      "Build enterprise REST APIs with Spring Boot and JPA/Hibernate",
      "Write optimized SQL joins, triggers, and stored procedures",
      "Adopt standard Git branching strategies (GitFlow) and code review standards"
    ],
    suggestedProjects: [
      "Banking Transaction Ledger with Spring Security & JWT",
      "Employee Payroll & Leave Management Portal"
    ],
    interviewTips: [
      "Revise Core Java concepts: Collections framework, OOP concepts, exceptions, and multi-threading",
      "Explain your final year college projects or internships with confidence"
    ],
    description: "Kickstart your professional engineering career at Tata Consultancy Services. Deliver enterprise software solutions for Fortune 500 global clients.",
    url: "https://www.linkedin.com/jobs/search/?keywords=TCS%20Software%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-infosys-systems-engineer",
    title: "Systems Engineer - Full Stack Java & React",
    company: "Infosys",
    location: "Bangalore / Pune / Hyderabad",
    type: "Full-time",
    salary: "₹6.5L - ₹10L / year",
    postedAt: "Active Now",
    skills: ["Java", "React", "JavaScript", "HTML", "CSS", "MySQL"],
    learningRoadmap: [
      "Build end-to-end full stack web applications connecting React to Spring Boot APIs",
      "Learn responsive design, form validations, and state management",
      "Master database design, foreign key relationships, and query debugging"
    ],
    suggestedProjects: [
      "Healthcare Appointment Booking & Patient Record System",
      "E-Commerce Product Catalog with Real-Time Filtering"
    ],
    interviewTips: [
      "Be ready for questions on Java OOP concepts, SQL queries, and basic web fundamentals",
      "Showcase strong communication and willingness to learn new technologies"
    ],
    description: "Join Infosys Digital Labs to develop modern web and enterprise software. Receive industry-standard training and work on international client projects.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Infosys%20Systems%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-wipro-backend",
    title: "Software Engineer - API & Microservices",
    company: "Wipro",
    location: "Hyderabad / Chennai / Remote",
    type: "Full-time",
    salary: "₹6.5L - ₹9.8L / year",
    postedAt: "1 day ago",
    skills: ["Python", "Django", "SQL", "REST APIs", "Docker", "Linux"],
    learningRoadmap: [
      "Master Python Django REST Framework (DRF) serializers, viewsets, and permissions",
      "Learn basic Linux server administration, shell scripting, and Docker containerization",
      "Understand API security best practices: authentication, rate limiting, and CORS"
    ],
    suggestedProjects: [
      "Microservice Authentication Server with JWT and Refresh Tokens",
      "Inventory Management API with Automated Swagger Documentation"
    ],
    interviewTips: [
      "Practice explaining Python list comprehensions, generators, and decorators",
      "Be prepared to write clean SQL queries for grouping and aggregation"
    ],
    description: "Design and implement scalable REST services and microservices architecture at Wipro Technologies. Work with modern cloud and API technologies.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Wipro%20Software%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-flipkart-backend",
    title: "Backend Engineer - High Scale Systems",
    company: "Flipkart",
    location: "Bangalore, India",
    type: "Full-time",
    salary: "₹22L - ₹36L / year",
    postedAt: "2 days ago",
    skills: ["Java", "Kafka", "MySQL", "Redis", "Distributed Systems", "Algorithms"],
    learningRoadmap: [
      "Master message brokers like Apache Kafka: consumer groups, partitions, and offset management",
      "Learn caching patterns (Cache-Aside, Write-Through) with Redis cluster",
      "Design database sharding and replication architectures"
    ],
    suggestedProjects: [
      "Distributed Notification Service Handling 50k Events/Sec with Kafka",
      "Flash Deal Flash-Order Locker with Redis Redlock"
    ],
    interviewTips: [
      "Demonstrate thorough understanding of concurrency, race conditions, and distributed locks",
      "Prepare for rigorous machine coding and problem solving rounds"
    ],
    description: "Build the transaction and order engines that withstand massive Big Billion Days traffic surges. Work on cutting-edge distributed computing at Flipkart.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Flipkart%20Backend%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-zoho-fullstack",
    title: "Full Stack Developer - Enterprise Products",
    company: "Zoho Corporation",
    location: "Chennai / Tenkasi / Remote",
    type: "Full-time",
    salary: "₹10L - ₹18L / year",
    postedAt: "Active Now",
    skills: ["JavaScript", "Java", "SQL", "Web Technologies", "Problem Solving"],
    learningRoadmap: [
      "Deep dive into high-efficiency database queries and table partitioning",
      "Build custom web UI components with minimal external dependency",
      "Master asynchronous event-driven server architectures"
    ],
    suggestedProjects: [
      "Custom No-Code Form & Workflow Builder in JavaScript",
      "Multi-Tenant SaaS Data Isolation Architecture"
    ],
    interviewTips: [
      "Zoho evaluates candidate capability from first principles rather than framework trivia",
      "Focus on explaining your approach to optimizing slow database queries and memory leaks"
    ],
    description: "Build world-class SaaS enterprise applications used by over 100 million users globally. Freedom to innovate, solve tough engineering challenges, and build lasting software.",
    url: "https://www.zoho.com/careers/",
    eligibilityStatus: "High"
  },
  {
    id: "ft-techflow-ai-engineer",
    title: "Generative AI & LLM Applications Engineer",
    company: "TechFlow AI",
    location: "Remote",
    type: "Full-time",
    salary: "$95,000 - $140,000 / year",
    postedAt: "Just now",
    skills: ["Python", "Generative AI", "FastAPI", "Prompt Engineering", "Vector Databases", "TypeScript"],
    learningRoadmap: [
      "Master semantic vector search using Pinecone, ChromaDB, or Qdrant",
      "Implement multi-agent reasoning workflows using LangGraph or AutoGen",
      "Optimize LLM latency with streaming responses, speculative decoding, and semantic caching"
    ],
    suggestedProjects: [
      "Autonomous Multi-Agent Market Research Assistant",
      "Codebase Semantic Search & Automatic Bug Fixer with Vector Embeddings"
    ],
    interviewTips: [
      "Explain practical strategies for handling LLM latency, cost, and rate limits in production",
      "Demonstrate your experience with real-world prompt evaluation and output guardrails"
    ],
    description: "Pioneer next-generation generative AI products. Build autonomous AI agents, enterprise search systems, and dynamic AI-powered web interfaces.",
    url: "https://www.linkedin.com/jobs/search/?keywords=Generative%20AI%20Engineer",
    eligibilityStatus: "High"
  },
  {
    id: "ft-netflix-ui-engineer",
    title: "Senior UI / Frontend Engineer",
    company: "Netflix",
    location: "Los Gatos, CA / Remote",
    type: "Full-time",
    salary: "$180,000 - $260,000 / year",
    postedAt: "3 days ago",
    skills: ["React", "JavaScript", "TypeScript", "Web Performance", "UI/UX", "CSS3"],
    learningRoadmap: [
      "Master browser painting, compositing, and GPU hardware acceleration",
      "Implement automated visual regression testing and accessibility compliance (WCAG AAA)",
      "Build modular micro-frontend architectures with Webpack Module Federation"
    ],
    suggestedProjects: [
      "Cinematic Video Streaming Web App with Custom Canvas Video Player Controls",
      "Zero-Runtime CSS Design System with Dynamic Theme Switching"
    ],
    interviewTips: [
      "Netflix values high judgment, ownership, and direct communication",
      "Be prepared to deep-dive into how browser rendering pipelines handle 60fps animations"
    ],
    description: "Shape the television and cinema streaming experience for 260M+ subscribers worldwide. Drive frontend innovation across TVs, browsers, and mobile devices.",
    url: "https://jobs.netflix.com/search?q=UI%20Engineer",
    eligibilityStatus: "Medium"
  },
  {
    id: "ft-apple-systems",
    title: "Software Engineer - Core Operating Systems",
    company: "Apple",
    location: "Cupertino, CA / Remote",
    type: "Full-time",
    salary: "$150,000 - $220,000 / year",
    postedAt: "4 days ago",
    skills: ["C", "C++", "Operating Systems", "Data Structures", "Algorithms", "System Architecture"],
    learningRoadmap: [
      "Deep dive into kernel architectures, virtual memory management, and interrupt handling",
      "Master POSIX system calls, memory safety, and multi-core CPU scheduling",
      "Write low-level performance benchmarks using perf and LLVM tooling"
    ],
    suggestedProjects: [
      "Custom User-Space Memory Allocator (malloc/free clone) with Arena Chunking",
      "Simple POSIX-Compliant Multi-Tasking Operating System Kernel"
    ],
    interviewTips: [
      "Demonstrate mastery of pointers, stack vs heap allocation, and bitwise manipulation",
      "Show exceptional attention to detail, security, and hardware constraints"
    ],
    description: "Work at the intersection of hardware and software. Develop foundational OS technologies powering macOS, iOS, watchOS, and visionOS.",
    url: "https://jobs.apple.com/en-us/search?search=Software%20Engineer",
    eligibilityStatus: "Medium"
  },

  // --- CONTRACT ROLES ---
  {
    id: "contract-react-dev",
    title: "Frontend Architect (6-Month Contract)",
    company: "CloudScale Solutions",
    location: "Remote",
    type: "Contract",
    salary: "$75 - $110 / hour",
    postedAt: "1 day ago",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "REST APIs"],
    learningRoadmap: [
      "Master Next.js App Router, Server Components, and Server Actions",
      "Implement zero-downtime static site generation with ISR",
      "Set up comprehensive end-to-end testing with Playwright"
    ],
    suggestedProjects: [
      "High-Traffic Headless E-Commerce Storefront with Next.js",
      "Real-Time Analytics Dashboard with Server-Sent Events"
    ],
    interviewTips: [
      "Highlight your proven track record of shipping fast, reliable client applications",
      "Demonstrate ability to work autonomously and manage sprint deliverables"
    ],
    description: "Rapidly modernize enterprise web applications to Next.js and TypeScript. Work directly with leadership on delivering high-performance responsive web portals.",
    url: "https://www.linkedin.com/jobs/search/?keywords=React%20Contractor",
    eligibilityStatus: "High"
  }
];

export function getCompanyUrl(companyName: string, title: string): string {
  const name = (companyName || '').toLowerCase();
  const encodedTitle = encodeURIComponent(title || '');
  if (name.includes("google")) return `https://www.google.com/about/careers/applications/jobs/results/?q=${encodedTitle}`;
  if (name.includes("microsoft")) return `https://jobs.careers.microsoft.com/global/en/search?q=${encodedTitle}`;
  if (name.includes("meta")) return `https://www.metacareers.com/jobs/?q=${encodedTitle}`;
  if (name.includes("amazon")) return `https://www.amazon.jobs/en/search?base_query=${encodedTitle}`;
  if (name.includes("apple")) return `https://jobs.apple.com/en-us/search?search=${encodedTitle}`;
  if (name.includes("netflix")) return `https://jobs.netflix.com/search?q=${encodedTitle}`;
  if (name.includes("aicte")) return `https://internship.aicte-india.org/`;
  if (name.includes("zoho")) return `https://www.zoho.com/careers/`;
  if (name.includes("flipkart")) return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent("Flipkart " + title)}`;
  if (name.includes("tcs")) return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent("TCS " + title)}`;
  if (name.includes("infosys")) return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent("Infosys " + title)}`;
  if (name.includes("wipro")) return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent("Wipro " + title)}`;
  if (name.includes("razorpay")) return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent("Razorpay " + title)}`;
  return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(companyName + ' ' + title)}`;
}

export function rankAndPersonalizeOpportunities(
  userSkillsRaw: any,
  userTargetRole?: string,
  filterType: 'all' | 'jobs' | 'internships' = 'all',
  searchQuery: string = '',
  resumeScore: number = 0,
  interviewScore: number = 0
): {
  recommended: Opportunity[];
  defaultJobs: Opportunity[];
  analysis: string;
  scores: {
    resumeScore: number;
    interviewScore: number;
    skillMatchScore: number;
    careerReadinessScore: number;
  };
} {
  // Normalize user skills list
  const userSkillList: string[] = Array.isArray(userSkillsRaw)
    ? userSkillsRaw.map((s: any) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean)
    : typeof userSkillsRaw === 'string'
    ? userSkillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const userSkillSetLower = new Set(userSkillList.map(s => s.toLowerCase().trim()));
  const targetRoleLower = (userTargetRole || '').toLowerCase().trim();
  const searchLower = (searchQuery || '').toLowerCase().trim();

  // Helper to match skill strings flexibly (e.g. "React.js" matches "React")
  const hasSkillMatch = (reqSkill: string): boolean => {
    const reqLower = reqSkill.toLowerCase().trim();
    if (userSkillSetLower.has(reqLower)) return true;
    for (const u of userSkillSetLower) {
      if (reqLower.includes(u) || u.includes(reqLower)) return true;
      if (reqLower.replace(/[\.\s]/g, '') === u.replace(/[\.\s]/g, '')) return true;
    }
    return false;
  };

  // Score and enrich each opportunity
  const scoredOpportunities: Opportunity[] = MASTER_OPPORTUNITIES.map(op => {
    const opSkills = op.skills || [];
    let matchCount = 0;
    const missing: string[] = [];

    opSkills.forEach(req => {
      if (hasSkillMatch(req)) {
        matchCount++;
      } else {
        missing.push(req);
      }
    });

    const ratio = opSkills.length > 0 ? matchCount / opSkills.length : 0.5;
    
    // Base score between 65 and 98 based on skill overlap
    let matchScore = Math.round(65 + (ratio * 33));
    
    // Role alignment boost if target role or search query matches
    const roleMatches = targetRoleLower && (
      op.title.toLowerCase().includes(targetRoleLower) ||
      targetRoleLower.split(/\s+/).some(word => word.length > 2 && op.title.toLowerCase().includes(word))
    );
    if (roleMatches) matchScore = Math.min(99, matchScore + 5);

    // Dynamic reason why recommended
    let why = '';
    if (matchCount >= 3) {
      why = `Strong skill alignment: your expertise in ${opSkills.filter(s => hasSkillMatch(s)).slice(0, 3).join(', ')} directly matches this role.`;
    } else if (matchCount >= 1) {
      why = `Good alignment with your background in ${opSkills.filter(s => hasSkillMatch(s)).slice(0, 2).join(', ')}. Offers great growth in modern tech stacks.`;
    } else {
      why = `High-potential opportunity that expands your technical breadth towards ${op.title}.`;
    }

    const eligibilityStatus: 'High' | 'Medium' | 'Low' = 
      matchScore >= 85 ? 'High' : matchScore >= 70 ? 'Medium' : 'Low';

    return {
      ...op,
      matchScore,
      missingSkills: missing.length > 0 ? missing.slice(0, 3) : ['Advanced System Architecture', 'Cloud Production CI/CD'],
      whyRecommended: why,
      eligibilityStatus,
      url: op.url || getCompanyUrl(op.company, op.title)
    };
  });

  // Filter based on search query if present
  let filtered = scoredOpportunities;
  if (searchLower) {
    filtered = filtered.filter(op => {
      const titleMatch = op.title.toLowerCase().includes(searchLower);
      const companyMatch = op.company.toLowerCase().includes(searchLower);
      const locationMatch = op.location.toLowerCase().includes(searchLower);
      const skillMatch = op.skills.some(s => s.toLowerCase().includes(searchLower));
      const typeMatch = op.type.toLowerCase().includes(searchLower);
      return titleMatch || companyMatch || locationMatch || skillMatch || typeMatch;
    });

    // If query was very specific and matched 0, provide soft match on any words
    if (filtered.length === 0) {
      const searchWords = searchLower.split(/\s+/).filter(w => w.length > 2);
      filtered = scoredOpportunities.filter(op => {
        return searchWords.some(w => 
          op.title.toLowerCase().includes(w) || 
          op.company.toLowerCase().includes(w) || 
          op.skills.some(s => s.toLowerCase().includes(w))
        );
      });
    }

    // If still empty, fall back to all scored opportunities
    if (filtered.length === 0) {
      filtered = scoredOpportunities;
    }
  }

  // Filter based on type: 'internships' | 'jobs' | 'all'
  let recommendedPool: Opportunity[] = [];
  let defaultPool: Opportunity[] = [];

  if (filterType === 'internships') {
    recommendedPool = filtered.filter(op => op.type === 'Internship');
    defaultPool = scoredOpportunities.filter(op => op.type === 'Internship');
  } else if (filterType === 'jobs') {
    recommendedPool = filtered.filter(op => op.type !== 'Internship');
    defaultPool = scoredOpportunities.filter(op => op.type !== 'Internship');
  } else {
    // 'all' -> ensure healthy, balanced mix of BOTH internships and full-time jobs!
    const internships = filtered.filter(op => op.type === 'Internship');
    const fullTime = filtered.filter(op => op.type !== 'Internship');
    
    // Interleave them so the user immediately sees both jobs and internships
    const interleaved: Opportunity[] = [];
    const maxLen = Math.max(internships.length, fullTime.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < fullTime.length) interleaved.push(fullTime[i]);
      if (i < internships.length) interleaved.push(internships[i]);
    }
    recommendedPool = interleaved;

    const allInterns = scoredOpportunities.filter(op => op.type === 'Internship');
    const allJobs = scoredOpportunities.filter(op => op.type !== 'Internship');
    const allInterleaved: Opportunity[] = [];
    const allMax = Math.max(allInterns.length, allJobs.length);
    for (let i = 0; i < allMax; i++) {
      if (i < allJobs.length) allInterleaved.push(allJobs[i]);
      if (i < allInterns.length) allInterleaved.push(allInterns[i]);
    }
    defaultPool = allInterleaved;
  }

  // Sort recommended pool by matchScore descending
  recommendedPool.sort((a, b) => b.matchScore - a.matchScore);

  // Compute average skill match score
  const avgSkillScore = recommendedPool.length > 0
    ? Math.round(recommendedPool.slice(0, 6).reduce((acc, curr) => acc + curr.matchScore, 0) / Math.min(6, recommendedPool.length))
    : 85;

  const careerReadinessScore = Math.round(((resumeScore || 60) + (interviewScore || 50) + avgSkillScore) / 3);

  // Contextual analysis text
  const userSkillCount = userSkillList.length;
  let analysis = `Based on your ${userSkillCount} identified skills and target focus in ${userTargetRole || 'Software Development'}, you are tracking at ${avgSkillScore}% market compatibility. Top tech leaders are actively scouting talent with your tech stack.`;
  if (filterType === 'internships') {
    analysis = `Found ${recommendedPool.length} active high-impact internship programs matching your skill profile. These roles feature hands-on mentorship, competitive stipends, and direct full-time conversion pipelines.`;
  } else if (filterType === 'jobs') {
    analysis = `Analyzed ${recommendedPool.length} active full-time roles matching your competencies. Your readiness score is ${careerReadinessScore}%, qualifying you for high-velocity software engineering positions.`;
  }

  return {
    recommended: recommendedPool,
    defaultJobs: defaultPool,
    analysis,
    scores: {
      resumeScore: resumeScore || 0,
      interviewScore: interviewScore || 0,
      skillMatchScore: avgSkillScore,
      careerReadinessScore
    }
  };
}
