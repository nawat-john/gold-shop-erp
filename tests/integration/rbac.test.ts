// Integration tests:
// 1) Authorization matrix — ทุก system role × ทุก permission ต้องตรง catalog เป๊ะ (deny-by-default)
// 2) Branch scoping — สิทธิ์สาขา A ใช้กับสาขา B ไม่ได้
// 3) Step-up approval (maker-checker)
// 4) audit_logs append-only trigger
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ALL_PERMISSION_CODES, SYSTEM_ROLES } from "@/server/auth/permissions";
import {
  ForbiddenError,
  hasPermission,
  requirePermission,
} from "@/server/services/rbac.service";
import { seedRbac } from "@/server/services/rbac-seed";
import {
  requireApproval,
  setApprovalPin,
} from "@/server/services/approval.service";
import { writeAuditLog } from "@/server/services/audit.service";
import { hashPassword } from "@/server/security/password";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";

let db: TestDb;
let branchA: string;
let branchB: string;
/** userId ของแต่ละ role (ทุกคน assign ที่ branch A เท่านั้น) */
const roleUsers = new Map<string, string>();

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  const a = await db.prisma.branch.create({
    data: { code: "BKKA", name: "สาขา A" },
  });
  const b = await db.prisma.branch.create({
    data: { code: "BKKB", name: "สาขา B" },
  });
  branchA = a.id;
  branchB = b.id;

  const pinHash = await hashPassword("308417");
  for (const roleCode of Object.keys(SYSTEM_ROLES)) {
    const role = await db.prisma.role.findUniqueOrThrow({
      where: { code: roleCode },
    });
    const user = await db.prisma.user.create({
      data: {
        username: `matrix-${roleCode.toLowerCase()}`,
        passwordHash: "$argon2id$dummy",
        displayName: `ทดสอบ ${roleCode}`,
        approvalPinHash: pinHash,
        userBranchRoles: {
          create: { branchId: branchA, roleId: role.id },
        },
      },
    });
    roleUsers.set(roleCode, user.id);
  }
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("authorization matrix — ทุก role × ทุก permission", () => {
  for (const [roleCode, def] of Object.entries(SYSTEM_ROLES)) {
    it(`${roleCode} ได้สิทธิ์ตรงตาม catalog เป๊ะ`, async () => {
      const userId = roleUsers.get(roleCode)!;
      const expected = new Set<string>(def.permissions);

      for (const permission of ALL_PERMISSION_CODES) {
        const actual = await hasPermission(
          db.prisma,
          userId,
          permission,
          branchA,
        );
        expect(
          actual,
          `${roleCode} × ${permission}: expected ${expected.has(permission)}`,
        ).toBe(expected.has(permission));
      }
    });
  }

  it("user ที่ไม่มี role เลย → ไม่มีสิทธิ์อะไรเลย (deny-by-default)", async () => {
    const nobody = await db.prisma.user.create({
      data: {
        username: "matrix-norole",
        passwordHash: "$argon2id$dummy",
        displayName: "ไม่มีบทบาท",
      },
    });
    for (const permission of ALL_PERMISSION_CODES) {
      expect(await hasPermission(db.prisma, nobody.id, permission)).toBe(false);
    }
  });

  it("requirePermission โยน ForbiddenError เมื่อไม่มีสิทธิ์", async () => {
    const cashier = roleUsers.get("CASHIER")!;
    await expect(
      requirePermission(db.prisma, cashier, "user.manage", branchA),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("branch scoping", () => {
  it("OWNER ของสาขา A ไม่มีสิทธิ์ในสาขา B", async () => {
    const owner = roleUsers.get("OWNER")!;
    expect(await hasPermission(db.prisma, owner, "user.manage", branchA)).toBe(
      true,
    );
    expect(await hasPermission(db.prisma, owner, "user.manage", branchB)).toBe(
      false,
    );
  });

  it("ไม่ระบุ branch = ตรวจแบบองค์กร (มีสิทธิ์ในสาขาใดสาขาหนึ่งก็ผ่าน)", async () => {
    const owner = roleUsers.get("OWNER")!;
    expect(await hasPermission(db.prisma, owner, "user.manage")).toBe(true);
  });

  it("สาขาถูกปิดใช้งาน → สิทธิ์ของสาขานั้นหายทันที", async () => {
    const admin = roleUsers.get("ADMIN")!;
    await db.prisma.branch.update({
      where: { id: branchA },
      data: { isActive: false },
    });
    expect(await hasPermission(db.prisma, admin, "user.manage", branchA)).toBe(
      false,
    );
    await db.prisma.branch.update({
      where: { id: branchA },
      data: { isActive: true },
    });
  });
});

describe("step-up approval (maker-checker)", () => {
  const actor = () => roleUsers.get("CASHIER")!;

  it("PIN ถูก + มี permission → granted พร้อม audit", async () => {
    const result = await requireApproval(db.prisma, {
      approverUsername: "matrix-admin",
      pin: "308417",
      permission: "user.manage",
      branchId: branchA,
      actorId: actor(),
      action: "test.approve_something",
    });
    expect(result).toEqual({
      ok: true,
      approverId: roleUsers.get("ADMIN"),
    });

    const audit = await db.prisma.auditLog.findFirst({
      where: { action: "approval.granted" },
      orderBy: { id: "desc" },
    });
    expect(audit).not.toBeNull();
  });

  it("PIN ผิด → denied", async () => {
    const result = await requireApproval(db.prisma, {
      approverUsername: "matrix-admin",
      pin: "999999",
      permission: "user.manage",
      branchId: branchA,
      actorId: actor(),
      action: "test.approve_something",
    });
    expect(result).toEqual({ ok: false, reason: "wrong_pin" });
  });

  it("ผู้อนุมัติไม่มี permission → denied", async () => {
    const result = await requireApproval(db.prisma, {
      approverUsername: "matrix-cashier",
      pin: "308417",
      permission: "user.manage",
      branchId: branchA,
      actorId: roleUsers.get("ADMIN")!,
      action: "test.approve_something",
    });
    expect(result).toEqual({ ok: false, reason: "no_permission" });
  });

  it("segregation of duties: อนุมัติรายการตัวเองไม่ได้เมื่อบังคับคนละคน", async () => {
    const result = await requireApproval(db.prisma, {
      approverUsername: "matrix-admin",
      pin: "308417",
      permission: "user.manage",
      branchId: branchA,
      actorId: roleUsers.get("ADMIN")!,
      action: "test.approve_own_work",
      requireDifferentApprover: true,
    });
    expect(result).toEqual({ ok: false, reason: "same_as_actor" });
  });

  it("setApprovalPin ปฏิเสธ PIN เดาง่าย", async () => {
    const result = await setApprovalPin(db.prisma, {
      userId: actor(),
      pin: "123456",
      actorId: actor(),
    });
    expect(result.ok).toBe(false);
  });
});

describe("audit_logs append-only (DB trigger)", () => {
  it("เขียน log ได้ แต่ UPDATE/DELETE ถูกปฏิเสธที่ระดับ DB", async () => {
    await writeAuditLog(db.prisma, {
      action: "test.audit_immutable",
      entityType: "test",
    });
    const log = await db.prisma.auditLog.findFirstOrThrow({
      where: { action: "test.audit_immutable" },
    });

    await expect(
      db.prisma.auditLog.update({
        where: { id: log.id },
        data: { action: "tampered!" },
      }),
    ).rejects.toThrow(/append-only/);

    await expect(
      db.prisma.auditLog.delete({ where: { id: log.id } }),
    ).rejects.toThrow(/append-only/);

    // raw SQL ตรง ๆ ก็ต้องโดนปฏิเสธเช่นกัน
    await expect(
      db.prisma.$executeRawUnsafe(
        `DELETE FROM audit_logs WHERE id = ${log.id}`,
      ),
    ).rejects.toThrow(/append-only/);
  });
});
