import express from 'express';
import mongoose from 'mongoose';
import Career from '../models/Career.js';
import { memoryCareers } from '../data/store.js';
import { CAREERS_SEED } from '../data/careersSeedData.js';

const router = express.Router();

/**
 * Helper to ensure database is seeded with initial careers if empty
 */
async function ensureCareersSeeded() {
  if (mongoose.connection.readyState === 1) {
    try {
      const count = await Career.countDocuments();
      if (count === 0) {
        console.log('[CareerOS DB]: Seeding 23 technical careers into MongoDB...');
        await Career.insertMany(CAREERS_SEED);
        console.log('[CareerOS DB]: Successfully seeded 23 careers.');
      }
    } catch (err) {
      console.warn('[CareerOS DB]: Auto-seed check error:', err.message);
    }
  }
}

/**
 * @route   GET /api/careers
 * @desc    Get all available careers with optional filtering (search, category, difficulty)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, difficulty, featured } = req.query || {};

    let careersList = [];

    if (mongoose.connection.readyState === 1) {
      await ensureCareersSeeded();

      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (difficulty && difficulty !== 'All') {
        query.difficulty = difficulty;
      }
      if (featured === 'true') {
        query.featured = true;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: regex },
          { description: regex },
          { skills: { $in: [regex] } }
        ];
      }

      careersList = await Career.find(query).sort({ featured: -1, title: 1 }).lean();
    } else {
      // In-memory fallback
      careersList = memoryCareers;
      if (category && category !== 'All') {
        careersList = careersList.filter(c => c.category === category);
      }
      if (difficulty && difficulty !== 'All') {
        careersList = careersList.filter(c => c.difficulty === difficulty);
      }
      if (featured === 'true') {
        careersList = careersList.filter(c => c.featured);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        careersList = careersList.filter(c => 
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.skills && c.skills.some(s => s.toLowerCase().includes(q)))
        );
      }
    }

    // Format lightweight card summaries
    const formatted = careersList.map(c => {
      const phases = c.roadmapPhases || [];
      let totalModules = 0;
      phases.forEach(p => {
        (p.subjects || []).forEach(s => {
          totalModules += (s.modules || []).length;
        });
      });

      return {
        id: c._id ? c._id.toString() : c.slug,
        title: c.title,
        slug: c.slug,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        estimatedHours: c.estimatedHours,
        skills: c.skills || [],
        prerequisites: c.prerequisites || [],
        status: c.status || 'Active',
        icon: c.icon || 'Code',
        featured: Boolean(c.featured),
        phaseCount: phases.length,
        moduleCount: totalModules
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      careers: formatted
    });
  } catch (error) {
    console.error('[Careers API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch careers',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/careers/:slug
 * @desc    Get detailed career information by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let career = null;

    if (mongoose.connection.readyState === 1) {
      await ensureCareersSeeded();
      career = await Career.findOne({ slug: slug.toLowerCase() }).lean();
    } else {
      career = memoryCareers.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    }

    if (!career) {
      return res.status(404).json({
        success: false,
        message: `Career with slug "${slug}" was not found`
      });
    }

    // Calculate metadata
    const phases = career.roadmapPhases || [];
    let totalModules = 0;
    let totalSubjects = 0;
    phases.forEach(p => {
      totalSubjects += (p.subjects || []).length;
      (p.subjects || []).forEach(s => {
        totalModules += (s.modules || []).length;
      });
    });

    return res.status(200).json({
      success: true,
      career: {
        ...career,
        id: career._id ? career._id.toString() : career.slug,
        phaseCount: phases.length,
        subjectCount: totalSubjects,
        moduleCount: totalModules
      }
    });
  } catch (error) {
    console.error('[Career Detail API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career details',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/careers/:slug/roadmap
 * @desc    Get full hierarchical roadmap (Phases -> Subjects -> Modules) for a career
 * @access  Public
 */
