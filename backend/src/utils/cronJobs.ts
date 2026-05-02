import cron from 'node-cron';
import Equipment from '../models/Equipment';
import Notification from '../models/Notification';
import { emitToHospital } from './socket';

export const initCronJobs = () => {
  // Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily maintenance check cron job...');
    
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // 1. Find equipment with maintenance due in next 7 days
      const dueEquipment = await Equipment.find({
        nextMaintenanceDate: { $gte: today, $lte: nextWeek },
        status: { $ne: 'decommissioned' }
      }).populate('hospitalId');

      for (const equip of dueEquipment) {
        // Create notification
        const message = `Maintenance due for ${equip.name} (${equip.equipmentCode}) on ${equip.nextMaintenanceDate?.toLocaleDateString()}`;
        
        const notification = await Notification.create({
          hospitalId: equip.hospitalId,
          type: 'maintenance_due',
          title: 'Upcoming Maintenance Reminder',
          message,
          metadata: {
            equipmentId: equip._id,
            dueDate: equip.nextMaintenanceDate
          }
        });

        // Emit socket event
        emitToHospital(equip.hospitalId.toString(), 'new_notification', notification);
      }

      // 2. Find equipment with expired compliance
      const expiredCompliance = await Equipment.find({
        complianceDueDate: { $lt: today },
        status: { $ne: 'decommissioned' }
      });

      for (const equip of expiredCompliance) {
        const message = `Compliance certificate expired for ${equip.name} (${equip.equipmentCode}) on ${equip.complianceDueDate?.toLocaleDateString()}`;
        
        const notification = await Notification.create({
          hospitalId: equip.hospitalId,
          type: 'compliance_alert',
          title: 'Compliance Expiry Alert',
          message,
          priority: 'high',
          metadata: {
            equipmentId: equip._id,
            expiryDate: equip.complianceDueDate
          }
        });

        emitToHospital(equip.hospitalId.toString(), 'new_notification', notification);
      }

    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });

  console.log('Cron jobs initialized');
};
