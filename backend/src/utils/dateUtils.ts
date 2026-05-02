export const calculateNextMaintenanceDate = (lastDate: Date, frequency: string): Date => {
  const nextDate = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setDate(nextDate.getDate() + 30);
      break;
    case 'quarterly':
      nextDate.setDate(nextDate.getDate() + 90);
      break;
    case 'biannual':
      nextDate.setDate(nextDate.getDate() + 180);
      break;
    case 'annual':
      nextDate.setDate(nextDate.getDate() + 365);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + 30);
  }
  
  return nextDate;
};
