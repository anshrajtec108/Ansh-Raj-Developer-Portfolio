import { PortfolioData } from '../types';

export const seedData: PortfolioData = {
  profile: {
    name: "Ansh Raj",
    headline: "MERN Stack Developer · Building Secure, Scalable Web Apps",
    summary: "Dedicated MERN stack developer with a passion for building secure, scalable, and high-performance web applications. Experienced in freelancing and implementing advanced security practices. Currently pursuing BCA.",
    location: "Mysuru, Karnataka, India",
    email: "anshraj108.er@gmail.com",
    phone: "+91 8618009739",
    linkedin: "https://www.linkedin.com/in/anshraj108",
    github: "https://github.com/anshrajtec108",
    profilePhotoUrl: `${import.meta.env.BASE_URL}ansh-raj.jpg`,
    resumeUrl: "#",
  },
  skills: [
    {
      id: "s1",
      category: "Frontend",
      name: "React.js",
      proficiency: 90,
      linkedProjectIds: ["p1", "p2", "p3"],
      linkedProofIds: ["prf1"],
      notes: "Extensive experience building responsive, complex SPAs using hooks, context, and custom state management."
    },
    {
      id: "s2",
      category: "Frontend",
      name: "Tailwind CSS",
      proficiency: 95,
      linkedProjectIds: ["p1", "p2", "p3"],
      linkedProofIds: [],
      notes: "Fluent in utility-first CSS for rapid, scalable UI development and design system implementation."
    },
    {
      id: "s3",
      category: "Backend",
      name: "Node.js & Express",
      proficiency: 85,
      linkedProjectIds: ["p1", "p2"],
      linkedProofIds: ["prf2"],
      notes: "Architecting RESTful APIs, middleware pipelines, and secure authentication flows."
    },
    {
      id: "s4",
      category: "Backend",
      name: "MongoDB",
      proficiency: 80,
      linkedProjectIds: ["p1", "p2"],
      linkedProofIds: [],
      notes: "Designing NoSQL schemas, writing aggregation pipelines, and indexing for performance."
    },
    {
      id: "s5",
      category: "Tools & DevOps",
      name: "Git & GitHub",
      proficiency: 85,
      linkedProjectIds: ["p1", "p2", "p3"],
      linkedProofIds: [],
      notes: "Version control, branching strategies, and collaborative workflow management."
    },
    {
      id: "s6",
      category: "Tools & DevOps",
      name: "Docker",
      proficiency: 70,
      linkedProjectIds: ["p2"],
      linkedProofIds: ["prf3"],
      notes: "Containerizing applications for consistent development and deployment environments."
    },
    {
      id: "s7",
      category: "Future Skills",
      name: "System Design",
      proficiency: 50,
      linkedProjectIds: [],
      linkedProofIds: ["prf4"],
      notes: "Currently studying distributed systems, caching strategies, and microservices architecture."
    },
    {
      id: "s8",
      category: "Future Skills",
      name: "Python",
      proficiency: 40,
      linkedProjectIds: [],
      linkedProofIds: [],
      notes: "Learning Python for scripting, automation, and basic data analysis."
    }
  ],
  projects: [
    {
      id: "p1",
      title: "SecureAuth Sentinel",
      slug: "secure-auth-sentinel",
      shortDescription: "A robust authentication and identity management microservice.",
      longOverview: "SecureAuth Sentinel is a comprehensive authentication service designed to be plugged into any MERN stack application. It handles user registration, login, JWT-based session management, password resets, and role-based access control (RBAC).",
      problem: "Many applications struggle with implementing secure, scalable authentication from scratch, often leaving vulnerabilities like weak password storage or insecure token handling.",
      solution: "Built a dedicated service using Node.js, Express, and MongoDB. Implemented bcrypt for password hashing, HTTP-only cookies for JWT storage to prevent XSS, and rate limiting to thwart brute-force attacks.",
      techStack: ["Node.js", "Express", "MongoDB", "React", "Tailwind CSS", "JWT"],
      keyFeatures: [
        "User Registration & Login with secure password hashing",
        "Role-Based Access Control (Admin, User)",
        "JWT Session Management via HTTP-only cookies",
        "Password Reset flow with expiring tokens"
      ],
      securityFeatures: [
        "Rate limiting on auth routes",
        "Protection against XSS via HTTP-only cookies",
        "CSRF protection headers",
        "Helmet.js for securing HTTP headers"
      ],
      screenshotUrls: [
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      ],
      challenges: "Balancing security with user experience, particularly around token expiration and silent refreshes without compromising the security model.",
      learnings: "Deepened understanding of web security vulnerabilities (OWASP Top 10) and practical mitigation strategies in Node.js environments.",
      thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee57d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: "p2",
      title: "NexStore Engine",
      slug: "nexstore-engine",
      shortDescription: "A headless e-commerce backend and admin dashboard.",
      longOverview: "NexStore Engine provides a powerful backend API for managing products, inventory, orders, and customers, accompanied by a React-based admin dashboard for store managers.",
      problem: "E-commerce platforms often become monolithic and hard to scale. Store owners need flexible tools to manage their inventory across multiple storefronts.",
      solution: "Developed a RESTful API using Express and MongoDB to handle core e-commerce logic, decoupled from the frontend. Built a responsive admin dashboard using React and Tailwind to consume this API.",
      techStack: ["React", "Node.js", "Express", "MongoDB", "Redux Toolkit", "Stripe API"],
      keyFeatures: [
        "Product & Inventory Management",
        "Order processing pipeline",
        "Customer management and order history",
        "Sales analytics dashboard"
      ],
      securityFeatures: [
        "Secure payment processing integration (Stripe)",
        "Data validation and sanitization using Joi",
        "Admin-only route protection"
      ],
      screenshotUrls: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      ],
      challenges: "Designing a flexible database schema to handle variable product attributes and variants (e.g., sizes, colors).",
      learnings: "Gained experience in complex MongoDB aggregation pipelines for reporting and handling third-party API integrations like Stripe.",
      thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: true
    },
    {
      id: "p3",
      title: "DataViz Pro",
      slug: "dataviz-pro",
      shortDescription: "Interactive data visualization dashboard for business metrics.",
      longOverview: "A frontend-heavy application that consumes complex datasets and renders them into interactive, readable charts and graphs for business intelligence.",
      problem: "Raw data is difficult to interpret for business stakeholders. They need immediate visual feedback to make informed decisions.",
      solution: "Utilized React and Recharts to build a dynamic dashboard. Implemented complex state management to allow users to filter, sort, and drill down into the data in real-time.",
      techStack: ["React", "TypeScript", "Tailwind CSS", "Recharts", "Framer Motion"],
      keyFeatures: [
        "Interactive line, bar, and pie charts",
        "Real-time data filtering and date-range selection",
        "Export reports to PDF/CSV",
        "Customizable dashboard layout"
      ],
      securityFeatures: [],
      screenshotUrls: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      ],
      challenges: "Optimizing render performance when handling and animating large datasets (10,000+ records) on the client side.",
      learnings: "Mastered React performance optimization techniques including useMemo, useCallback, and windowing/virtualization.",
      thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      featured: true
    }
  ],
  certifications: [
    {
      id: "c1",
      slug: "full-stack-web-development",
      title: "Full Stack Web Development",
      issuer: "Udemy",
      date: "2023-08",
      shortDescription: "Comprehensive training in MERN stack development.",
      thumbnailUrl: `${import.meta.env.BASE_URL}proofs/c1-thumb.png`,
      fullImageUrl: `${import.meta.env.BASE_URL}proofs/c1-full.png`,
      whatLearned: "Learned how to build modern web applications from scratch using MongoDB, Express, React, and Node.js. Covered RESTful APIs, React hooks, state management, and deployment strategies.",
      skillsGained: ["React", "Node.js", "Express", "MongoDB", "REST APIs"],
      application: "I can now architect and implement end-to-end full stack web applications with proper separation of concerns and scalable backend services.",
      relatedProblems: ["Building scalable APIs", "Creating responsive SPAs", "Managing application state"],
      relatedProjectIds: ["p1", "p2"],
      futureLearningPlan: "Explore Next.js for server-side rendering and static site generation.",
      verificationUrl: "https://udemy.com"
    },
    {
      id: "c2",
      slug: "advanced-react-patterns",
      title: "Advanced React Patterns",
      issuer: "Frontend Masters",
      date: "2024-01",
      shortDescription: "Deep dive into advanced React concepts and performance.",
      thumbnailUrl: `${import.meta.env.BASE_URL}proofs/c2-thumb.png`,
      fullImageUrl: `${import.meta.env.BASE_URL}proofs/c2-full.png`,
      whatLearned: "Mastered complex React patterns like compound components, render props, and custom hooks. Learned advanced performance optimization techniques.",
      skillsGained: ["React Performance", "Design Patterns", "Custom Hooks", "State Management"],
      application: "I apply these patterns to create reusable, maintainable, and highly performant UI components for complex applications.",
      relatedProblems: ["Optimizing large React apps", "Building scalable component libraries", "Managing complex component state"],
      relatedProjectIds: ["p3"],
      futureLearningPlan: "Dive deeper into concurrent React features and React Server Components.",
      verificationUrl: "https://frontendmasters.com"
    },
    {
      id: "c3",
      slug: "backend-api-security",
      title: "Backend API Security",
      issuer: "Meta",
      date: "2024-04",
      shortDescription: "Specialized training in securing REST APIs and backend services.",
      thumbnailUrl: `${import.meta.env.BASE_URL}proofs/c3-thumb.png`,
      fullImageUrl: `${import.meta.env.BASE_URL}proofs/c3-full.png`,
      whatLearned: "Learned advanced techniques for securing backend APIs against common vulnerabilities like SQL injection, XSS, CSRF, and DDoS. Covered JWT implementation, OAuth2, and secure deployment practices.",
      skillsGained: ["API Security", "JWT", "OAuth2", "Rate Limiting", "Web Security"],
      application: "I implement robust security measures in all my backend projects, ensuring data integrity and protecting against common attack vectors.",
      relatedProblems: ["Securing user authentication", "Preventing injection attacks", "Implementing rate limiting"],
      relatedProjectIds: ["p1"],
      futureLearningPlan: "Explore zero-trust architecture and specialized security auditing tools.",
      verificationUrl: "https://coursera.org"
    }
  ],
  proofs: [
    {
      id: "prf1",
      title: "Advanced React Patterns - Certification",
      slug: "advanced-react-patterns-cert",
      type: "certificate",
      shortDescription: "Official completion certificate for Advanced React Patterns course.",
      description: "This certification validates comprehensive knowledge in advanced React patterns including compound components, render props, custom hooks, and state reducer patterns.",
      imageUrl: `${import.meta.env.BASE_URL}proofs/aws-cert.png`,
      tags: ["React", "Frontend", "Certification"],
      date: "2024-01",
      issuer: "Frontend Masters",
      linkedProjectIds: ["p3"]
    },
    {
      id: "prf2",
      title: "JWT Authentication Implementation",
      slug: "jwt-auth-implementation",
      type: "code",
      shortDescription: "Core snippet demonstrating secure JWT generation and validation.",
      description: "This code snippet shows how I implement JWT authentication securely in Node.js, emphasizing HTTP-only cookies and proper secret management.",
      codeLanguage: "typescript",
      codeSnippet: `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: '15m'
  });
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};`,
      tags: ["Security", "Node.js", "JWT", "Backend"],
      date: "2023-11",
      linkedProjectIds: ["p1"]
    },
    {
      id: "prf3",
      title: "Microservices Architecture Diagram",
      slug: "microservices-architecture-diagram",
      type: "document",
      shortDescription: "High-level MVC and microservices architecture blueprint.",
      description: "A comprehensive diagram illustrating the transition from a monolithic MVC architecture to a scalable microservices approach, focusing on independent deployability and robust service communication.",
      imageUrl: `${import.meta.env.BASE_URL}proofs/mvc-diagram.png`,
      documentUrl: "#",
      tags: ["Architecture", "System Design", "Docker"],
      date: "2024-02",
      linkedProjectIds: ["p1", "p2"]
    },
    {
      id: "prf4",
      title: "Security Audit Report Dashboard",
      slug: "security-audit-dashboard",
      type: "screenshot",
      shortDescription: "Screenshot from a custom security audit dashboard I developed.",
      description: "This screenshot highlights a real-time security audit dashboard, tracking vulnerability metrics, active threats, and system compliance scores across multiple environments.",
      imageUrl: `${import.meta.env.BASE_URL}proofs/security-audit.png`,
      tags: ["Security", "UI/UX", "Dashboard"],
      date: "2024-03",
      linkedProjectIds: []
    }
  ],
  engineeringNotes: [
    {
      id: "en1",
      slug: "ticket-booking-system",
      title: "Ticket Booking System (Theatre)",
      summary: "Handling concurrent seat bookings in a high-demand environment.",
      highlight: "Balancing user experience with strict data consistency using Redis-backed locks.",
      tags: ["System Design", "Concurrency", "Backend"],
      thoughtProcess: "When designing a ticket booking system, the primary challenge is handling concurrent requests for the same seat. We need to ensure that two users cannot book the same seat simultaneously (double booking) while also maintaining a fast and responsive user experience. If a user selects a seat, we need to temporarily reserve it while they complete the payment process. If they abandon the payment, the seat should become available again. I considered several approaches ranging from strict database locks to distributed caching strategies.",
      approaches: [
        {
          id: "app1",
          title: "Approach 1 — Database-level pessimistic locking",
          description: "Using SQL `SELECT ... FOR UPDATE` to lock the seat row during the transaction.",
          pros: ["Guaranteed consistency", "Simple to implement at the DB level"],
          cons: ["High contention can cause database bottlenecks", "Transactions held open during user payment flow (which is slow)", "Risk of deadlocks"]
        },
        {
          id: "app2",
          title: "Approach 2 — Optimistic locking with version columns",
          description: "Adding a `version` column to the seat table. Updates only succeed if the version hasn't changed.",
          pros: ["No database locks held during read", "Better scalability than pessimistic locking"],
          cons: ["High failure rate for concurrent users competing for popular seats", "Requires complex retry logic on the client side"]
        },
        {
          id: "app3",
          title: "Approach 3 — Redis-backed seat reservation with TTL",
          description: "Using Redis to store temporary reservations with a Time-To-Live (TTL) using atomic `SETNX` operations.",
          pros: ["Extremely fast", "Automatic expiration of abandoned reservations via TTL", "Decouples temporary state from persistent database state"],
          cons: ["Requires managing an additional infrastructure component (Redis)", "Potential edge cases if Redis goes down"]
        }
      ],
      finalApproach: "I chose the Redis-backed reservation with TTL (Approach 3). When a user selects a seat, we perform a `SETNX` in Redis with a 5-minute TTL. This guarantees only one user can hold the temporary reservation. Upon successful payment, we commit the final booking to the database and clear the Redis key. We also use idempotency keys during the payment step to ensure retries don't result in multiple charges.",
      tradeoffs: "The main trade-off is the added complexity of maintaining Redis and handling potential inconsistencies between Redis and the primary database in disaster scenarios. However, the performance benefits and the elegant handling of abandoned carts via TTL outweigh the infrastructure overhead.",
      architectureNotes: "Client -> API Gateway -> Booking Service. Booking Service interacts with Redis for temporary locks and PostgreSQL for persistent storage. Payment Service handles external gateway interactions using idempotency keys.",
      realWorldApplicability: "This pattern is essential for any high-contention booking scenario: movie tickets, flash sales for concerts, or limited-inventory e-commerce drops.",
      conclusion: "Distributed locks with auto-expiration provide the best balance of speed and reliability for temporary reservation systems.",
      visible: true,
      order: 1
    },
    {
      id: "en2",
      slug: "food-delivery-optimization",
      title: "Food Delivery Optimization",
      summary: "Assigning 30 orders across 5 delivery partners over different locations efficiently.",
      highlight: "A hybrid approach combining spatial clustering and SLA-aware priority assignment.",
      tags: ["System Design", "Optimization", "Algorithms"],
      thoughtProcess: "In a Swiggy-style delivery platform, efficiently dispatching orders to delivery partners is critical for maintaining delivery times and minimizing operational costs. A naive approach might just assign orders to the first available driver, but this leads to inefficient routing and missed SLAs. We need to consider the distance between the restaurant, the customer, and the driver, as well as the time elapsed since the order was placed.",
      approaches: [
        {
          id: "app1",
          title: "Approach 1 — Naive round-robin assignment",
          description: "Assigning incoming orders to drivers in a simple circular queue.",
          pros: ["Extremely simple to implement", "Ensures even distribution of order volume among drivers"],
          cons: ["Completely ignores spatial efficiency", "Can lead to massive delays and high travel costs"]
        },
        {
          id: "app2",
          title: "Approach 2 — Greedy nearest-partner using Haversine distance",
          description: "Calculating the distance between the restaurant and all available drivers, assigning the order to the closest one.",
          pros: ["Reduces initial pickup time", "Relatively straightforward to calculate"],
          cons: ["Doesn't account for driver batching (one driver taking multiple nearby orders)", "Can starve drivers in less busy areas"]
        },
        {
          id: "app3",
          title: "Approach 3 — K-means clustering with SLA priority",
          description: "Clustering active orders based on pickup/dropoff proximity and assigning batches to drivers, while boosting priority of older orders.",
          pros: ["Highly efficient routing", "Reduces total distance traveled by the fleet", "Helps meet SLAs for older orders"],
          cons: ["Computationally expensive to run frequently", "Requires complex tuning of cluster sizes and weights"]
        }
      ],
      finalApproach: "I designed a hybrid approach: we cluster pickups by restaurant proximity (batching orders from the same or nearby restaurants going to similar areas), then assign each cluster to the nearest available partner using a weighted scoring system. The score incorporates distance, driver capacity, and a priority multiplier that increases as an order nears its SLA deadline.",
      tradeoffs: "This hybrid system introduces significant algorithmic complexity and requires tuning the weights (e.g., how much to prioritize SLA vs. distance). However, it drastically improves throughput during peak hours compared to greedy assignment.",
      architectureNotes: "A background job runs periodically to analyze the active order pool, form clusters, and generate assignment proposals. The dispatch service then executes these proposals.",
      realWorldApplicability: "This logic forms the core of logistics networks, ride-sharing platforms, and any system requiring multi-agent spatial optimization.",
      conclusion: "Greedy algorithms fail at scale; true efficiency requires batching and intelligent prioritization.",
      visible: true,
      order: 2
    }
  ]
};