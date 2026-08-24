import type {
  Project,
  ProjectAnalysis,
  RoadmapPhase,
  Task,
  TechItem,
  ArchNodeData,
  TechCategory,
  ArchNodeType,
} from './types';

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

const TECH_LIBRARY: Record<
  TechCategory,
  { name: string; reason: string; alternatives: string[] }[]
> = {
  Frontend: [
    {
      name: 'Next.js',
      reason: 'Modern React framework with SSR, routing, and excellent DX for scalable web apps.',
      alternatives: ['React (Vite)', 'Vue', 'SvelteKit'],
    },
    {
      name: 'React',
      reason: 'The most popular UI library with a massive ecosystem and hiring pool.',
      alternatives: ['Vue', 'Angular', 'Svelte'],
    },
    {
      name: 'Vue',
      reason: 'Progressive framework with gentle learning curve and excellent docs.',
      alternatives: ['React', 'Svelte', 'Angular'],
    },
    {
      name: 'Angular',
      reason: 'Opinionated full-framework with built-in tooling for enterprise apps.',
      alternatives: ['React', 'Vue', 'Next.js'],
    },
  ],
  Backend: [
    {
      name: 'Node.js',
      reason: 'Fast development with JavaScript across the stack. Huge npm ecosystem.',
      alternatives: ['Python', 'Go', 'Deno'],
    },
    {
      name: 'Express',
      reason: 'Minimal, flexible Node.js web framework. Easy to extend.',
      alternatives: ['Fastify', 'Koa', 'NestJS'],
    },
    {
      name: 'NestJS',
      reason: 'Structured, modular Node.js framework with dependency injection.',
      alternatives: ['Express', 'Fastify', 'Deno'],
    },
    {
      name: 'Python',
      reason: 'Excellent for data-heavy and ML projects. Clean syntax.',
      alternatives: ['Node.js', 'Go', 'Ruby'],
    },
    {
      name: 'Django',
      reason: 'Batteries-included Python framework with admin panel and ORM built in.',
      alternatives: ['FastAPI', 'Flask', 'Express'],
    },
    {
      name: 'FastAPI',
      reason: 'High-performance Python API framework with automatic OpenAPI docs.',
      alternatives: ['Django', 'Flask', 'Express'],
    },
  ],
  Database: [
    {
      name: 'PostgreSQL',
      reason: 'Reliable, feature-rich relational database. Great for structured data.',
      alternatives: ['MySQL', 'Supabase', 'SQLite'],
    },
    {
      name: 'MongoDB',
      reason: 'Flexible document database for unstructured or rapidly-changing schemas.',
      alternatives: ['PostgreSQL', 'DynamoDB', 'CouchDB'],
    },
    {
      name: 'MySQL',
      reason: 'Widely-deployed relational database with strong community support.',
      alternatives: ['PostgreSQL', 'MariaDB', 'SQLite'],
    },
    {
      name: 'Supabase',
      reason: 'Postgres plus auth, storage, and realtime — an open Firebase alternative.',
      alternatives: ['Firebase', 'PostgreSQL', 'PlanetScale'],
    },
  ],
  'Other Services': [
    {
      name: 'Redis',
      reason: 'In-memory cache for sessions, rate limiting, and queue backends.',
      alternatives: ['Memcached', 'KeyDB', 'Dragonfly'],
    },
    {
      name: 'Docker',
      reason: 'Containerize services for consistent dev and prod environments.',
      alternatives: ['Podman', 'LXC', 'Nix'],
    },
    {
      name: 'AWS',
      reason: 'Full-featured cloud platform with compute, storage, and managed services.',
      alternatives: ['GCP', 'Azure', 'Fly.io'],
    },
    {
      name: 'Vercel',
      reason: 'Zero-config deployments for Next.js frontends with edge functions.',
      alternatives: ['Netlify', 'Cloudflare Pages', 'AWS Amplify'],
    },
    {
      name: 'Stripe',
      reason: 'Developer-friendly payments with subscriptions, invoicing, and webhooks.',
      alternatives: ['Paddle', 'Lemon Squeezy', 'Square'],
    },
    {
      name: 'Firebase',
      reason: 'Realtime database, auth, and hosting for rapid prototyping.',
      alternatives: ['Supabase', 'AWS Amplify', 'PocketBase'],
    },
  ],
  DevOps: [
    {
      name: 'GitHub Actions',
      reason: 'CI/CD pipelines tightly integrated with your Git workflow.',
      alternatives: ['GitLab CI', 'CircleCI', 'Drone'],
    },
    {
      name: 'Terraform',
      reason: 'Infrastructure as code for reproducible cloud provisioning.',
      alternatives: ['Pulumi', 'AWS CDK', 'Ansible'],
    },
  ],
  Mobile: [
    {
      name: 'React Native',
      reason: 'Cross-platform mobile apps using React skills you already have.',
      alternatives: ['Flutter', 'Expo', 'Swift/Kotlin'],
    },
    {
      name: 'Flutter',
      reason: 'Single codebase for iOS and Android with a rich widget library.',
      alternatives: ['React Native', 'Expo', 'Ionic'],
    },
  ],
};

