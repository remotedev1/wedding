import { db } from "@/lib/db";

export const paymentRepository = {
  findById(id) {
    return db.payment.findUnique({ where: { id }, include: { allocations: true } });
  },
  findByOrderId(orderId) {
    return db.payment.findUnique({ where: { orderId }, include: { allocations: true } });
  },
  create(data) {
    return db.payment.create({ data });
  },
  update(id, data) {
    return db.payment.update({ where: { id }, data });
  },
  updateWhere(where, data) {
    return db.payment.updateMany({ where, data });
  },
  delete(id) {
    return db.payment.delete({ where: { id } });
  },
  createAllocation(data) {
    return db.paymentAllocation.create({ data });
  },
};
