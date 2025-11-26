const Student = require('../models/student');
const { maskObject } = require('../utils/permissions');
const { getPagination } = require('../utils/pagination');

async function listStudents(req, res) {
  const { className, section, status, search, schoolId } = req.query;
  const filter = { ...(req.schoolScope || {}), ...(req.scopeFilter?.students || {}) };
  if (className) filter.className = className;
  if (section) filter.section = section;
  if (status) filter.status = status;
  if (schoolId) filter.school = schoolId;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { studentCode: new RegExp(search, 'i') },
    ];
  }

  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
  ]);
  const allowedFields = req.allowedFields?.students || ['*'];
  const masked = data.map((item) => maskObject(item, allowedFields));
  res.json({ data: masked, page, limit, total });
}

async function getStudent(req, res) {
  const filter = { _id: req.params.id, ...(req.schoolScope || {}), ...(req.scopeFilter?.students || {}) };
  const student = await Student.findOne(filter).lean();
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const allowedFields = req.allowedFields?.students || ['*'];
  return res.json(maskObject(student, allowedFields));
}

module.exports = {
  listStudents,
  getStudent,
};