export function getTechOptions(category: TechCategory) {
  return TECH_LIBRARY[category].map((t) => t.name);
}

export function findTech(category: TechCategory, name: string): TechItem | null {
  const entry = TECH_LIBRARY[category].find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (!entry) return null;
  return {
    id: uid('tech'),
    category,
    technology: entry.name,
    reason: entry.reason,
    alternatives: entry.alternatives,
  };
}

function analyzeIdea(idea: string, type: string): ProjectAnalysis {
  const lower = idea.toLowerCase();
  const features: string[] = [];
  const users: string[] = [];
  const functional: string[] = [];
  const nonFunctional: string[] = [];

  if (lower.includes('delivery') || lower.includes('food')) {
    features.push(
      'User registration and authentication',
      'Restaurant browsing and search',
      'Real-time order tracking',
      'Payment processing',
      'Reviews and ratings',
      'Push notifications'
    );
    users.push('Customers ordering food', 'Restaurant owners', 'Delivery drivers', 'Admins');
  } else if (lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('shop')) {
    features.push(
      'Product catalog with search and filters',
      'Shopping cart and checkout',
      'User accounts and order history',
      'Payment processing',
      'Inventory management',
      'Email notifications'
    );
    users.push('Shoppers', 'Store admins', 'Vendors');
  } else if (lower.includes('social') || lower.includes('chat') || lower.includes('messaging')) {
    features.push(
      'User profiles',
      'Real-time messaging',
      'Feed / timeline',
      'Follow / friend system',
      'Media uploads',
      'Notifications'
    );
    users.push('Regular users', 'Content creators', 'Moderators');
  } else if (lower.includes('task') || lower.includes('project management') || lower.includes('kanban')) {
    features.push(
      'Project and task creation',
      'Kanban board',
      'Team collaboration',
      'Time tracking',
      'File attachments',
      'Reporting and analytics'
    );
    users.push('Team members', 'Project managers', 'Stakeholders');
  } else {
    features.push(
      'User authentication and authorization',
      'Dashboard and analytics',
      'CRUD operations for core entities',
      'Search and filtering',
      'Notifications',
      'Admin panel'
    );
    users.push('End users', 'Administrators', 'Content managers');
  }

  functional.push(
    'Users can create an account and log in securely',
    'Users can create, read, update, and delete core records',
    'The system supports search and filtering of content',
    'The system sends notifications for key events'
  );
  nonFunctional.push(
    'The app should load in under 2 seconds',
    'The API should respond in under 300ms for 95% of requests',
    'The system should handle 1,000 concurrent users',
    'All data must be encrypted in transit and at rest'
  );

  const complexity =
    features.length > 6 ? 'High' : features.length > 4 ? 'Medium' : 'Low';

  return {
    summary: `${idea.charAt(0).toUpperCase() + idea.slice(1)} — a ${type.toLowerCase()} application with ${features.length} core feature areas. The system requires authentication, a primary data model, real-time or near-real-time updates, and integrations with payment and notification services.`,
    mainFeatures: features,
    targetUsers: users,
    functionalRequirements: functional,
    nonFunctionalRequirements: nonFunctional,
    technicalComplexity: {
      level: complexity as 'Low' | 'Medium' | 'High' | 'Very High',
      reason: 'Based on project scope and integration requirements',
    },
    estimatedPhases: 5,
  };
}

