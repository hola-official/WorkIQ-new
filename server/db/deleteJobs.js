const cron = require('node-cron');
const Task = require('../Model/TaskModel');

// Schedule the job to run every 24 hours
cron.schedule('0 0 * * *', async () => {
  try {
    // Find tasks older than 24 hours and update their visibility
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    await Task.updateMany({ status: 'pending', createdAt: { $lt: twentyFourHoursAgo } }, { visibleTo: [] });
    console.log('Updated task visibility');
  } catch (error) {
    console.error('Error updating task visibility:', error);
  }
});
