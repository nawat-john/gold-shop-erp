-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_branch_id_created_at_idx" ON "audit_logs"("branch_id", "created_at");