router.get('/:slug/roadmap', async (req, res) => {
  try {
    const { slug } = req.params;
    let career = null;

    if (mongoose.connection.readyState === 1) {
      await ensureCareersSeeded();
      career = await Career.findOne({ slug: slug.toLowerCase() }).lean();
    } else {
      career = memoryCareers.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    }

    if (!career) {
      return res.status(404).json({
        success: false,
        message: `Career "${slug}" not found`
      });
    }

    return res.status(200).json({
      success: true,
      careerTitle: career.title,
      careerSlug: career.slug,
      estimatedHours: career.estimatedHours,
      roadmapPhases: career.roadmapPhases || []
    });
  } catch (error) {
    console.error('[Career Roadmap API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve career roadmap',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/careers/:slug/modules/:moduleSlug
 * @desc    Get specific module within a career for the Learning Hub
 * @access  Public
 */
router.get('/:slug/modules/:moduleSlug', async (req, res) => {
  try {
    const { slug, moduleSlug } = req.params;
    let career = null;

    if (mongoose.connection.readyState === 1) {
      await ensureCareersSeeded();
      career = await Career.findOne({ slug: slug.toLowerCase() }).lean();
    } else {
      career = memoryCareers.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    }

    if (!career) {
      return res.status(404).json({
        success: false,
        message: `Career "${slug}" not found`
      });
    }

    // Traverse phases and subjects to find the module
    let foundModule = null;
    let parentSubject = null;
    let parentPhase = null;
    let allModulesList = [];

    const phases = career.roadmapPhases || [];
    for (const phase of phases) {
      for (const subject of (phase.subjects || [])) {
        for (const mod of (subject.modules || [])) {
          allModulesList.push({
            slug: mod.slug,
            title: mod.title,
            subjectTitle: subject.title,
            phaseTitle: phase.title
          });

          if (mod.slug.toLowerCase() === moduleSlug.toLowerCase() || mod.id === moduleSlug) {
            foundModule = mod;
            parentSubject = subject;
            parentPhase = phase;
          }
        }
      }
    }

    if (!foundModule) {
      return res.status(404).json({
        success: false,
        message: `Module "${moduleSlug}" was not found in career "${career.title}"`
      });
    }

    // Determine prev and next module in roadmap order
    const currentIndex = allModulesList.findIndex(m => m.slug.toLowerCase() === foundModule.slug.toLowerCase());
    const prevModule = currentIndex > 0 ? allModulesList[currentIndex - 1] : null;
    const nextModule = currentIndex < allModulesList.length - 1 ? allModulesList[currentIndex + 1] : null;

    return res.status(200).json({
      success: true,
      career: {
        title: career.title,
        slug: career.slug
      },
      phase: {
        phaseNumber: parentPhase ? parentPhase.phaseNumber : 1,
        title: parentPhase ? parentPhase.title : ''
      },
      subject: {
        id: parentSubject ? parentSubject.id : '',
        title: parentSubject ? parentSubject.title : ''
      },
      module: foundModule,
      navigation: {
        prev: prevModule,
        next: nextModule,
        currentIndex: currentIndex + 1,
        totalModules: allModulesList.length
      }
    });
  } catch (error) {
    console.error('[Module API Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve module content',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/careers/seed
 * @desc    Force re-seed or reload career catalog
 * @access  Public (or admin)
 */
router.post('/seed', async (req, res) => {
  try {
    const { overwrite = false } = req.body || {};

    if (mongoose.connection.readyState === 1) {
      if (overwrite) {
        await Career.deleteMany({});
      }
      const existing = await Career.countDocuments();
      if (existing === 0 || overwrite) {
        await Career.insertMany(CAREERS_SEED);
      }
      const count = await Career.countDocuments();
      return res.status(200).json({
        success: true,
        message: `Career catalog seeded in MongoDB. Total careers: ${count}`,
        count
      });
    }

    return res.status(200).json({
      success: true,
      message: `Running on in-memory fallback. Total careers available: ${memoryCareers.length}`,
      count: memoryCareers.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to seed careers',
      error: error.message
    });
  }
});

export default router;
