const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const config = require('./config');
const { connectDB, mongoose } = require('./db');
const Role = require('./models/role');
const User = require('./models/user');
const School = require('./models/school');
const Student = require('./models/student');
const FeeBill = require('./models/feeBill');
const Transaction = require('./models/transaction');

faker.seed(42);

const schoolsCount = parseInt(process.env.SEED_SCHOOLS || '5', 10);
const studentsPerSchool = parseInt(process.env.SEED_STUDENTS_PER_SCHOOL || '50', 10);
const billsPerStudent = parseInt(process.env.SEED_BILLS_PER_STUDENT || '3', 10);

const paymentMethods = ['upi', 'card', 'netbanking', 'cash', 'cheque'];
const gateways = ['razorpay', 'stripe', 'cashfree', 'mock-pay'];

async function resetCollections() {
  await Promise.all([
    User.deleteMany({}),
    Role.deleteMany({}),
    School.deleteMany({}),
    Student.deleteMany({}),
    FeeBill.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
}

async function seedRoles() {
  const superAdmin = await Role.create({
    name: 'super_admin',
    scope: 'global',
    permissions: {
      students: { read: ['*'] },
      feeBills: { read: ['*'] },
      transactions: { read: ['*'] },
      reports: { read: ['*'] },
    },
  });

  const schoolAdmin = await Role.create({
    name: 'school_admin',
    scope: 'school',
    permissions: {
      students: { read: ['*'] },
      feeBills: { read: ['*'] },
      transactions: { read: ['*'] },
      reports: { read: ['*'] },
    },
  });

  const financeViewer = await Role.create({
    name: 'finance_viewer',
    scope: 'school',
    permissions: {
      students: { read: ['name', 'studentCode', 'className', 'section', 'status'] },
      feeBills: {
        read: ['billNo', 'student', 'className', 'section', 'amountDue', 'amountPaid', 'status', 'dueDate'],
      },
      transactions: {
        read: ['amount', 'status', 'paymentMethod', 'gateway', 'createdAt', 'feeBill'],
      },
      reports: { read: ['*'] },
    },
  });

  return { superAdmin, schoolAdmin, financeViewer };
}

async function createDefaultAdmin(role) {
  const passwordHash = await bcrypt.hash(config.defaultAdminPassword, 10);
  await User.create({
    name: 'Super Admin',
    email: config.defaultAdminEmail.toLowerCase(),
    passwordHash,
    role: role._id,
  });
}

function buildBillStatus(amountDue, amountPaid, dueDate) {
  if (amountPaid >= amountDue) return 'paid';
  if (amountPaid > 0) return 'partial';
  if (dueDate < new Date()) return 'overdue';
  return 'due';
}

async function seedData({ roles }) {
  const schools = [];
  for (let i = 0; i < schoolsCount; i += 1) {
    const code = `SCH${(i + 1).toString().padStart(4, '0')}`;
    const school = await School.create({
      name: `${faker.company.name()} School`,
      code,
      address: faker.location.streetAddress(),
      timezone: 'Asia/Kolkata',
    });
    schools.push(school);

    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: `${school.name} Admin`,
      email: `admin+${code}@example.com`,
      passwordHash: adminPasswordHash,
      role: roles.schoolAdmin._id,
      school: school._id,
    });

    const viewerPasswordHash = await bcrypt.hash('Viewer@123', 10);
    await User.create({
      name: `${school.name} Finance`,
      email: `viewer+${code}@example.com`,
      passwordHash: viewerPasswordHash,
      role: roles.financeViewer._id,
      school: school._id,
    });
  }

  let billCounter = 1;
  let txnCounter = 1;
  for (const school of schools) {
    const studentsToCreate = [];
    for (let s = 0; s < studentsPerSchool; s += 1) {
      const classNum = faker.number.int({ min: 1, max: 12 });
      const section = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
      studentsToCreate.push({
        school: school._id,
        studentCode: `${school.code}-STU${(s + 1).toString().padStart(4, '0')}`,
        name: faker.person.fullName(),
        className: `Class ${classNum}`,
        section,
        status: 'active',
        parentContact: faker.phone.number(),
        parentEmail: faker.internet.email(),
      });
    }
    const students = await Student.insertMany(studentsToCreate);

    const billsToCreate = [];
    const txnsToCreate = [];
    for (const student of students) {
      for (let b = 0; b < billsPerStudent; b += 1) {
        const amountDue = faker.number.int({ min: 5000, max: 15000 });
        const amountPaid = faker.number.int({ min: 0, max: amountDue });
        const dueDate = faker.date.past({ years: 1 });
        const paymentMethod = faker.helpers.arrayElement(paymentMethods);
        const bill = {
          school: school._id,
          student: student._id,
          billNo: `BILL-${billCounter.toString().padStart(6, '0')}`,
          dueDate,
          amountDue,
          amountPaid,
          status: buildBillStatus(amountDue, amountPaid, dueDate),
          paymentMethod,
          className: student.className,
          section: student.section,
        };
        billsToCreate.push(bill);

        const isSuccess = amountPaid > 0 && Math.random() > 0.05;
        const txnStatus = isSuccess ? 'success' : 'failed';
        const txnAmount = isSuccess ? amountPaid : amountDue;
        const gateway = faker.helpers.arrayElement(gateways);
        txnsToCreate.push({
          school: school._id,
          student: student._id,
          feeBill: null, // filled later
          gatewayRef: `TXN-${txnCounter.toString().padStart(8, '0')}`,
          amount: txnAmount,
          status: txnStatus,
          paymentMethod,
          gateway,
          failureCode: isSuccess ? null : faker.helpers.arrayElement(['CARD_DECLINED', 'OTP_FAILED', 'NETWORK_ERROR']),
          failureReason: isSuccess ? null : faker.hacker.phrase(),
          initiatedAt: faker.date.recent({ days: 90 }),
          completedAt: new Date(),
        });
        billCounter += 1;
        txnCounter += 1;
      }
    }

    const createdBills = await FeeBill.insertMany(billsToCreate);
    // Link transactions to actual feeBill ids
    for (let i = 0; i < txnsToCreate.length; i += 1) {
      txnsToCreate[i].feeBill = createdBills[i]._id;
    }
    await Transaction.insertMany(txnsToCreate);
  }
}

async function run() {
  await connectDB();
  await resetCollections();
  const roles = await seedRoles();
  await createDefaultAdmin(roles.superAdmin);
  await seedData({ roles });
  // eslint-disable-next-line no-console
  console.log('Seeded data successfully');
  // eslint-disable-next-line no-console
  console.log('Default super admin:', config.defaultAdminEmail, config.defaultAdminPassword);
  // eslint-disable-next-line no-console
  console.log('School admin password: Admin@123, viewer password: Viewer@123');
  await mongoose.connection.close();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