const PHASE_TEMPLATES: { title: string; description: string; tasks: { title: string; description: string; priority: Task['priority']; difficulty: Task['difficulty']; estimatedTime: string }[] }[] = [
  {
    title: 'Planning & Setup',
    description: 'Define requirements, choose the tech stack, and set up the project structure.',
    tasks: [
      { title: 'Define detailed requirements', description: 'Document functional and non-functional requirements based on the AI analysis.', priority: 'High', difficulty: 'Medium', estimatedTime: '4h' },
      { title: 'Finalize tech stack', description: 'Confirm or adjust the recommended technology stack.', priority: 'High', difficulty: 'Easy', estimatedTime: '2h' },
      { title: 'Set up repository', description: 'Create a Git repository with branching strategy and PR templates.', priority: 'Medium', difficulty: 'Easy', estimatedTime: '1h' },
      { title: 'Initialize project structure', description: 'Scaffold the project with folders, linting, and formatting configured.', priority: 'Medium', difficulty: 'Easy', estimatedTime: '3h' },
      { title: 'Configure CI/CD pipeline', description: 'Set up automated testing and deployment pipeline.', priority: 'Low', difficulty: 'Medium', estimatedTime: '4h' },
    ],
  },
  {
    title: 'Authentication',
    description: 'User registration, login, session management, and password reset.',
    tasks: [
      { title: 'Design user data model', description: 'Define the user schema with roles and permissions.', priority: 'High', difficulty: 'Medium', estimatedTime: '3h' },
      { title: 'Implement user registration', description: 'Sign-up flow with email verification.', priority: 'High', difficulty: 'Medium', estimatedTime: '6h' },
      { title: 'Implement login and logout', description: 'JWT or session-based authentication.', priority: 'High', difficulty: 'Medium', estimatedTime: '5h' },
      { title: 'Add password reset flow', description: 'Email-based password recovery with secure tokens.', priority: 'Medium', difficulty: 'Medium', estimatedTime: '4h' },
      { title: 'Set up role-based access control', description: 'Define roles and protect routes accordingly.', priority: 'Medium', difficulty: 'Hard', estimatedTime: '6h' },
    ],
  },
  {
    title: 'Core Features',
    description: 'Build the main application features, APIs, and database integration.',
    tasks: [
      { title: 'Design database schema', description: 'Create tables, relationships, and indexes for core entities.', priority: 'High', difficulty: 'Hard', estimatedTime: '8h' },
      { title: 'Build REST/GraphQL API', description: 'Implement CRUD endpoints for all core resources.', priority: 'High', difficulty: 'Hard', estimatedTime: '16h' },
      { title: 'Implement frontend pages', description: 'Build the main UI screens connected to the API.', priority: 'High', difficulty: 'Hard', estimatedTime: '20h' },
      { title: 'Add search and filtering', description: 'Implement search with pagination and filters.', priority: 'Medium', difficulty: 'Medium', estimatedTime: '8h' },
      { title: 'Integrate file uploads', description: 'Handle image or file uploads with storage service.', priority: 'Medium', difficulty: 'Medium', estimatedTime: '6h' },
    ],
  },
  {
    title: 'Advanced Features',
    description: 'Notifications, payments, search optimization, and performance tuning.',
    tasks: [
      { title: 'Integrate payment processing', description: 'Set up Stripe for checkout and subscriptions.', priority: 'High', difficulty: 'Hard', estimatedTime: '12h' },
      { title: 'Implement notifications', description: 'Email and push notifications for key events.', priority: 'Medium', difficulty: 'Medium', estimatedTime: '8h' },
      { title: 'Add real-time updates', description: 'WebSockets or SSE for live data updates.', priority: 'Medium', difficulty: 'Hard', estimatedTime: '10h' },
      { title: 'Optimize performance', description: 'Add caching, query optimization, and lazy loading.', priority: 'Low', difficulty: 'Hard', estimatedTime: '8h' },
      { title: 'Add analytics tracking', description: 'Track user behavior and key metrics.', priority: 'Low', difficulty: 'Medium', estimatedTime: '5h' },
    ],
  },
  {
    title: 'Testing & Deployment',
    description: 'Unit and integration testing, deployment, and monitoring setup.',
    tasks: [
      { title: 'Write unit tests', description: 'Cover core business logic with unit tests.', priority: 'High', difficulty: 'Medium', estimatedTime: '10h' },
      { title: 'Write integration tests', description: 'Test API endpoints and database interactions.', priority: 'High', difficulty: 'Medium', estimatedTime: '8h' },
      { title: 'Set up production environment', description: 'Configure production database, env vars, and secrets.', priority: 'High', difficulty: 'Medium', estimatedTime: '4h' },
      { title: 'Deploy application', description: 'Deploy frontend and backend to hosting providers.', priority: 'High', difficulty: 'Medium', estimatedTime: '4h' },
      { title: 'Configure monitoring', description: 'Set up error tracking, logging, and uptime monitoring.', priority: 'Medium', difficulty: 'Medium', estimatedTime: '5h' },
    ],
  },
];

