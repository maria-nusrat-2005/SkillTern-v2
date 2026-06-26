/**
 * Curated online learning resources for common developer skills
 */
const skillResources = {
  react: {
    resourceName: 'React Official Documentation',
    resourceUrl: 'https://react.dev/learn',
    suggestion: 'Read the official React quick-start guide and complete the Tic-Tac-Toe tutorial.',
  },
  javascript: {
    resourceName: 'MDN Web Docs - JavaScript',
    resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    suggestion: 'Brush up on modern ES6+ features, promises, async/await, and array operations.',
  },
  'node.js': {
    resourceName: 'Node.js Learning Pathway',
    resourceUrl: 'https://nodejs.org/en/learn',
    suggestion: 'Learn the Node.js event loop, filesystem module, and package management with npm.',
  },
  express: {
    resourceName: 'Express.js Getting Started',
    resourceUrl: 'https://expressjs.com/en/starter/installing.html',
    suggestion: 'Understand Express routing, middleware architecture, and request-response cycles.',
  },
  mongodb: {
    resourceName: 'MongoDB University',
    resourceUrl: 'https://learn.mongodb.com/',
    suggestion: 'Learn document database modeling, index optimizations, and Mongoose operations.',
  },
  python: {
    resourceName: 'Python for Beginners (Official)',
    resourceUrl: 'https://www.python.org/about/gettingstarted/',
    suggestion: 'Understand basic syntax, object-oriented concepts, and key libraries like Pandas or Flask.',
  },
  docker: {
    resourceName: 'Docker Getting Started Guide',
    resourceUrl: 'https://docs.docker.com/get-started/',
    suggestion: 'Learn how to containerize applications using Dockerfiles, images, and docker-compose.',
  },
  git: {
    resourceName: 'Pro Git Book (Free)',
    resourceUrl: 'https://git-scm.com/book/en/v2',
    suggestion: 'Master staging, committing, branching, merging, and remote workflow operations.',
  },
  sql: {
    resourceName: 'W3Schools SQL Tutorial',
    resourceUrl: 'https://www.w3schools.com/sql/',
    suggestion: 'Master relational database queries, joins, aggregations, and subqueries.',
  },
  typescript: {
    resourceName: 'TypeScript HandBook',
    resourceUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    suggestion: 'Learn interfaces, structural typing, enums, and how to configure compiler options.',
  },
  css: {
    resourceName: 'CSS Layouts on MDN',
    resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Layout_cookbook',
    suggestion: 'Deepen your knowledge on CSS Flexbox, Grid layout systems, and responsive media queries.',
  },
  html: {
    resourceName: 'Semantic HTML Reference',
    resourceUrl: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html',
    suggestion: 'Understand HTML5 accessibility tags, head meta structure, and form validation attributes.',
  },
  tailwind: {
    resourceName: 'Tailwind CSS Docs',
    resourceUrl: 'https://tailwindcss.com/docs',
    suggestion: 'Browse utility-first styles, layout configuration, and theme customizations.',
  },
  tailwindcss: {
    resourceName: 'Tailwind CSS Docs',
    resourceUrl: 'https://tailwindcss.com/docs',
    suggestion: 'Browse utility-first styles, layout configuration, and theme customizations.',
  },
  kubernetes: {
    resourceName: 'Kubernetes Basics',
    resourceUrl: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    suggestion: 'Learn deployment orchestration, pods, services, and cluster scale settings.',
  },
  java: {
    resourceName: 'Java Programming Tutorials',
    resourceUrl: 'https://dev.java/learn/',
    suggestion: 'Review collections frameworks, multithreading, and Spring Boot MVC architecture patterns.',
  },
  'c++': {
    resourceName: 'C++ Programming Language',
    resourceUrl: 'https://isocpp.org/get-started',
    suggestion: 'Learn memory management, pointers, templates, and compiler optimization flags.',
  },
};

/**
 * Returns learning resources and suggestion text for a skill.
 * If not in local dictionary, generates a fallback Coursera search link.
 * @param {string} skill The technical skill name
 * @returns {object} { resourceName, resourceUrl, suggestion }
 */
const getLearningResource = (skill) => {
  if (!skill) return null;
  
  const normalizedSkill = skill.trim().toLowerCase();
  
  if (skillResources[normalizedSkill]) {
    return { ...skillResources[normalizedSkill] };
  }
  
  // Fallback
  return {
    resourceName: `Coursera Courses for ${skill}`,
    resourceUrl: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
    suggestion: `Acquire industry-standard fundamentals of ${skill} on Coursera.`,
  };
};

module.exports = {
  getLearningResource,
};
