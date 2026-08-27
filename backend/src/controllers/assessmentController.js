import User from '../models/User.js';

export const saveAssessment = async (req, res) => {
  try {
    const { assessmentId, code, title, score, severity, completedAt } = req.body;

    if (!assessmentId || score === undefined || !severity) {
      return res.status(400).json({
        success: false,
        message: 'assessmentId, score, and severity are required.',
      });
    }

    const result = {
      assessmentId,
      code,
      title,
      score,
      severity,
      completedAt: completedAt || new Date().toISOString(),
    };

    await User.findByIdAndUpdate(
      req.userId,
      { $push: { assessmentResults: result } },
      { new: true, runValidators: false }
    );

    return res.status(200).json({
      success: true,
      message: 'Assessment result saved to your profile.',
      result,
    });
  } catch (err) {
    console.error('saveAssessment error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to save assessment',
    });
  }
};

export const getAssessmentHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('assessmentResults firstName lastName');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      history: user.assessmentResults || [],
    });
  } catch (err) {
    console.error('getAssessmentHistory error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment history',
    });
  }
};
