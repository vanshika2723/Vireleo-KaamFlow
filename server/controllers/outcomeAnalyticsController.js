
const FollowUp = require("../models/FollowUp");
const ServiceRequest = require("../models/ServiceRequest");

// WORKSPACE HELPER
const getWorkspaceId = (user) => {
  return user.businessId ||
    (user.role === "Admin" ? user._id : null);
};

// GET FIXLOOP OUTCOME ANALYTICS
const getOutcomeAnalytics = async (req, res) => {
  try {
    if (!["Admin", "Service Desk"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view outcome analytics"
      });
    }

    const businessId = getWorkspaceId(req.user);

    if (!businessId) {
      return res.status(403).json({
        success: false,
        message: "User is not connected to a workspace"
      });
    }

    // Find all requests belonging to this workspace
    const requests = await ServiceRequest.find({
      businessId
    }).select("_id");

    const requestIds = requests.map(
      (request) => request._id
    );

    // Workspace-level follow-up filter
    const filter = {
      serviceRequest: { $in: requestIds }
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
    console.error("Outcome Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getOutcomeAnalytics
};
