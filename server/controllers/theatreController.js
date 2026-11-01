import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';

// @desc    Get all theatres with city filter and search
// @route   GET /api/theatres
// @access  Public
export const getTheatres = async (req, res, next) => {
  try {
    const { city, search } = req.query;
    const query = { status: 'active' };

    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const theatres = await Theatre.find(query).populate('screens');

    res.status(200).json({
      success: true,
      count: theatres.length,
      theatres,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distinct list of cities
// @route   GET /api/theatres/cities
// @access  Public
export const getCities = async (req, res, next) => {
  try {
    const cities = await Theatre.distinct('city', { status: 'active' });
    res.status(200).json({
      success: true,
      cities: cities.sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
export const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id).populate('screens');

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    res.status(200).json({
      success: true,
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new theatre (Admin)
// @route   POST /api/theatres
// @access  Private/Admin
export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update theatre (Admin)
// @route   PUT /api/theatres/:id
// @access  Private/Admin
export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully',
      theatre,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete theatre (Admin)
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: 'Theatre not found',
      });
    }

    // Delete associated screens
    await Screen.deleteMany({ theatreId: req.params.id });
    await Theatre.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Theatre and associated screens deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Screens management
export const getScreens = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.theatreId) {
      query.theatreId = req.query.theatreId;
    }
    const screens = await Screen.find(query).populate('theatreId', 'name city');
    res.status(200).json({
      success: true,
      count: screens.length,
      screens,
    });
  } catch (error) {
    next(error);
  }
};

export const createScreen = async (req, res, next) => {
  try {
    const screen = await Screen.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Screen added successfully',
      screen,
    });
  } catch (error) {
    next(error);
  }
};

export const updateScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Screen updated successfully',
      screen,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScreen = async (req, res, next) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Screen deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

