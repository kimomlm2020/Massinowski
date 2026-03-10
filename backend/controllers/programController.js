import programModel from '../models/programModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== DEFAULT DATA ====================

const DEFAULT_FEATURES = {
  'Fitness': ["Personalized training plan", "Nutrition guidance", "Progress tracking", "Monthly check-ins"],
  'Bodybuilding': ["Custom split routine", "Macro coaching", "Weekly check-ins", "Form review"],
  'Nutrition': ["Meal planning", "Macro calculation", "Grocery lists", "Recipe guide"],
  'Cardio': ["Endurance plans", "Heart rate zones", "Performance tracking", "Weekly adjustments"],
  'Strength': ["Powerlifting focus", "Technique review", "Periodization", "Strength tests"],
  'Recovery': ["Mobility work", "Stretching routines", "Injury prevention", "Recovery protocols"],
  'default': ["Personalized approach", "Expert guidance", "Ongoing support", "Progress tracking"]
};

const DEFAULT_ICONS = {
  'Fitness': '💪',
  'Bodybuilding': '🏋️',
  'Nutrition': '🥗',
  'Cardio': '🏃',
  'Strength': '⚡',
  'Recovery': '🧘',
  'default': '📋'
};

// ==================== HELPERS ====================

const getDefaultSupport = (level) => {
  const supportMap = {
    'Beginner': 'Monthly check-ins via email',
    'Intermediate': 'WhatsApp access, weekly check-ins',
    'Advanced': 'Daily WhatsApp, priority response',
    'Elite': 'Daily WhatsApp, private consultations, priority response'
  };
  return supportMap[level] || 'Email support included';
};

const formatProgramForFrontend = (program) => {
  if (!program) return null;
  
  const category = program.category || 'Fitness';
  const level = program.level || 'Beginner';
  
  return {
    // Backend fields
    _id: program._id,
    id: program._id,
    name: program.name,
    description: program.description,
    price: program.price,
    image: program.image,
    category: program.category,
    subCategory: program.subCategory,
    level: program.level,
    popular: program.popular,
    duration: program.duration,
    date: program.date,
    features: program.features,
    subtitle: program.subtitle,
    bestFor: program.bestFor,
    support: program.support,
    fullDescription: program.fullDescription,
    icon: program.icon,
    currency: program.currency,
    isActive: program.isActive,
    
    // Frontend-specific mappings
    title: program.name,
    priceNumber: program.price,
    priceDisplay: `${program.price}${program.currency || '€'}`
  };
};

const deleteFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
  }
  return false;
};

// ==================== CONTROLLERS ====================

