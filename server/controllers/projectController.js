const Project = require('../models/Project');
const StudentProfile = require('../models/StudentProfile');

// Synchronize projects array in StudentProfile model
const syncProfileProjects = async (studentId) => {
  const projects = await Project.find({ studentId }).lean();
  const profileProjects = projects.map(p => ({
    title: p.title,
    description: p.description,
    technologies: p.technologies
  }));
  
  await StudentProfile.findOneAndUpdate(
    { userId: studentId },
    { projects: profileProjects }
  );
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (student only)
 */
const createProject = async (req, res, next) => {
  try {
    const { title, description, technologies, githubUrl, liveUrl } = req.body;

    const project = await Project.create({
      studentId: req.user.id,
      title,
      description,
      technologies: technologies || [],
      githubUrl,
      liveUrl
    });

    await syncProfileProjects(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for authenticated student
 * @route   GET /api/projects
 * @access  Private (student only)
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ studentId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully.',
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private (student owner only)
 */
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, studentId: req.user.id });
    if (!project) {
      res.status(404);
      return next(new Error('Project not found or unauthorized'));
    }

    const { title, description, technologies, githubUrl, liveUrl } = req.body;
    
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (technologies !== undefined) project.technologies = technologies;
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveUrl !== undefined) project.liveUrl = liveUrl;

    const updatedProject = await project.save();

    await syncProfileProjects(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (student owner only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, studentId: req.user.id });
    if (!project) {
      res.status(404);
      return next(new Error('Project not found or unauthorized'));
    }

    await syncProfileProjects(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject
};
