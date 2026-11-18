
const FollowUp = require("../models/FollowUp");

// GET FIXLOOP OUTCOME ANALYTICS
const getOutcomeAnalytics = async (req, res) => {
  try {
    const filter = {
      createdBy: req.user._id
    };

    const totalFollowUps = await FollowUp.countDocuments(filter);

    const responded = await FollowUp.countDocuments({
      ...filter,
      responseStatus: "Responded"
    });

    const noResponse = await FollowUp.countDocuments({
      ...filter,
      responseStatus: "No Response"
    });

    const pending = await FollowUp.countDocuments({
      ...filter,
      responseStatus: "Pending"
    });

    const outcomeStats = await FollowUp.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$outcome",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const ratingStats = await FollowUp.aggregate([
      {
        $match: {
          ...filter,
          rating: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    const comebacks = await FollowUp.countDocuments({
      ...filter,
      symptomReturned: true
    });

    const comebackRate = responded > 0
      ? Number(((comebacks / responded) * 100).toFixed(2))
      : 0;

    const averageRating = ratingStats.length > 0
      ? Number(ratingStats[0].averageRating.toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalFollowUps,
        responded,
        noResponse,
        pending,
        comebacks,
        comebackRate,
        averageRating,
        totalRatings: ratingStats[0]?.totalRatings || 0,
        outcomeStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getOutcomeAnalytics
};
