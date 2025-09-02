// Dashboard Controller temporário
exports.getDashboard = (req, res) => {
  res.json({
    success: true,
    message: 'Dashboard - em desenvolvimento',
    data: {
      totalPatients: 0,
      totalAppointments: 0,
      totalDocuments: 0,
      recentActivity: []
    }
  });
};

exports.getDashboardStats = (req, res) => {
  res.json({
    success: true,
    data: {
      patients: 0,
      appointments: 0,
      documents: 0,
      users: 0
    }
  });
};

exports.getRecentPatients = (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

exports.getRecentAppointments = (req, res) => {
  res.json({
    success: true,
    data: []
  });
};

exports.getDocumentsByCategory = (req, res) => {
  res.json({
    success: true,
    data: []
  });
};