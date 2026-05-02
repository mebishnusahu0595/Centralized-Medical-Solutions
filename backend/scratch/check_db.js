const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Equipment = require('./src/models/Equipment').default;
const User = require('./src/models/User').default;

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'admin@shalom.com' });
  console.log('User Hospital ID:', user.hospitalId);
  
  const count = await Equipment.countDocuments({ hospitalId: user.hospitalId });
  console.log('Equipment Count for this Hospital ID:', count);
  
  const all = await Equipment.find({ hospitalId: user.hospitalId });
  console.log('Equipment IDs:', all.map(e => e._id));
  
  process.exit(0);
}

check();