const ARCH_NODE_LIBRARY: Record<ArchNodeType, { label: string; description: string; responsibilities: string[] }> = {
  Frontend: { label: 'Frontend App', description: 'The user-facing web application.', responsibilities: ['Render UI', 'Handle user interactions', 'Call backend APIs'] },
  'Backend API': { label: 'API Server', description: 'The main backend service handling business logic.', responsibilities: ['Process requests', 'Enforce business rules', 'Talk to database'] },
  'API Gateway': { label: 'API Gateway', description: 'Routes and rate-limits incoming requests.', responsibilities: ['Request routing', 'Rate limiting', 'Authentication validation'] },
  'Auth Service': { label: 'Auth Service', description: 'Handles authentication and authorization.', responsibilities: ['Issue tokens', 'Verify credentials', 'Manage sessions'] },
  Database: { label: 'Database', description: 'Primary data store for the application.', responsibilities: ['Store user data', 'Store application records', 'Enforce data integrity'] },
  Cache: { label: 'Cache Layer', description: 'In-memory cache for fast reads.', responsibilities: ['Cache hot queries', 'Store sessions', 'Reduce database load'] },
  Queue: { label: 'Message Queue', description: 'Asynchronous job processing.', responsibilities: ['Queue background jobs', 'Process emails', 'Handle webhooks'] },
  Storage: { label: 'File Storage', description: 'Object storage for files and media.', responsibilities: ['Store uploads', 'Serve static assets', 'Manage file lifecycle'] },
  'Payment Service': { label: 'Payment Service', description: 'Handles billing and payment processing.', responsibilities: ['Process payments', 'Manage subscriptions', 'Handle refunds'] },
  'External API': { label: 'External API', description: 'Third-party API integration.', responsibilities: ['Fetch external data', 'Sync with third party', 'Send webhooks'] },
  Microservice: { label: 'Microservice', description: 'A specialized service for a single domain.', responsibilities: ['Domain-specific logic', 'Independent scaling', 'Owns its data'] },
};

export function getArchNodeTypes(): { type: ArchNodeType; label: string }[] {
  return (Object.keys(ARCH_NODE_LIBRARY) as ArchNodeType[]).map((type) => ({
    type,
    label: ARCH_NODE_LIBRARY[type].label,
  }));
}