// List all programs
const listPrograms = async (req, res) => {
  try {
    const programs = await programModel.find({ isActive: { $ne: false } })
      .sort({ date: -1 })
      .lean(); // Better performance
    
    const formattedPrograms = programs.map(formatProgramForFrontend);
    
    res.json({ 
      success: true, 
      programs: formattedPrograms,
      count: formattedPrograms.length 
    });
  } catch (error) {
    console.error('List programs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single program
const getProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    
    if (!programId || !programId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid program ID' });
    }
    
    const program = await programModel.findById(programId);
    
    if (!program || program.isActive === false) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    res.json({ 
      success: true, 
      program: formatProgramForFrontend(program) 
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add program
const addProgram = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      subCategory, 
      level, 
      duration, 
      popular,
      features,
      subtitle,
      bestFor,
      support,
      fullDescription,
      icon
    } = req.body;

    // Validation
    const requiredFields = { name, description, price, category, subCategory, level, duration };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, val]) => !val)
      .map(([key, _]) => key);
    
    if (missingFields.length > 0) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // Parse features
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
        if (!Array.isArray(parsedFeatures)) parsedFeatures = [];
      } catch (e) {
        parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      }
    }

    const programData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      subCategory: subCategory.trim(),
      level: level.trim(),
      duration: duration.trim(),
      popular: popular === 'true' || popular === true,
      image: [req.file.filename],
      features: parsedFeatures.length > 0 ? parsedFeatures : (DEFAULT_FEATURES[category] || DEFAULT_FEATURES.default),
      subtitle: subtitle?.trim() || `${level} Level Program`,
      bestFor: bestFor?.trim() || `Athletes seeking ${category.toLowerCase()} improvement`,
      support: support?.trim() || getDefaultSupport(level),
      fullDescription: fullDescription?.trim() || description.trim(),
      icon: icon?.trim() || DEFAULT_ICONS[category] || DEFAULT_ICONS.default,
      currency: '€',
      date: Date.now(),
      isActive: true
    };

    const program = new programModel(programData);
    await program.save();

    res.status(201).json({ 
      success: true, 
      message: 'Program added successfully', 
      program: formatProgramForFrontend(program)
    });

  } catch (error) {
    console.error('Add program error:', error);
    if (req.file) deleteFile(req.file.filename);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update program
const updateProgram = async (req, res) => {
  try {
    const { 
      id, 
      name, 
      description, 
      price, 
      category, 
      subCategory, 
      level, 
      duration, 
      popular,
      features,
      subtitle,
      bestFor,
      support,
      fullDescription,
      icon,
      isActive
    } = req.body;

    if (!id) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(400).json({ success: false, message: 'Program ID is required' });
    }

    const program = await programModel.findById(id);
    if (!program) {
      if (req.file) deleteFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Parse features if provided
    let parsedFeatures = program.features;
    if (features !== undefined) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
        if (!Array.isArray(parsedFeatures)) parsedFeatures = program.features;
      } catch (e) {
        parsedFeatures = program.features;
      }
    }

    // Update fields
    const updates = {
      name: name?.trim() || program.name,
      description: description?.trim() || program.description,
      price: price ? Number(price) : program.price,
      category: category?.trim() || program.category,
      subCategory: subCategory?.trim() || program.subCategory,
      level: level?.trim() || program.level,
      duration: duration?.trim() || program.duration,
      popular: popular !== undefined ? (popular === 'true' || popular === true) : program.popular,
      features: parsedFeatures,
      subtitle: subtitle !== undefined ? subtitle.trim() : program.subtitle,
      bestFor: bestFor !== undefined ? bestFor.trim() : program.bestFor,
      support: support !== undefined ? support.trim() : program.support,
      fullDescription: fullDescription !== undefined ? fullDescription.trim() : program.fullDescription,
      icon: icon !== undefined ? icon.trim() : program.icon,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : program.isActive
    };

    // Handle new image
    if (req.file) {
      // Delete old images
      program.image.forEach(img => deleteFile(img));
      updates.image = [req.file.filename];
    }

    Object.assign(program, updates);
    await program.save();

    res.json({ 
      success: true, 
      message: 'Program updated successfully',
      program: formatProgramForFrontend(program)
    });
  } catch (error) {
    console.error('Update program error:', error);
    if (req.file) deleteFile(req.file.filename);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle program status (soft delete)
const toggleProgramStatus = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Program ID is required' });
    }

    const program = await programModel.findById(id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    
    program.isActive = !program.isActive;
    await program.save();
    
    res.json({ 
      success: true, 
      message: `Program ${program.isActive ? 'activated' : 'deactivated'} successfully`,
      program: formatProgramForFrontend(program)
    });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove program (hard delete)
const removeProgram = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Program ID is required' });
    }

    const program = await programModel.findById(id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Delete associated images
    const deletedFiles = program.image.map(img => deleteFile(img));
    console.log(`Deleted ${deletedFiles.filter(Boolean).length} files`);

    await programModel.findByIdAndDelete(id);
    
    res.json({ 
      success: true, 
      message: 'Program permanently deleted',
      deletedFiles: deletedFiles.filter(Boolean).length
    });
  } catch (error) {
    console.error('Remove program error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { 
  listPrograms, 
  getProgram,
  addProgram, 
  updateProgram,
  removeProgram,
  toggleProgramStatus
};