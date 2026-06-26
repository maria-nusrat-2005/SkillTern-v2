const StudentProfile = require('../models/StudentProfile');
const Internship = require('../models/Internship');
const MatchRecord = require('../models/MatchRecord');
const Project = require('../models/Project');
const { getLearningResource } = require('../utils/learningResources');

/**
 * Calculates matching score, matched skills, missing skills, and dynamic recommendation reasons
 * for a student profile against an internship.
 * 
 * @param {object} studentProfile Mongoose/lean student profile object
 * @param {Array} projects List of student projects (defaults to studentProfile.projects)
 * @param {object} internship Mongoose/lean internship object
 * @returns {object} { score, matchedSkills, missingSkills, explanation, improvementSuggestions }
 */
const calculateScore = (studentProfile, projects, internship) => {
  // If projects is not provided, shift arguments to support backward compatibility: calculateScore(profile, internship)
  let actualProjects = projects;
  let actualInternship = internship;
  if (!internship && projects && typeof projects === 'object' && !Array.isArray(projects)) {
    actualInternship = projects;
    actualProjects = studentProfile?.projects || [];
  }

  const skills = studentProfile?.skills || [];
  const interests = studentProfile?.interests || [];
  const experiences = studentProfile?.experiences || [];

  const studentSkillsSet = new Set(skills.map(s => s.trim().toLowerCase()));
  const requiredSkills = actualInternship.requiredSkills || [];
  const requiredSkillsCount = requiredSkills.length;

  // 1. Skill Match (50%)
  const matchedSkillsOriginal = [];
  const missingSkillsOriginal = [];

  requiredSkills.forEach(skill => {
    const normalized = skill.trim().toLowerCase();
    if (studentSkillsSet.has(normalized)) {
      matchedSkillsOriginal.push(skill);
    } else {
      missingSkillsOriginal.push(skill);
    }
  });

  const skillMatchScore = requiredSkillsCount > 0 
    ? (matchedSkillsOriginal.length / requiredSkillsCount) * 100 
    : 100;

  // 2. Interest Match (30%)
  const studentInterests = interests.map(i => i.trim().toLowerCase());
  const categoryTags = (actualInternship.category || '')
    .split(/[,/&]|\band\b/)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  let matchedCategoryCount = 0;
  categoryTags.forEach(tag => {
    const isMatched = studentInterests.some(interest => 
      interest === tag || interest.includes(tag) || tag.includes(interest)
    );
    if (isMatched) matchedCategoryCount++;
  });

  const interestMatchScore = categoryTags.length > 0 
    ? (matchedCategoryCount / categoryTags.length) * 100 
    : 0;

  // 3. Experience Match (20%)
  let experienceMatchScore = 100;
  if (requiredSkillsCount > 0) {
    let experienceMatchSum = 0;

    requiredSkills.forEach(skill => {
      const normalizedSkill = skill.trim().toLowerCase();
      let maxSkillCredit = 0;

      // Check projects
      actualProjects.forEach(project => {
        const projectTechs = (project.technologies || []).map(t => t.trim().toLowerCase());
        const projectDesc = (project.description || '').toLowerCase();
        const projectTitle = (project.title || '').toLowerCase();

        if (projectTechs.includes(normalizedSkill)) {
          maxSkillCredit = 1.0; // Exact match in tech list = Full points
        } else if (projectDesc.includes(normalizedSkill) || projectTitle.includes(normalizedSkill)) {
          maxSkillCredit = Math.max(maxSkillCredit, 0.5); // Mentioned in description = Half points
        }
      });

      // Check experiences
      experiences.forEach(exp => {
        const expDesc = (exp.description || '').toLowerCase();
        const expRole = (exp.role || '').toLowerCase();
        const expCompany = (exp.company || '').toLowerCase();

        if (expDesc.includes(normalizedSkill) || expRole.includes(normalizedSkill) || expCompany.includes(normalizedSkill)) {
          maxSkillCredit = Math.max(maxSkillCredit, 0.5); // Mentioned in description = Half points
        }
      });

      experienceMatchSum += maxSkillCredit;
    });

    experienceMatchScore = (experienceMatchSum / requiredSkillsCount) * 100;
  }

  // Calculate total score (weighted)
  const totalScore = (skillMatchScore * 0.50) + (interestMatchScore * 0.30) + (experienceMatchScore * 0.20);
  const roundedScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Generate dynamic explanation
  let explanation = '';
  if (roundedScore >= 75) {
    explanation = `Strong match! You satisfy ${matchedSkillsOriginal.length} out of ${requiredSkillsCount} required skills`;
    if (matchedCategoryCount > 0) {
      explanation += ` and align with the ${actualInternship.category} category.`;
    } else {
      explanation += '.';
    }
  } else if (roundedScore >= 40) {
    explanation = `Moderate match. You satisfy ${matchedSkillsOriginal.length} out of ${requiredSkillsCount} required skills.`;
    if (missingSkillsOriginal.length > 0) {
      explanation += ` Acquire ${missingSkillsOriginal.slice(0, 2).join(', ')} to boost your rating.`;
    }
  } else {
    explanation = `Developing match. Focus on learning ${missingSkillsOriginal.slice(0, 2).join(', ')} to qualify.`;
  }

  // Calculate potential score improvements for missing skills
  const improvementSuggestions = missingSkillsOriginal.map(skill => {
    const boost = requiredSkillsCount > 0 
      ? (1 / requiredSkillsCount) * 0.50 * 100 
      : 0;
    
    const resource = getLearningResource(skill);

    return {
      skill,
      potentialBoost: parseFloat(boost.toFixed(1)),
      improvementValue: parseFloat(boost.toFixed(1)), // keep for backward compatibility
      suggestion: resource ? resource.suggestion : `Search fundamentals of ${skill} to close the gap.`,
      resourceUrl: resource ? resource.resourceUrl : `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
      resourceName: resource ? resource.resourceName : `Search ${skill} on Coursera`
    };
  });

  return {
    score: roundedScore,
    matchedSkills: matchedSkillsOriginal,
    missingSkills: missingSkillsOriginal,
    explanation,
    recommendationReason: explanation, // keep for backward compatibility
    potentialImprovements: improvementSuggestions, // keep for backward compatibility
    improvementSuggestions
  };
};

/**
 * Calculates matching recommendations and caches/upserts them into MatchRecords
 * 
 * @param {string} studentUserId The student user ID (User model ref)
 * @returns {Array<object>} List of internships with match details attached, sorted by score desc
 */
const getRecsForStudent = async (studentUserId) => {
  const studentProfile = await StudentProfile.findOne({ userId: studentUserId }).lean();
  if (!studentProfile) {
    throw new Error('Student profile not found. Complete profile onboarding first.');
  }

  const projects = await Project.find({ studentId: studentUserId }).lean();
  const internships = await Internship.find({ status: 'Published' }).lean();

  const matchPromises = internships.map(async (internship) => {
    const matchAnalysis = calculateScore(studentProfile, projects, internship);

    // Upsert cached MatchRecord
    await MatchRecord.findOneAndUpdate(
      { studentId: studentUserId, internshipId: internship._id },
      {
        score: matchAnalysis.score,
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
        explanation: matchAnalysis.explanation,
        recommendationReason: matchAnalysis.explanation, // keep for compatibility
        improvementSuggestions: matchAnalysis.improvementSuggestions
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return {
      ...internship,
      match: {
        score: matchAnalysis.score,
        matchedSkills: matchAnalysis.matchedSkills,
        missingSkills: matchAnalysis.missingSkills,
        explanation: matchAnalysis.explanation,
        potentialImprovements: matchAnalysis.improvementSuggestions, // legacy
        improvementSuggestions: matchAnalysis.improvementSuggestions
      }
    };
  });

  const matchedInternships = await Promise.all(matchPromises);
  return matchedInternships.sort((a, b) => b.match.score - a.match.score);
};

module.exports = {
  calculateScore,
  getRecsForStudent
};
