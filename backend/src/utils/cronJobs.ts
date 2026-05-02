import cron from 'node-cron';
import Equipment from '../models/Equipment';
import Notification from '../models/Notification';
import Hospital from '../models/Hospital';
import User from '../models/User';
import ServiceReport from '../models/ServiceReport';
import { emitToHospital, emitToAll } from './socket';
import { sendEmail } from './mail';

export const initCronJobs = () => {
  // 1. DAILY CHECKS: Every day at 8:00 AM
  // Format: '0 8 * * *'
  cron.schedule('0 8 * * *', async () => {
    console.log('Running daily 8:00 AM maintenance and compliance checks...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const next14Days = new Date(today);
      next14Days.setDate(today.getDate() + 14);

      const next30Days = new Date(today);
      next30Days.setDate(today.getDate() + 30);

      // --- A. EQUIPMENT MAINTENANCE CHECKS ---
      const equipments = await Equipment.find({ status: { $ne: 'decommissioned' } });

      for (const equip of (equipments as any[])) {
        if (!equip.nextMaintenanceDate) continue;

        const nextDue = new Date(equip.nextMaintenanceDate);
        nextDue.setHours(0, 0, 0, 0);

        // Overdue Maintenance
        if (nextDue < today) {
           const message = `CRITICAL: Maintenance OVERDUE for ${equip.name} (${equip.equipmentCode}). Scheduled for ${nextDue.toLocaleDateString()}.`;
           
           const notification = await Notification.create({
             hospitalId: equip.hospitalId,
             type: 'maintenance_due',
             title: 'Maintenance OVERDUE',
             message,
             priority: 'critical',
             metadata: { equipmentId: equip._id, dueDate: nextDue }
           });
           emitToHospital(equip.hospitalId.toString(), 'new_notification', notification);

           // Email Hospital Admin
           const admin = await User.findOne({ hospitalId: equip.hospitalId, role: 'hospital_admin' });
           if (admin) {
             await sendEmail({
               email: admin.email,
               subject: 'CRITICAL: Equipment Maintenance Overdue',
               message: `Dear Admin, the following equipment is overdue for maintenance: ${equip.name} (${equip.equipmentCode}). Please address this immediately.`
             });
           }
        } 
        // Due within 7 days
        else if (nextDue <= nextWeek) {
          const notification = await Notification.create({
            hospitalId: equip.hospitalId,
            type: 'maintenance_due',
            title: 'Upcoming Maintenance',
            message: `Maintenance scheduled for ${equip.name} (${equip.equipmentCode}) on ${nextDue.toLocaleDateString()}`,
            priority: 'medium',
            metadata: { equipmentId: equip._id, dueDate: nextDue }
          });
          emitToHospital(equip.hospitalId.toString(), 'new_notification', notification);
        }

        // --- B. WARRANTY CHECKS (30 Days) ---
        if (equip.warrantyExpiry) {
          const warrantyExp = new Date(equip.warrantyExpiry);
          if (warrantyExp >= today && warrantyExp <= next30Days) {
            const notification = await Notification.create({
              hospitalId: equip.hospitalId,
              type: 'system',
              title: 'Warranty Expiring Soon',
              message: `Warranty for ${equip.name} (${equip.equipmentCode}) expires on ${warrantyExp.toLocaleDateString()}`,
              priority: 'medium',
              metadata: { equipmentId: equip._id, expiryDate: warrantyExp }
            });
            emitToHospital(equip.hospitalId.toString(), 'new_notification', notification);
          }
        }

        // --- C. COMPLIANCE CHECKS (14 Days) ---
        if (equip.complianceDueDate) {
          const complianceDue = new Date(equip.complianceDueDate);
          if (complianceDue >= today && complianceDue <= next14Days) {
            const notification = await Notification.create({
              hospitalId: equip.hospitalId,
              type: 'compliance_alert',
              title: 'Compliance Due Soon',
              message: `Compliance certificate for ${equip.name} (${equip.equipmentCode}) is due on ${complianceDue.toLocaleDateString()}`,
              priority: 'high',
              metadata: { equipmentId: equip._id, dueDate: complianceDue }
            });
            emitToHospital(equip.hospitalId.toString(), 'new_notification', notification);
          }
        }
      }

      // --- D. SUBSCRIPTION EXPIRY CHECKS (7 Days) ---
      const hospitals = await Hospital.find({ isActive: true });
      for (const hospital of hospitals) {
        if (!hospital.subscriptionExpiry) continue;
        
        const subExp = new Date(hospital.subscriptionExpiry);
        if (subExp >= today && subExp <= nextWeek) {
          const notification = await Notification.create({
            hospitalId: hospital._id as any,
            type: 'system',
            title: 'Subscription Expiring',
            message: `Your hospital subscription expires on ${subExp.toLocaleDateString()}. Please renew to avoid service interruption.`,
            priority: 'high'
          });
          emitToHospital(hospital._id.toString(), 'new_notification', notification);
        }
      }

    } catch (error) {
      console.error('Error in daily cron job:', error);
    }
  });

  // 2. HOURLY CHECKS: SLA Breach Check
  cron.schedule('0 * * * *', async () => {
    console.log('Running hourly SLA breach check...');
    
    try {
      const now = new Date();
      
      const openReports = await ServiceReport.find({
        status: { $in: ['open', 'assigned', 'in_progress'] },
        'sla.breached': false,
        'sla.targetTime': { $lt: now }
      });

      for (const report of openReports) {
        report.sla.breached = true;
        await report.save();

        const message = `SLA BREACHED: Service report for ${report.title} (Priority: ${report.priority}) has exceeded target resolution time.`;
        
        const notification = await Notification.create({
          hospitalId: report.hospitalId,
          type: 'system',
          title: 'SLA Breach Alert',
          message,
          priority: 'high',
          metadata: { reportId: report._id }
        });

        emitToHospital(report.hospitalId.toString(), 'new_notification', notification);
        
        // Also notify super admin for global visibility
        emitToAll('new_notification', notification);
      }
    } catch (error) {
      console.error('Error in hourly SLA cron job:', error);
    }
  });

  console.log('Cron jobs initialized');
};
