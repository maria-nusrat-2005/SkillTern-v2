// Mock Mongoose models so matchingService won't fail trying to require them if we only test calculateScore in isolation
const moduleAlias = require('module');
const originalRequire = moduleAlias.prototype.require;

moduleAlias.prototype.require = function(request) {
  if (
    request.includes('models/StudentProfile') || 
    request.includes('models/Internship') || 
    request.includes('models/MatchRecord') ||
    request.includes('models/Project')
  ) {
    return {}; // Mock empty objects for model files
  }
  return originalRequire.apply(this, arguments);
};

const { calculateScore } = require('../services/matchingService');

describe('Smart Matching Engine Calculations', () => {
  const mockStudent = {
    skills: ['React', 'JavaScript', 'Node.js', 'CSS'],
    interests: ['Web Development', 'UI Design'],
    projects: [
      {
        title: 'Portfolio website',
        description: 'Personal portfolio using React and TailwindCSS',
        technologies: ['React', 'TailwindCSS']
      },
      {
        title: 'Simple API server',
        description: 'Built a simple server using Express and Node.js to serve mock data',
        technologies: ['Node.js', 'Express']
      }
    ],
    experiences: [
      {
        company: 'Freelance Inc',
        role: 'Frontend Helper',
        description: 'Assisted in building UI views and layouts using JavaScript and HTML.'
      }
    ]
  };

  it('should correctly calculate matching scores and return a breakdown', () => {
    const mockInternship = {
      title: 'Fullstack developer intern',
      category: 'Web Development',
      requiredSkills: ['React', 'Node.js', 'Docker'],
    };

    const result = calculateScore(mockStudent, mockInternship);

    // Assertions
    // 1. Skill match score: React, Node.js are matched. Docker is missing.
    // 2 out of 3 = 66.67%
    // Interest match score: 'Web Development' is matched. 1 out of 1 = 100%
    // Experience match score:
    // - 'React': project tech exact match = 1.0
    // - 'Node.js': project tech exact match = 1.0
    // - 'Docker': not found = 0.0
    // 2 out of 3 = 66.67%
    // Weighted: (66.67 * 0.5) + (100 * 0.3) + (66.67 * 0.2)
    // = 33.33 + 30 + 13.33 = 76.66% -> Rounded to 77%
    expect(result.score).toBe(77);
    expect(result.matchedSkills).toContain('React');
    expect(result.matchedSkills).toContain('Node.js');
    expect(result.missingSkills).toContain('Docker');
    
    // Potential improvement: (1 / 3) * 0.5 * 100 = 16.7%
    const dockerImprovement = result.potentialImprovements.find(p => p.skill === 'Docker');
    expect(dockerImprovement).toBeDefined();
    expect(dockerImprovement.improvementValue).toBe(16.7);
  });

  it('should return 100% when no skills are required', () => {
    const mockInternship = {
      title: 'General Intern',
      category: 'UI Design',
      requiredSkills: []
    };

    const result = calculateScore(mockStudent, mockInternship);

    // Skill score: 100
    // Interest score: 100
    // Experience score: 100
    expect(result.score).toBe(100);
    expect(result.matchedSkills.length).toBe(0);
    expect(result.missingSkills.length).toBe(0);
  });
});