export function generateProject(opts: {
  name: string;
  description: string;
  type: string;
  experienceLevel: Project['experienceLevel'];
  mode: 'ai' | 'manual';
  selectedTech?: { category: TechCategory; technology: string }[];
}): Project {
  const id = uid('proj');
  const now = new Date().toISOString();

  const analysis = analyzeIdea(opts.description, opts.type);

  let techStack: TechItem[];
  if (opts.mode === 'manual' && opts.selectedTech) {
    techStack = opts.selectedTech
      .map((s) => findTech(s.category, s.technology))
      .filter((t): t is TechItem => t !== null);
  } else {
    const lower = opts.description.toLowerCase();
    techStack = [];
    const addTech = (category: TechCategory, name: string) => {
      const t = findTech(category, name);
      if (t) techStack.push(t);
    };

    addTech('Frontend', 'Next.js');
    if (lower.includes('python') || lower.includes('ml') || lower.includes('data')) {
      addTech('Backend', 'FastAPI');
    } else if (lower.includes('enterprise')) {
      addTech('Backend', 'NestJS');
    } else {
      addTech('Backend', 'Node.js');
      addTech('Backend', 'Express');
    }
    addTech('Database', 'PostgreSQL');
    if (lower.includes('real-time') || lower.includes('chat') || lower.includes('delivery') || lower.includes('social')) {
      addTech('Other Services', 'Redis');
    }
    if (lower.includes('payment') || lower.includes('ecommerce') || lower.includes('e-commerce') || lower.includes('delivery') || lower.includes('shop') || lower.includes('saas')) {
      addTech('Other Services', 'Stripe');
    }
    addTech('Other Services', 'Docker');
    addTech('Other Services', 'Vercel');
  }

  const phases: RoadmapPhase[] = [];
  const tasks: Task[] = [];
  let firstIncompletePhase = '';

  PHASE_TEMPLATES.forEach((template, phaseIdx) => {
    const phaseId = uid('phase');
    const completedTasks = phaseIdx < 2;
    const partialTasks = phaseIdx === 2;
    const phaseStatus =
      completedTasks ? 'Completed' : partialTasks ? 'In Progress' : 'Not Started';

    if (phaseStatus === 'In Progress' && !firstIncompletePhase) {
      firstIncompletePhase = template.title;
    }
    if (!firstIncompletePhase && phaseIdx === 0) {
      firstIncompletePhase = template.title;
    }

    phases.push({
      id: phaseId,
      projectId: id,
      title: template.title,
      description: template.description,
      order: phaseIdx,
      status: phaseStatus,
      difficulty: phaseIdx < 2 ? 'Easy' : phaseIdx < 4 ? 'Medium' : 'Hard',
    });

    template.tasks.forEach((taskTemplate, taskIdx) => {
      let status: Task['status'] = 'Not Started';
      if (completedTasks) status = 'Completed';
      else if (partialTasks) status = taskIdx < 2 ? 'Completed' : taskIdx === 2 ? 'In Progress' : 'Not Started';

      tasks.push({
        id: uid('task'),
        phaseId,
        title: taskTemplate.title,
        description: taskTemplate.description,
        status,
        priority: taskTemplate.priority,
        difficulty: taskTemplate.difficulty,
        estimatedTime: taskTemplate.estimatedTime,
        dependencies: taskIdx > 0 ? [tasks[tasks.length - 1].id] : [],
        order: taskIdx,
      });
    });
  });

  const archNodes: ArchNodeData[] = [];
  const archEdges: { id: string; source: string; target: string }[] = [];

  const hasStripe = techStack.some((t) => t.technology === 'Stripe');
  const hasRedis = techStack.some((t) => t.technology === 'Redis');

  const frontendNode: ArchNodeData = {
    label: 'Next.js Frontend',
    type: 'Frontend',
    description: ARCH_NODE_LIBRARY.Frontend.description,
    technology: techStack.find((t) => t.category === 'Frontend')?.technology || 'Next.js',
    responsibilities: ARCH_NODE_LIBRARY.Frontend.responsibilities,
  };
  const apiNode: ArchNodeData = {
    label: 'API Server',
    type: 'Backend API',
    description: ARCH_NODE_LIBRARY['Backend API'].description,
    technology: techStack.find((t) => t.category === 'Backend')?.technology || 'Node.js',
    responsibilities: ARCH_NODE_LIBRARY['Backend API'].responsibilities,
  };
  const authNode: ArchNodeData = {
    label: 'Auth Service',
    type: 'Auth Service',
    description: ARCH_NODE_LIBRARY['Auth Service'].description,
    technology: 'Supabase Auth',
    responsibilities: ARCH_NODE_LIBRARY['Auth Service'].responsibilities,
  };
  const dbNode: ArchNodeData = {
    label: 'PostgreSQL Database',
    type: 'Database',
    description: ARCH_NODE_LIBRARY.Database.description,
    technology: techStack.find((t) => t.category === 'Database')?.technology || 'PostgreSQL',
    responsibilities: ARCH_NODE_LIBRARY.Database.responsibilities,
  };

  archNodes.push(frontendNode, apiNode, authNode, dbNode);

  archEdges.push(
    { id: uid('edge'), source: frontendNode.label, target: apiNode.label },
    { id: uid('edge'), source: apiNode.label, target: authNode.label },
    { id: uid('edge'), source: apiNode.label, target: dbNode.label },
    { id: uid('edge'), source: authNode.label, target: dbNode.label }
  );

  if (hasRedis) {
    const redisNode: ArchNodeData = {
      label: 'Redis Cache',
      type: 'Cache',
      description: ARCH_NODE_LIBRARY.Cache.description,
      technology: 'Redis',
      responsibilities: ARCH_NODE_LIBRARY.Cache.responsibilities,
    };
    archNodes.push(redisNode);
    archEdges.push({ id: uid('edge'), source: apiNode.label, target: redisNode.label });
  }

  if (hasStripe) {
    const stripeNode: ArchNodeData = {
      label: 'Payment Service',
      type: 'Payment Service',
      description: ARCH_NODE_LIBRARY['Payment Service'].description,
      technology: 'Stripe',
      responsibilities: ARCH_NODE_LIBRARY['Payment Service'].responsibilities,
    };
    archNodes.push(stripeNode);
    archEdges.push({ id: uid('edge'), source: apiNode.label, target: stripeNode.label });
  }

  const storageNode: ArchNodeData = {
    label: 'File Storage',
    type: 'Storage',
    description: ARCH_NODE_LIBRARY.Storage.description,
    technology: 'AWS S3',
    responsibilities: ARCH_NODE_LIBRARY.Storage.responsibilities,
  };
  archNodes.push(storageNode);
  archEdges.push({ id: uid('edge'), source: apiNode.label, target: storageNode.label });

  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const progress = Math.round((completedTasks / tasks.length) * 100);

  return {
    id,
    _id: id,
    userId: 'mock-user',
    name: opts.name,
    description: opts.description,
    type: opts.type,
    experienceLevel: opts.experienceLevel,
    status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Planning',
    progress,
    currentPhase: firstIncompletePhase || phases[0].title,
    techStack,
    analysis,
    phases,
    tasks,
    archNodes,
    archEdges,
    chat: [
      {
        id: uid('msg'),
        projectId: id,
        role: 'assistant',
        content: `Hi! I've analyzed your project "${opts.name}" and generated a complete development plan. I've recommended a tech stack with ${techStack.length} technologies, created a ${phases.length}-phase roadmap with ${tasks.length} tasks, and designed a system architecture with ${archNodes.length} components.\n\nAsk me anything about the plan, or try questions like "What should I build next?" or "Explain this architecture."`,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

export const SAMPLE_PROJECTS: Project[] = [
  (() => {
    const p = generateProject({
      name: 'Food Delivery App',
      description: 'I want to build a food delivery application where customers can browse restaurants, place orders, track deliveries in real-time, and pay online.',
      type: 'Web App',
      experienceLevel: 'Intermediate',
      mode: 'ai',
    });
    p.id = 'sample-food';
    p.createdAt = new Date(Date.now() - 14 * 86400000).toISOString();
    p.updatedAt = new Date(Date.now() - 2 * 86400000).toISOString();
    return p;
  })(),
  (() => {
    const p = generateProject({
      name: 'SaaS Analytics Dashboard',
      description: 'A B2B SaaS analytics platform with user accounts, subscription billing, real-time data visualization, and team collaboration features.',
      type: 'SaaS Platform',
      experienceLevel: 'Advanced',
      mode: 'ai',
    });
    p.id = 'sample-saas';
    p.createdAt = new Date(Date.now() - 30 * 86400000).toISOString();
    p.updatedAt = new Date(Date.now() - 5 * 86400000).toISOString();
    return p;
  })(),
  (() => {
    const p = generateProject({
      name: 'Task Management Board',
      description: 'A kanban-style project management tool with boards, lists, cards, team collaboration, and time tracking.',
      type: 'Web App',
      experienceLevel: 'Intermediate',
      mode: 'ai',
    });
    p.id = 'sample-task';
    p.createdAt = new Date(Date.now() - 7 * 86400000).toISOString();
    p.updatedAt = new Date(Date.now() - 1 * 86400000).toISOString();
    return p;
  })(),
];
