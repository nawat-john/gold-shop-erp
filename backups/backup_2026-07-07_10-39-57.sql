--
-- PostgreSQL database dump
--

\restrict 0bUQYevuKUjyxPfL7z3XkjLBuBHYPpyDn4gzlmgguvi04dIxh47Amj6rLVgwaAn

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.work_orders DROP CONSTRAINT IF EXISTS work_orders_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_orders DROP CONSTRAINT IF EXISTS work_orders_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_order_events DROP CONSTRAINT IF EXISTS work_order_events_work_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_branch_roles DROP CONSTRAINT IF EXISTS user_branch_roles_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_branch_roles DROP CONSTRAINT IF EXISTS user_branch_roles_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_branch_roles DROP CONSTRAINT IF EXISTS user_branch_roles_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trade_ins DROP CONSTRAINT IF EXISTS trade_ins_sales_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trade_ins DROP CONSTRAINT IF EXISTS trade_ins_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tax_invoices DROP CONSTRAINT IF EXISTS tax_invoices_sales_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.storage_locations DROP CONSTRAINT IF EXISTS storage_locations_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_counts DROP CONSTRAINT IF EXISTS stock_counts_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_count_items DROP CONSTRAINT IF EXISTS stock_count_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_count_items DROP CONSTRAINT IF EXISTS stock_count_items_count_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shop_price_announcements DROP CONSTRAINT IF EXISTS shop_price_announcements_based_on_feed_id_fkey;
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS shifts_drawer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.savings_transactions DROP CONSTRAINT IF EXISTS savings_transactions_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.savings_accounts DROP CONSTRAINT IF EXISTS savings_accounts_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.savings_accounts DROP CONSTRAINT IF EXISTS savings_accounts_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_shift_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recovery_codes DROP CONSTRAINT IF EXISTS recovery_codes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_shift_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_labels DROP CONSTRAINT IF EXISTS product_labels_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_trade_in_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_sales_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_purchase_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pawn_interest_payments DROP CONSTRAINT IF EXISTS pawn_interest_payments_contract_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pawn_events DROP CONSTRAINT IF EXISTS pawn_events_contract_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pawn_contracts DROP CONSTRAINT IF EXISTS pawn_contracts_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pawn_contracts DROP CONSTRAINT IF EXISTS pawn_contracts_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pawn_contracts DROP CONSTRAINT IF EXISTS pawn_contracts_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.melt_lots DROP CONSTRAINT IF EXISTS melt_lots_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.melt_lot_items DROP CONSTRAINT IF EXISTS melt_lot_items_lot_id_fkey;
ALTER TABLE IF EXISTS ONLY public.melt_lot_items DROP CONSTRAINT IF EXISTS melt_lot_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_period_id_fkey;
ALTER TABLE IF EXISTS ONLY public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_journal_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.commissions DROP CONSTRAINT IF EXISTS commissions_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.commissions DROP CONSTRAINT IF EXISTS commissions_sales_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.commissions DROP CONSTRAINT IF EXISTS commissions_period_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_transfers DROP CONSTRAINT IF EXISTS cash_transfers_to_drawer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_transfers DROP CONSTRAINT IF EXISTS cash_transfers_to_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_transfers DROP CONSTRAINT IF EXISTS cash_transfers_from_drawer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_transfers DROP CONSTRAINT IF EXISTS cash_transfers_from_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.cash_drawers DROP CONSTRAINT IF EXISTS cash_drawers_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branch_transfers DROP CONSTRAINT IF EXISTS branch_transfers_to_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branch_transfers DROP CONSTRAINT IF EXISTS branch_transfers_from_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branch_transfer_items DROP CONSTRAINT IF EXISTS branch_transfer_items_transfer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.branch_transfer_items DROP CONSTRAINT IF EXISTS branch_transfer_items_item_id_fkey;
ALTER TABLE IF EXISTS ONLY public.amlo_alerts DROP CONSTRAINT IF EXISTS amlo_alerts_customer_id_fkey;
DROP TRIGGER IF EXISTS work_order_events_no_truncate ON public.work_order_events;
DROP TRIGGER IF EXISTS work_order_events_append_only ON public.work_order_events;
DROP TRIGGER IF EXISTS stock_movements_no_truncate ON public.stock_movements;
DROP TRIGGER IF EXISTS stock_movements_append_only ON public.stock_movements;
DROP TRIGGER IF EXISTS savings_transactions_no_truncate ON public.savings_transactions;
DROP TRIGGER IF EXISTS savings_transactions_append_only ON public.savings_transactions;
DROP TRIGGER IF EXISTS pawn_events_no_truncate ON public.pawn_events;
DROP TRIGGER IF EXISTS pawn_events_append_only ON public.pawn_events;
DROP TRIGGER IF EXISTS journal_lines_no_truncate ON public.journal_lines;
DROP TRIGGER IF EXISTS journal_lines_balanced ON public.journal_lines;
DROP TRIGGER IF EXISTS journal_lines_append_only ON public.journal_lines;
DROP TRIGGER IF EXISTS audit_logs_no_truncate ON public.audit_logs;
DROP TRIGGER IF EXISTS audit_logs_append_only ON public.audit_logs;
DROP INDEX IF EXISTS public.work_orders_doc_no_key;
DROP INDEX IF EXISTS public.work_orders_branch_id_status_idx;
DROP INDEX IF EXISTS public.work_order_events_work_order_id_created_at_idx;
DROP INDEX IF EXISTS public.users_username_key;
DROP INDEX IF EXISTS public.trade_ins_sales_order_id_key;
DROP INDEX IF EXISTS public.trade_ins_purchase_order_id_key;
DROP INDEX IF EXISTS public.trade_ins_doc_no_key;
DROP INDEX IF EXISTS public.tax_invoices_doc_no_key;
DROP INDEX IF EXISTS public.suppliers_code_key;
DROP INDEX IF EXISTS public.storage_locations_branch_id_code_key;
DROP INDEX IF EXISTS public.stock_movements_ref_type_ref_id_idx;
DROP INDEX IF EXISTS public.stock_movements_item_id_idx;
DROP INDEX IF EXISTS public.stock_movements_branch_id_product_id_created_at_idx;
DROP INDEX IF EXISTS public.stock_counts_doc_no_key;
DROP INDEX IF EXISTS public.stock_counts_branch_id_status_idx;
DROP INDEX IF EXISTS public.shop_price_announcements_announced_at_idx;
DROP INDEX IF EXISTS public.sessions_user_id_idx;
DROP INDEX IF EXISTS public.sessions_token_hash_key;
DROP INDEX IF EXISTS public.savings_transactions_account_id_created_at_idx;
DROP INDEX IF EXISTS public.savings_accounts_doc_no_key;
DROP INDEX IF EXISTS public.savings_accounts_branch_id_status_idx;
DROP INDEX IF EXISTS public.sales_orders_idempotency_key_key;
DROP INDEX IF EXISTS public.sales_orders_doc_no_key;
DROP INDEX IF EXISTS public.roles_code_key;
DROP INDEX IF EXISTS public.recovery_codes_user_id_idx;
DROP INDEX IF EXISTS public.purchase_orders_idempotency_key_key;
DROP INDEX IF EXISTS public.purchase_orders_doc_no_key;
DROP INDEX IF EXISTS public.products_sku_key;
DROP INDEX IF EXISTS public.products_category_id_idx;
DROP INDEX IF EXISTS public.product_labels_item_id_idx;
DROP INDEX IF EXISTS public.product_categories_code_key;
DROP INDEX IF EXISTS public.permissions_code_key;
DROP INDEX IF EXISTS public.pawn_interest_payments_contract_id_paid_at_idx;
DROP INDEX IF EXISTS public.pawn_events_contract_id_created_at_idx;
DROP INDEX IF EXISTS public.pawn_contracts_status_due_date_idx;
DROP INDEX IF EXISTS public.pawn_contracts_doc_no_key;
DROP INDEX IF EXISTS public.pawn_contracts_branch_id_status_idx;
DROP INDEX IF EXISTS public.melt_lots_doc_no_key;
DROP INDEX IF EXISTS public.melt_lots_branch_id_status_idx;
DROP INDEX IF EXISTS public.journal_lines_entry_id_idx;
DROP INDEX IF EXISTS public.journal_lines_account_id_idx;
DROP INDEX IF EXISTS public.journal_entries_ref_type_ref_id_key;
DROP INDEX IF EXISTS public.journal_entries_period_id_idx;
DROP INDEX IF EXISTS public.journal_entries_entry_no_key;
DROP INDEX IF EXISTS public.journal_entries_entry_date_idx;
DROP INDEX IF EXISTS public.journal_entries_branch_id_idx;
DROP INDEX IF EXISTS public.inventory_items_serial_no_key;
DROP INDEX IF EXISTS public.inventory_items_product_id_idx;
DROP INDEX IF EXISTS public.inventory_items_branch_id_status_idx;
DROP INDEX IF EXISTS public.gold_price_feeds_source_announced_at_key;
DROP INDEX IF EXISTS public.gold_price_feeds_announced_at_idx;
DROP INDEX IF EXISTS public.expenses_journal_entry_id_key;
DROP INDEX IF EXISTS public.expenses_doc_no_key;
DROP INDEX IF EXISTS public.expenses_branch_id_expense_date_idx;
DROP INDEX IF EXISTS public.customers_code_key;
DROP INDEX IF EXISTS public.customers_citizen_id_hash_key;
DROP INDEX IF EXISTS public.commissions_staff_id_created_at_idx;
DROP INDEX IF EXISTS public.commissions_sales_order_id_key;
DROP INDEX IF EXISTS public.cash_transfers_to_branch_id_status_idx;
DROP INDEX IF EXISTS public.cash_transfers_from_branch_id_status_idx;
DROP INDEX IF EXISTS public.cash_transfers_doc_no_key;
DROP INDEX IF EXISTS public.cash_drawers_branch_id_code_key;
DROP INDEX IF EXISTS public.branches_code_key;
DROP INDEX IF EXISTS public.branch_transfers_to_branch_id_status_idx;
DROP INDEX IF EXISTS public.branch_transfers_from_branch_id_status_idx;
DROP INDEX IF EXISTS public.branch_transfers_doc_no_key;
DROP INDEX IF EXISTS public.audit_logs_entity_type_entity_id_idx;
DROP INDEX IF EXISTS public.audit_logs_branch_id_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_actor_id_created_at_idx;
DROP INDEX IF EXISTS public.audit_logs_action_created_at_idx;
DROP INDEX IF EXISTS public.amlo_watchlist_entries_citizen_id_hash_key;
DROP INDEX IF EXISTS public.amlo_alerts_status_idx;
DROP INDEX IF EXISTS public.amlo_alerts_ref_type_ref_id_idx;
DROP INDEX IF EXISTS public.accounts_code_key;
DROP INDEX IF EXISTS public.accounting_periods_year_month_key;
ALTER TABLE IF EXISTS ONLY public.work_orders DROP CONSTRAINT IF EXISTS work_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.work_order_events DROP CONSTRAINT IF EXISTS work_order_events_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_branch_roles DROP CONSTRAINT IF EXISTS user_branch_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.trade_ins DROP CONSTRAINT IF EXISTS trade_ins_pkey;
ALTER TABLE IF EXISTS ONLY public.tax_invoices DROP CONSTRAINT IF EXISTS tax_invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.suppliers DROP CONSTRAINT IF EXISTS suppliers_pkey;
ALTER TABLE IF EXISTS ONLY public.storage_locations DROP CONSTRAINT IF EXISTS storage_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_movements DROP CONSTRAINT IF EXISTS stock_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_counts DROP CONSTRAINT IF EXISTS stock_counts_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_count_items DROP CONSTRAINT IF EXISTS stock_count_items_pkey;
ALTER TABLE IF EXISTS ONLY public.shop_price_announcements DROP CONSTRAINT IF EXISTS shop_price_announcements_pkey;
ALTER TABLE IF EXISTS ONLY public.shifts DROP CONSTRAINT IF EXISTS shifts_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.savings_transactions DROP CONSTRAINT IF EXISTS savings_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.savings_accounts DROP CONSTRAINT IF EXISTS savings_accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_orders DROP CONSTRAINT IF EXISTS sales_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_order_items DROP CONSTRAINT IF EXISTS sales_order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.role_permissions DROP CONSTRAINT IF EXISTS role_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.recovery_codes DROP CONSTRAINT IF EXISTS recovery_codes_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_pkey;
ALTER TABLE IF EXISTS ONLY public.purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_labels DROP CONSTRAINT IF EXISTS product_labels_pkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.payments DROP CONSTRAINT IF EXISTS payments_pkey;
ALTER TABLE IF EXISTS ONLY public.pawn_interest_payments DROP CONSTRAINT IF EXISTS pawn_interest_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.pawn_events DROP CONSTRAINT IF EXISTS pawn_events_pkey;
ALTER TABLE IF EXISTS ONLY public.pawn_contracts DROP CONSTRAINT IF EXISTS pawn_contracts_pkey;
ALTER TABLE IF EXISTS ONLY public.melt_lots DROP CONSTRAINT IF EXISTS melt_lots_pkey;
ALTER TABLE IF EXISTS ONLY public.melt_lot_items DROP CONSTRAINT IF EXISTS melt_lot_items_pkey;
ALTER TABLE IF EXISTS ONLY public.journal_lines DROP CONSTRAINT IF EXISTS journal_lines_pkey;
ALTER TABLE IF EXISTS ONLY public.journal_entries DROP CONSTRAINT IF EXISTS journal_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.inventory_items DROP CONSTRAINT IF EXISTS inventory_items_pkey;
ALTER TABLE IF EXISTS ONLY public.gold_price_feeds DROP CONSTRAINT IF EXISTS gold_price_feeds_pkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.document_sequences DROP CONSTRAINT IF EXISTS document_sequences_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.commissions DROP CONSTRAINT IF EXISTS commissions_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_transfers DROP CONSTRAINT IF EXISTS cash_transfers_pkey;
ALTER TABLE IF EXISTS ONLY public.cash_drawers DROP CONSTRAINT IF EXISTS cash_drawers_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS ONLY public.branch_transfers DROP CONSTRAINT IF EXISTS branch_transfers_pkey;
ALTER TABLE IF EXISTS ONLY public.branch_transfer_items DROP CONSTRAINT IF EXISTS branch_transfer_items_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.amlo_watchlist_entries DROP CONSTRAINT IF EXISTS amlo_watchlist_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.amlo_alerts DROP CONSTRAINT IF EXISTS amlo_alerts_pkey;
ALTER TABLE IF EXISTS ONLY public.accounts DROP CONSTRAINT IF EXISTS accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.accounting_periods DROP CONSTRAINT IF EXISTS accounting_periods_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS public.work_order_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.stock_movements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.savings_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pawn_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.journal_lines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.work_orders;
DROP SEQUENCE IF EXISTS public.work_order_events_id_seq;
DROP TABLE IF EXISTS public.work_order_events;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_branch_roles;
DROP TABLE IF EXISTS public.trade_ins;
DROP TABLE IF EXISTS public.tax_invoices;
DROP TABLE IF EXISTS public.suppliers;
DROP TABLE IF EXISTS public.storage_locations;
DROP SEQUENCE IF EXISTS public.stock_movements_id_seq;
DROP TABLE IF EXISTS public.stock_movements;
DROP TABLE IF EXISTS public.stock_counts;
DROP TABLE IF EXISTS public.stock_count_items;
DROP TABLE IF EXISTS public.shop_price_announcements;
DROP TABLE IF EXISTS public.shifts;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.savings_transactions_id_seq;
DROP TABLE IF EXISTS public.savings_transactions;
DROP TABLE IF EXISTS public.savings_accounts;
DROP TABLE IF EXISTS public.sales_orders;
DROP TABLE IF EXISTS public.sales_order_items;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.recovery_codes;
DROP TABLE IF EXISTS public.purchase_orders;
DROP TABLE IF EXISTS public.purchase_order_items;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.product_labels;
DROP TABLE IF EXISTS public.product_categories;
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.payments;
DROP TABLE IF EXISTS public.pawn_interest_payments;
DROP SEQUENCE IF EXISTS public.pawn_events_id_seq;
DROP TABLE IF EXISTS public.pawn_events;
DROP TABLE IF EXISTS public.pawn_contracts;
DROP TABLE IF EXISTS public.melt_lots;
DROP TABLE IF EXISTS public.melt_lot_items;
DROP SEQUENCE IF EXISTS public.journal_lines_id_seq;
DROP TABLE IF EXISTS public.journal_lines;
DROP TABLE IF EXISTS public.journal_entries;
DROP TABLE IF EXISTS public.inventory_items;
DROP TABLE IF EXISTS public.gold_price_feeds;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.document_sequences;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.commissions;
DROP TABLE IF EXISTS public.cash_transfers;
DROP TABLE IF EXISTS public.cash_drawers;
DROP TABLE IF EXISTS public.branches;
DROP TABLE IF EXISTS public.branch_transfers;
DROP TABLE IF EXISTS public.branch_transfer_items;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.amlo_watchlist_entries;
DROP TABLE IF EXISTS public.amlo_alerts;
DROP TABLE IF EXISTS public.accounts;
DROP TABLE IF EXISTS public.accounting_periods;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP FUNCTION IF EXISTS public.forbid_work_order_event_truncate();
DROP FUNCTION IF EXISTS public.forbid_work_order_event_mutation();
DROP FUNCTION IF EXISTS public.forbid_stock_movement_truncate();
DROP FUNCTION IF EXISTS public.forbid_stock_movement_mutation();
DROP FUNCTION IF EXISTS public.forbid_savings_tx_truncate();
DROP FUNCTION IF EXISTS public.forbid_savings_tx_mutation();
DROP FUNCTION IF EXISTS public.forbid_pawn_event_truncate();
DROP FUNCTION IF EXISTS public.forbid_pawn_event_mutation();
DROP FUNCTION IF EXISTS public.forbid_journal_line_truncate();
DROP FUNCTION IF EXISTS public.forbid_journal_line_mutation();
DROP FUNCTION IF EXISTS public.forbid_audit_log_truncate();
DROP FUNCTION IF EXISTS public.forbid_audit_log_mutation();
DROP FUNCTION IF EXISTS public.check_journal_entry_balanced();
DROP TYPE IF EXISTS public."WorkOrderType";
DROP TYPE IF EXISTS public."WorkOrderStatus";
DROP TYPE IF EXISTS public."WorkOrderEventType";
DROP TYPE IF EXISTS public."TransferStatus";
DROP TYPE IF EXISTS public."StorageKind";
DROP TYPE IF EXISTS public."StockMovementType";
DROP TYPE IF EXISTS public."StockCountStatus";
DROP TYPE IF EXISTS public."ShiftStatus";
DROP TYPE IF EXISTS public."SavingsTxType";
DROP TYPE IF EXISTS public."SavingsAccountType";
DROP TYPE IF EXISTS public."SavingsAccountStatus";
DROP TYPE IF EXISTS public."SalesOrderStatus";
DROP TYPE IF EXISTS public."PurchaseOrderStatus";
DROP TYPE IF EXISTS public."ProductTracking";
DROP TYPE IF EXISTS public."PaymentMethod";
DROP TYPE IF EXISTS public."PawnEventType";
DROP TYPE IF EXISTS public."PawnContractStatus";
DROP TYPE IF EXISTS public."MeltLotStatus";
DROP TYPE IF EXISTS public."ItemStatus";
DROP TYPE IF EXISTS public."CustomerTier";
DROP TYPE IF EXISTS public."AmloRefType";
DROP TYPE IF EXISTS public."AmloAlertStatus";
DROP TYPE IF EXISTS public."AcquisitionSource";
DROP TYPE IF EXISTS public."AccountingPeriodStatus";
DROP TYPE IF EXISTS public."AccountType";
--
-- Name: AccountType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."AccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);


ALTER TYPE public."AccountType" OWNER TO gold;

--
-- Name: AccountingPeriodStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."AccountingPeriodStatus" AS ENUM (
    'OPEN',
    'LOCKED'
);


ALTER TYPE public."AccountingPeriodStatus" OWNER TO gold;

--
-- Name: AcquisitionSource; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."AcquisitionSource" AS ENUM (
    'SUPPLIER',
    'BUYBACK',
    'PAWN_FORFEIT'
);


ALTER TYPE public."AcquisitionSource" OWNER TO gold;

--
-- Name: AmloAlertStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."AmloAlertStatus" AS ENUM (
    'PENDING',
    'REVIEWED',
    'REPORTED'
);


ALTER TYPE public."AmloAlertStatus" OWNER TO gold;

--
-- Name: AmloRefType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."AmloRefType" AS ENUM (
    'SALES_ORDER',
    'PURCHASE_ORDER',
    'PAWN_CONTRACT'
);


ALTER TYPE public."AmloRefType" OWNER TO gold;

--
-- Name: CustomerTier; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."CustomerTier" AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD'
);


ALTER TYPE public."CustomerTier" OWNER TO gold;

--
-- Name: ItemStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."ItemStatus" AS ENUM (
    'IN_STOCK',
    'RESERVED',
    'SOLD',
    'PAWNED_COLLATERAL',
    'IN_TRANSIT',
    'MELTED',
    'MISSING'
);


ALTER TYPE public."ItemStatus" OWNER TO gold;

--
-- Name: MeltLotStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."MeltLotStatus" AS ENUM (
    'OPEN',
    'SENT',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public."MeltLotStatus" OWNER TO gold;

--
-- Name: PawnContractStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."PawnContractStatus" AS ENUM (
    'ACTIVE',
    'REDEEMED',
    'FORFEITED',
    'CANCELLED'
);


ALTER TYPE public."PawnContractStatus" OWNER TO gold;

--
-- Name: PawnEventType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."PawnEventType" AS ENUM (
    'OPEN',
    'RENEW_INTEREST',
    'REDEEM',
    'FORFEIT',
    'PRINCIPAL_INCREASE',
    'PRINCIPAL_DECREASE',
    'CANCEL'
);


ALTER TYPE public."PawnEventType" OWNER TO gold;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'TRANSFER',
    'CREDIT_CARD'
);


ALTER TYPE public."PaymentMethod" OWNER TO gold;

--
-- Name: ProductTracking; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."ProductTracking" AS ENUM (
    'SERIALIZED',
    'COUNTED'
);


ALTER TYPE public."ProductTracking" OWNER TO gold;

--
-- Name: PurchaseOrderStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."PurchaseOrderStatus" AS ENUM (
    'COMPLETED',
    'VOIDED'
);


ALTER TYPE public."PurchaseOrderStatus" OWNER TO gold;

--
-- Name: SalesOrderStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."SalesOrderStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'VOIDED'
);


ALTER TYPE public."SalesOrderStatus" OWNER TO gold;

--
-- Name: SavingsAccountStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."SavingsAccountStatus" AS ENUM (
    'ACTIVE',
    'CLOSED_GOLD',
    'CLOSED_CASH',
    'CLOSED_DEFAULTED'
);


ALTER TYPE public."SavingsAccountStatus" OWNER TO gold;

--
-- Name: SavingsAccountType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."SavingsAccountType" AS ENUM (
    'CASH_SAVINGS',
    'WEIGHT_SAVINGS'
);


ALTER TYPE public."SavingsAccountType" OWNER TO gold;

--
-- Name: SavingsTxType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."SavingsTxType" AS ENUM (
    'OPEN',
    'DEPOSIT',
    'CLOSE_GOLD',
    'CLOSE_CASH',
    'CLOSE_DEFAULTED'
);


ALTER TYPE public."SavingsTxType" OWNER TO gold;

--
-- Name: ShiftStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."ShiftStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'RECONCILED'
);


ALTER TYPE public."ShiftStatus" OWNER TO gold;

--
-- Name: StockCountStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."StockCountStatus" AS ENUM (
    'OPEN',
    'REVIEW',
    'APPROVED',
    'CANCELLED'
);


ALTER TYPE public."StockCountStatus" OWNER TO gold;

--
-- Name: StockMovementType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."StockMovementType" AS ENUM (
    'RECEIVE_SUPPLIER',
    'BUYBACK_IN',
    'PAWN_FORFEIT_IN',
    'SALE_OUT',
    'TRANSFER_OUT',
    'TRANSFER_IN',
    'MELT_OUT',
    'COUNT_ADJUST_IN',
    'COUNT_ADJUST_OUT',
    'MANUAL_ADJUST_IN',
    'MANUAL_ADJUST_OUT'
);


ALTER TYPE public."StockMovementType" OWNER TO gold;

--
-- Name: StorageKind; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."StorageKind" AS ENUM (
    'SHOWCASE',
    'TRAY',
    'SAFE',
    'OTHER'
);


ALTER TYPE public."StorageKind" OWNER TO gold;

--
-- Name: TransferStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."TransferStatus" AS ENUM (
    'DRAFT',
    'IN_TRANSIT',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."TransferStatus" OWNER TO gold;

--
-- Name: WorkOrderEventType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."WorkOrderEventType" AS ENUM (
    'RECEIVE',
    'GOLD_ISSUE',
    'STATUS_CHANGE',
    'COMPLETE',
    'DELIVER',
    'CANCEL'
);


ALTER TYPE public."WorkOrderEventType" OWNER TO gold;

--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."WorkOrderStatus" AS ENUM (
    'RECEIVED',
    'IN_PROGRESS',
    'COMPLETED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."WorkOrderStatus" OWNER TO gold;

--
-- Name: WorkOrderType; Type: TYPE; Schema: public; Owner: gold
--

CREATE TYPE public."WorkOrderType" AS ENUM (
    'CUSTOM_ORDER',
    'REPAIR'
);


ALTER TYPE public."WorkOrderType" OWNER TO gold;

--
-- Name: check_journal_entry_balanced(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.check_journal_entry_balanced() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  total_debit BIGINT;
  total_credit BIGINT;
BEGIN
  SELECT COALESCE(SUM(debit_satang), 0), COALESCE(SUM(credit_satang), 0)
    INTO total_debit, total_credit
    FROM journal_lines
    WHERE entry_id = NEW.entry_id;

  IF total_debit <> total_credit THEN
    RAISE EXCEPTION 'journal entry % is not balanced: debit % <> credit %',
      NEW.entry_id, total_debit, total_credit
      USING ERRCODE = 'raise_exception';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_journal_entry_balanced() OWNER TO gold;

--
-- Name: forbid_audit_log_mutation(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_audit_log_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$;


ALTER FUNCTION public.forbid_audit_log_mutation() OWNER TO gold;

--
-- Name: forbid_audit_log_truncate(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_audit_log_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: TRUNCATE is not allowed';
END;
$$;


ALTER FUNCTION public.forbid_audit_log_truncate() OWNER TO gold;

--
-- Name: forbid_journal_line_mutation(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_journal_line_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'journal_lines is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$;


ALTER FUNCTION public.forbid_journal_line_mutation() OWNER TO gold;

--
-- Name: forbid_journal_line_truncate(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_journal_line_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'journal_lines is append-only: TRUNCATE is not allowed';
END;
$$;


ALTER FUNCTION public.forbid_journal_line_truncate() OWNER TO gold;

--
-- Name: forbid_pawn_event_mutation(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_pawn_event_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'pawn_events is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$;


ALTER FUNCTION public.forbid_pawn_event_mutation() OWNER TO gold;

--
-- Name: forbid_pawn_event_truncate(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_pawn_event_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'pawn_events is append-only: TRUNCATE is not allowed';
END;
$$;


ALTER FUNCTION public.forbid_pawn_event_truncate() OWNER TO gold;

--
-- Name: forbid_savings_tx_mutation(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_savings_tx_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'savings_transactions is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$;


ALTER FUNCTION public.forbid_savings_tx_mutation() OWNER TO gold;

--
-- Name: forbid_savings_tx_truncate(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_savings_tx_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'savings_transactions is append-only: TRUNCATE is not allowed';
END;
$$;


ALTER FUNCTION public.forbid_savings_tx_truncate() OWNER TO gold;

--
-- Name: forbid_stock_movement_mutation(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_stock_movement_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'stock_movements is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$;


ALTER FUNCTION public.forbid_stock_movement_mutation() OWNER TO gold;

--
-- Name: forbid_stock_movement_truncate(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_stock_movement_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'stock_movements is append-only: TRUNCATE is not allowed';
END;
$$;


ALTER FUNCTION public.forbid_stock_movement_truncate() OWNER TO gold;

--
-- Name: forbid_work_order_event_mutation(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_work_order_event_mutation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'work_order_events is append-only: % is not allowed', TG_OP
    USING ERRCODE = 'raise_exception';
END;
$$;


ALTER FUNCTION public.forbid_work_order_event_mutation() OWNER TO gold;

--
-- Name: forbid_work_order_event_truncate(); Type: FUNCTION; Schema: public; Owner: gold
--

CREATE FUNCTION public.forbid_work_order_event_truncate() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  RAISE EXCEPTION 'work_order_events is append-only: TRUNCATE is not allowed';
END;
$$;


ALTER FUNCTION public.forbid_work_order_event_truncate() OWNER TO gold;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO gold;

--
-- Name: accounting_periods; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.accounting_periods (
    id text NOT NULL,
    year_month text NOT NULL,
    status public."AccountingPeriodStatus" DEFAULT 'OPEN'::public."AccountingPeriodStatus" NOT NULL,
    locked_at timestamp(3) without time zone,
    locked_by_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.accounting_periods OWNER TO gold;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.accounts (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type public."AccountType" NOT NULL,
    is_system boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.accounts OWNER TO gold;

--
-- Name: amlo_alerts; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.amlo_alerts (
    id text NOT NULL,
    customer_id text,
    ref_type public."AmloRefType" NOT NULL,
    ref_id text NOT NULL,
    amount_satang bigint NOT NULL,
    watchlist_match boolean DEFAULT false NOT NULL,
    status public."AmloAlertStatus" DEFAULT 'PENDING'::public."AmloAlertStatus" NOT NULL,
    reviewed_by_id text,
    reviewed_at timestamp(3) without time zone,
    reported_at timestamp(3) without time zone,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT amlo_alerts_amount_positive CHECK ((amount_satang > 0))
);


ALTER TABLE public.amlo_alerts OWNER TO gold;

--
-- Name: amlo_watchlist_entries; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.amlo_watchlist_entries (
    id text NOT NULL,
    citizen_id_hash text NOT NULL,
    name text NOT NULL,
    reason text NOT NULL,
    added_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.amlo_watchlist_entries OWNER TO gold;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    request_id text,
    actor_id text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    before jsonb,
    after jsonb,
    branch_id text,
    ip text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO gold;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: gold
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO gold;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gold
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: branch_transfer_items; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.branch_transfer_items (
    transfer_id text NOT NULL,
    item_id text NOT NULL
);


ALTER TABLE public.branch_transfer_items OWNER TO gold;

--
-- Name: branch_transfers; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.branch_transfers (
    id text NOT NULL,
    doc_no text NOT NULL,
    from_branch_id text NOT NULL,
    to_branch_id text NOT NULL,
    status public."TransferStatus" DEFAULT 'DRAFT'::public."TransferStatus" NOT NULL,
    created_by text NOT NULL,
    sent_by text,
    sent_at timestamp(3) without time zone,
    received_by text,
    received_at timestamp(3) without time zone,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    CONSTRAINT branch_transfers_different_branches CHECK ((from_branch_id <> to_branch_id))
);


ALTER TABLE public.branch_transfers OWNER TO gold;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.branches (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.branches OWNER TO gold;

--
-- Name: cash_drawers; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.cash_drawers (
    id text NOT NULL,
    branch_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cash_drawers OWNER TO gold;

--
-- Name: cash_transfers; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.cash_transfers (
    id text NOT NULL,
    doc_no text NOT NULL,
    from_branch_id text NOT NULL,
    to_branch_id text NOT NULL,
    from_drawer_id text,
    to_drawer_id text,
    amount_satang bigint NOT NULL,
    status public."TransferStatus" DEFAULT 'DRAFT'::public."TransferStatus" NOT NULL,
    created_by text NOT NULL,
    sent_by text,
    sent_at timestamp(3) without time zone,
    received_by text,
    received_at timestamp(3) without time zone,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    CONSTRAINT cash_transfers_amount_positive CHECK ((amount_satang > 0)),
    CONSTRAINT cash_transfers_branches_distinct CHECK ((from_branch_id <> to_branch_id))
);


ALTER TABLE public.cash_transfers OWNER TO gold;

--
-- Name: commissions; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.commissions (
    id text NOT NULL,
    staff_id text NOT NULL,
    sales_order_id text NOT NULL,
    period_id text NOT NULL,
    rate_percent numeric(5,2) NOT NULL,
    amount_satang bigint NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT commissions_amount_nonnegative CHECK ((amount_satang >= 0)),
    CONSTRAINT commissions_rate_range CHECK (((rate_percent >= (0)::numeric) AND (rate_percent <= (100)::numeric)))
);


ALTER TABLE public.commissions OWNER TO gold;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.customers (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    note text,
    citizen_id_enc text,
    citizen_id_hash text,
    loyalty_points integer DEFAULT 0 NOT NULL,
    tier public."CustomerTier" DEFAULT 'BRONZE'::public."CustomerTier" NOT NULL,
    consent_given_at timestamp(3) without time zone,
    consent_withdrawn_at timestamp(3) without time zone,
    anonymized_at timestamp(3) without time zone,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO gold;

--
-- Name: document_sequences; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.document_sequences (
    key text NOT NULL,
    next_number bigint DEFAULT 1 NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.document_sequences OWNER TO gold;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.expenses (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    account_id text NOT NULL,
    amount_satang bigint NOT NULL,
    description text NOT NULL,
    expense_date timestamp(3) without time zone NOT NULL,
    journal_entry_id text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT expenses_amount_positive CHECK ((amount_satang > 0))
);


ALTER TABLE public.expenses OWNER TO gold;

--
-- Name: gold_price_feeds; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.gold_price_feeds (
    id text NOT NULL,
    source text NOT NULL,
    announced_at timestamp(3) without time zone NOT NULL,
    fetched_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bar_buy bigint NOT NULL,
    bar_sell bigint NOT NULL,
    ornament_buy bigint NOT NULL,
    ornament_sell bigint NOT NULL,
    raw jsonb
);


ALTER TABLE public.gold_price_feeds OWNER TO gold;

--
-- Name: inventory_items; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.inventory_items (
    id text NOT NULL,
    serial_no text NOT NULL,
    product_id text NOT NULL,
    branch_id text NOT NULL,
    status public."ItemStatus" DEFAULT 'IN_STOCK'::public."ItemStatus" NOT NULL,
    weight_mg bigint NOT NULL,
    gold_purity numeric(5,2) NOT NULL,
    cost_satang bigint NOT NULL,
    labor_charge bigint,
    source public."AcquisitionSource" DEFAULT 'SUPPLIER'::public."AcquisitionSource" NOT NULL,
    supplier_id text,
    location_id text,
    photo_path text,
    received_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    CONSTRAINT inventory_items_cost_nonnegative CHECK ((cost_satang >= 0)),
    CONSTRAINT inventory_items_purity_range CHECK (((gold_purity > (0)::numeric) AND (gold_purity <= (100)::numeric))),
    CONSTRAINT inventory_items_weight_positive CHECK ((weight_mg > 0))
);


ALTER TABLE public.inventory_items OWNER TO gold;

--
-- Name: journal_entries; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.journal_entries (
    id text NOT NULL,
    entry_no text NOT NULL,
    period_id text NOT NULL,
    entry_date timestamp(3) without time zone NOT NULL,
    description text NOT NULL,
    ref_type text,
    ref_id text,
    is_manual boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    branch_id text NOT NULL
);


ALTER TABLE public.journal_entries OWNER TO gold;

--
-- Name: journal_lines; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.journal_lines (
    id bigint NOT NULL,
    entry_id text NOT NULL,
    account_id text NOT NULL,
    debit_satang bigint DEFAULT 0 NOT NULL,
    credit_satang bigint DEFAULT 0 NOT NULL,
    memo text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT journal_lines_credit_nonnegative CHECK ((credit_satang >= 0)),
    CONSTRAINT journal_lines_debit_nonnegative CHECK ((debit_satang >= 0)),
    CONSTRAINT journal_lines_exactly_one_side CHECK ((((debit_satang > 0) AND (credit_satang = 0)) OR ((debit_satang = 0) AND (credit_satang > 0))))
);


ALTER TABLE public.journal_lines OWNER TO gold;

--
-- Name: journal_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: gold
--

CREATE SEQUENCE public.journal_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_lines_id_seq OWNER TO gold;

--
-- Name: journal_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gold
--

ALTER SEQUENCE public.journal_lines_id_seq OWNED BY public.journal_lines.id;


--
-- Name: melt_lot_items; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.melt_lot_items (
    lot_id text NOT NULL,
    item_id text NOT NULL
);


ALTER TABLE public.melt_lot_items OWNER TO gold;

--
-- Name: melt_lots; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.melt_lots (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    status public."MeltLotStatus" DEFAULT 'OPEN'::public."MeltLotStatus" NOT NULL,
    sent_weight_mg bigint,
    returned_weight_mg bigint,
    returned_satang bigint,
    created_by text NOT NULL,
    sent_at timestamp(3) without time zone,
    closed_at timestamp(3) without time zone,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.melt_lots OWNER TO gold;

--
-- Name: pawn_contracts; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.pawn_contracts (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    status public."PawnContractStatus" DEFAULT 'ACTIVE'::public."PawnContractStatus" NOT NULL,
    customer_name text NOT NULL,
    customer_phone text,
    customer_citizen_id_enc text,
    customer_citizen_id_hash text,
    description text NOT NULL,
    weight_mg bigint NOT NULL,
    gold_purity numeric(5,2) NOT NULL,
    photo_path text,
    customer_photo_path text,
    location_id text,
    principal_satang bigint NOT NULL,
    annual_interest_rate_percent numeric(5,2) NOT NULL,
    term_months integer NOT NULL,
    start_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date timestamp(3) without time zone NOT NULL,
    interest_paid_through_date timestamp(3) without time zone NOT NULL,
    redeemed_at timestamp(3) without time zone,
    redeemed_by_id text,
    forfeited_at timestamp(3) without time zone,
    forfeited_by_id text,
    cancelled_at timestamp(3) without time zone,
    cancelled_by_id text,
    cancel_reason text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    customer_id text,
    CONSTRAINT pawn_contracts_due_after_start CHECK ((due_date >= start_date)),
    CONSTRAINT pawn_contracts_interest_rate_range CHECK ((annual_interest_rate_percent >= (0)::numeric)),
    CONSTRAINT pawn_contracts_principal_positive CHECK ((principal_satang > 0)),
    CONSTRAINT pawn_contracts_purity_range CHECK (((gold_purity > (0)::numeric) AND (gold_purity <= (100)::numeric))),
    CONSTRAINT pawn_contracts_term_positive CHECK ((term_months > 0)),
    CONSTRAINT pawn_contracts_weight_positive CHECK ((weight_mg > 0))
);


ALTER TABLE public.pawn_contracts OWNER TO gold;

--
-- Name: pawn_events; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.pawn_events (
    id bigint NOT NULL,
    contract_id text NOT NULL,
    event_type public."PawnEventType" NOT NULL,
    principal_before_satang bigint NOT NULL,
    principal_after_satang bigint NOT NULL,
    interest_amount_satang bigint,
    period_from timestamp(3) without time zone,
    period_to timestamp(3) without time zone,
    actor_id text NOT NULL,
    request_id text,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pawn_events_interest_nonnegative CHECK (((interest_amount_satang IS NULL) OR (interest_amount_satang >= 0))),
    CONSTRAINT pawn_events_principal_after_nonnegative CHECK ((principal_after_satang >= 0)),
    CONSTRAINT pawn_events_principal_before_nonnegative CHECK ((principal_before_satang >= 0))
);


ALTER TABLE public.pawn_events OWNER TO gold;

--
-- Name: pawn_events_id_seq; Type: SEQUENCE; Schema: public; Owner: gold
--

CREATE SEQUENCE public.pawn_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pawn_events_id_seq OWNER TO gold;

--
-- Name: pawn_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gold
--

ALTER SEQUENCE public.pawn_events_id_seq OWNED BY public.pawn_events.id;


--
-- Name: pawn_interest_payments; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.pawn_interest_payments (
    id text NOT NULL,
    contract_id text NOT NULL,
    period_from timestamp(3) without time zone NOT NULL,
    period_to timestamp(3) without time zone NOT NULL,
    interest_amount_satang bigint NOT NULL,
    principal_after_satang bigint NOT NULL,
    paid_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actor_id text NOT NULL,
    request_id text,
    CONSTRAINT pawn_interest_payments_amount_nonnegative CHECK ((interest_amount_satang >= 0)),
    CONSTRAINT pawn_interest_payments_period_valid CHECK ((period_to >= period_from)),
    CONSTRAINT pawn_interest_payments_principal_nonnegative CHECK ((principal_after_satang >= 0))
);


ALTER TABLE public.pawn_interest_payments OWNER TO gold;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.payments (
    id text NOT NULL,
    sales_order_id text,
    purchase_order_id text,
    trade_in_id text,
    payment_method public."PaymentMethod" NOT NULL,
    amount_satang bigint NOT NULL,
    fee_satang bigint DEFAULT 0 NOT NULL,
    reference_no text,
    slip_path text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO gold;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    code text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.permissions OWNER TO gold;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.product_categories (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    default_labor_charge bigint,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_categories OWNER TO gold;

--
-- Name: product_labels; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.product_labels (
    id text NOT NULL,
    item_id text NOT NULL,
    printed_by text NOT NULL,
    printed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reason text
);


ALTER TABLE public.product_labels OWNER TO gold;

--
-- Name: products; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.products (
    id text NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    category_id text NOT NULL,
    tracking public."ProductTracking" NOT NULL,
    gold_purity numeric(5,2) NOT NULL,
    std_weight_mg bigint,
    labor_charge bigint,
    pattern text,
    photo_path text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    CONSTRAINT products_purity_range CHECK (((gold_purity > (0)::numeric) AND (gold_purity <= (100)::numeric))),
    CONSTRAINT products_std_weight_positive CHECK (((std_weight_mg IS NULL) OR (std_weight_mg > 0)))
);


ALTER TABLE public.products OWNER TO gold;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.purchase_order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text,
    item_id text,
    description text NOT NULL,
    weight_mg bigint NOT NULL,
    gold_purity numeric(5,2) NOT NULL,
    unit_price_satang bigint NOT NULL,
    total_amount_satang bigint NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO gold;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.purchase_orders (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    shift_id text NOT NULL,
    price_snapshot jsonb NOT NULL,
    total_amount_satang bigint NOT NULL,
    status public."PurchaseOrderStatus" DEFAULT 'COMPLETED'::public."PurchaseOrderStatus" NOT NULL,
    customer_name text,
    customer_phone text,
    customer_citizen_id text,
    idempotency_key text,
    voided_at timestamp(3) without time zone,
    voided_by_id text,
    void_reason text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    customer_id text
);


ALTER TABLE public.purchase_orders OWNER TO gold;

--
-- Name: recovery_codes; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.recovery_codes (
    id text NOT NULL,
    user_id text NOT NULL,
    code_hash text NOT NULL,
    used_at timestamp(3) without time zone
);


ALTER TABLE public.recovery_codes OWNER TO gold;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.role_permissions (
    role_id text NOT NULL,
    permission_id text NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO gold;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.roles (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    is_system boolean DEFAULT false NOT NULL
);


ALTER TABLE public.roles OWNER TO gold;

--
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.sales_order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    item_id text,
    quantity integer NOT NULL,
    weight_mg bigint NOT NULL,
    gold_purity numeric(5,2) NOT NULL,
    gold_price_satang bigint NOT NULL,
    labor_charge_satang bigint NOT NULL,
    vat_amount_satang bigint NOT NULL,
    total_amount_satang bigint NOT NULL
);


ALTER TABLE public.sales_order_items OWNER TO gold;

--
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.sales_orders (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    shift_id text NOT NULL,
    price_snapshot jsonb NOT NULL,
    total_amount_satang bigint NOT NULL,
    vat_amount_satang bigint NOT NULL,
    status public."SalesOrderStatus" DEFAULT 'COMPLETED'::public."SalesOrderStatus" NOT NULL,
    idempotency_key text,
    voided_at timestamp(3) without time zone,
    voided_by_id text,
    void_reason text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    customer_id text
);


ALTER TABLE public.sales_orders OWNER TO gold;

--
-- Name: savings_accounts; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.savings_accounts (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    customer_id text,
    account_type public."SavingsAccountType" NOT NULL,
    status public."SavingsAccountStatus" DEFAULT 'ACTIVE'::public."SavingsAccountStatus" NOT NULL,
    balance_satang bigint DEFAULT 0 NOT NULL,
    balance_weight_mg bigint DEFAULT 0 NOT NULL,
    target_weight_mg bigint,
    opened_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    closed_by_id text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    CONSTRAINT savings_accounts_balance_satang_nonnegative CHECK ((balance_satang >= 0)),
    CONSTRAINT savings_accounts_balance_weight_nonnegative CHECK ((balance_weight_mg >= 0)),
    CONSTRAINT savings_accounts_target_weight_positive CHECK (((target_weight_mg IS NULL) OR (target_weight_mg > 0)))
);


ALTER TABLE public.savings_accounts OWNER TO gold;

--
-- Name: savings_transactions; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.savings_transactions (
    id bigint NOT NULL,
    account_id text NOT NULL,
    tx_type public."SavingsTxType" NOT NULL,
    amount_satang bigint,
    weight_mg bigint,
    price_snapshot jsonb,
    actor_id text NOT NULL,
    request_id text,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.savings_transactions OWNER TO gold;

--
-- Name: savings_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: gold
--

CREATE SEQUENCE public.savings_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.savings_transactions_id_seq OWNER TO gold;

--
-- Name: savings_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gold
--

ALTER SEQUENCE public.savings_transactions_id_seq OWNED BY public.savings_transactions.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    token_hash text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_seen_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    absolute_expires_at timestamp(3) without time zone NOT NULL,
    revoked_at timestamp(3) without time zone,
    ip text,
    user_agent text
);


ALTER TABLE public.sessions OWNER TO gold;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_by text,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO gold;

--
-- Name: shifts; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.shifts (
    id text NOT NULL,
    branch_id text NOT NULL,
    drawer_id text NOT NULL,
    opened_by_id text NOT NULL,
    opened_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_by_id text,
    closed_at timestamp(3) without time zone,
    start_cash_satang bigint NOT NULL,
    end_cash_satang bigint,
    expected_cash_satang bigint,
    reconciled_at timestamp(3) without time zone,
    reconciled_by_id text,
    status public."ShiftStatus" DEFAULT 'OPEN'::public."ShiftStatus" NOT NULL
);


ALTER TABLE public.shifts OWNER TO gold;

--
-- Name: shop_price_announcements; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.shop_price_announcements (
    id text NOT NULL,
    announced_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bar_buy bigint NOT NULL,
    bar_sell bigint NOT NULL,
    ornament_buy bigint NOT NULL,
    ornament_sell bigint NOT NULL,
    based_on_feed_id text,
    announced_by text NOT NULL,
    note text
);


ALTER TABLE public.shop_price_announcements OWNER TO gold;

--
-- Name: stock_count_items; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.stock_count_items (
    count_id text NOT NULL,
    item_id text NOT NULL,
    expected boolean DEFAULT true NOT NULL,
    found boolean,
    counted_by text,
    counted_at timestamp(3) without time zone
);


ALTER TABLE public.stock_count_items OWNER TO gold;

--
-- Name: stock_counts; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.stock_counts (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    status public."StockCountStatus" DEFAULT 'OPEN'::public."StockCountStatus" NOT NULL,
    created_by text NOT NULL,
    approved_by text,
    started_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stock_counts OWNER TO gold;

--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.stock_movements (
    id bigint NOT NULL,
    movement_type public."StockMovementType" NOT NULL,
    branch_id text NOT NULL,
    product_id text NOT NULL,
    item_id text,
    quantity integer NOT NULL,
    weight_mg bigint NOT NULL,
    cost_satang bigint,
    ref_type text,
    ref_id text,
    actor_id text NOT NULL,
    request_id text,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT stock_movements_quantity_nonzero CHECK ((quantity <> 0)),
    CONSTRAINT stock_movements_weight_sign CHECK ((((quantity > 0) AND (weight_mg > 0)) OR ((quantity < 0) AND (weight_mg < 0))))
);


ALTER TABLE public.stock_movements OWNER TO gold;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: gold
--

CREATE SEQUENCE public.stock_movements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO gold;

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gold
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: storage_locations; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.storage_locations (
    id text NOT NULL,
    branch_id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    kind public."StorageKind" DEFAULT 'SHOWCASE'::public."StorageKind" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.storage_locations OWNER TO gold;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    phone text,
    address text,
    note text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.suppliers OWNER TO gold;

--
-- Name: tax_invoices; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.tax_invoices (
    id text NOT NULL,
    doc_no text NOT NULL,
    sales_order_id text NOT NULL,
    customer_name text NOT NULL,
    customer_address text,
    customer_tax_id text,
    is_full boolean DEFAULT false NOT NULL,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tax_invoices OWNER TO gold;

--
-- Name: trade_ins; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.trade_ins (
    id text NOT NULL,
    doc_no text NOT NULL,
    sales_order_id text NOT NULL,
    purchase_order_id text NOT NULL,
    net_amount_satang bigint NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.trade_ins OWNER TO gold;

--
-- Name: user_branch_roles; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.user_branch_roles (
    user_id text NOT NULL,
    branch_id text NOT NULL,
    role_id text NOT NULL
);


ALTER TABLE public.user_branch_roles OWNER TO gold;

--
-- Name: users; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.users (
    id text NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    email text,
    is_active boolean DEFAULT true NOT NULL,
    must_change_password boolean DEFAULT false NOT NULL,
    failed_login_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp(3) without time zone,
    totp_secret_enc text,
    totp_enabled boolean DEFAULT false NOT NULL,
    approval_pin_hash text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO gold;

--
-- Name: work_order_events; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.work_order_events (
    id bigint NOT NULL,
    work_order_id text NOT NULL,
    event_type public."WorkOrderEventType" NOT NULL,
    note text,
    actor_id text NOT NULL,
    request_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.work_order_events OWNER TO gold;

--
-- Name: work_order_events_id_seq; Type: SEQUENCE; Schema: public; Owner: gold
--

CREATE SEQUENCE public.work_order_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_order_events_id_seq OWNER TO gold;

--
-- Name: work_order_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gold
--

ALTER SEQUENCE public.work_order_events_id_seq OWNED BY public.work_order_events.id;


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: gold
--

CREATE TABLE public.work_orders (
    id text NOT NULL,
    doc_no text NOT NULL,
    branch_id text NOT NULL,
    customer_id text,
    type public."WorkOrderType" NOT NULL,
    status public."WorkOrderStatus" DEFAULT 'RECEIVED'::public."WorkOrderStatus" NOT NULL,
    description text NOT NULL,
    deposit_satang bigint DEFAULT 0 NOT NULL,
    gold_issued_mg bigint DEFAULT 0 NOT NULL,
    tolerance_mg bigint DEFAULT 0 NOT NULL,
    service_fee_satang bigint DEFAULT 0 NOT NULL,
    received_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    promised_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    delivered_at timestamp(3) without time zone,
    cancelled_at timestamp(3) without time zone,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    CONSTRAINT work_orders_deposit_nonnegative CHECK ((deposit_satang >= 0)),
    CONSTRAINT work_orders_gold_issued_nonnegative CHECK ((gold_issued_mg >= 0)),
    CONSTRAINT work_orders_service_fee_nonnegative CHECK ((service_fee_satang >= 0)),
    CONSTRAINT work_orders_tolerance_nonnegative CHECK ((tolerance_mg >= 0))
);


ALTER TABLE public.work_orders OWNER TO gold;

--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: journal_lines id; Type: DEFAULT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_lines ALTER COLUMN id SET DEFAULT nextval('public.journal_lines_id_seq'::regclass);


--
-- Name: pawn_events id; Type: DEFAULT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_events ALTER COLUMN id SET DEFAULT nextval('public.pawn_events_id_seq'::regclass);


--
-- Name: savings_transactions id; Type: DEFAULT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.savings_transactions ALTER COLUMN id SET DEFAULT nextval('public.savings_transactions_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: work_order_events id; Type: DEFAULT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.work_order_events ALTER COLUMN id SET DEFAULT nextval('public.work_order_events_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6763f6b9-6700-44cf-bbf8-58154047f38d	52b818cda55fe0f4ea2ed846d2565801ed41949188aba1f36954923880858bb7	2026-07-06 03:48:16.230692+00	20260706034735_phase7_journal_append_only_and_balance_check	\N	\N	2026-07-06 03:48:16.190293+00	1
df5f1685-f90b-46be-be24-e09a90711f69	af9a2210cc686c97316888df43a25d7f169ed9460f2a993000eef711a55c4a35	2026-07-05 10:41:03.698852+00	20260705104103_init_document_sequences	\N	\N	2026-07-05 10:41:03.681585+00	1
77a21563-c403-4012-8bc6-2b1169ea0bbb	920c9b30f547fd72e526464e7ed2a47ae99aa6f7a247f55186eac722b82c56d6	2026-07-05 10:53:12.46395+00	20260705105312_phase1_auth_rbac_audit	\N	\N	2026-07-05 10:53:12.193057+00	1
bcbc5a83-d52f-459b-9aa0-dcbee9372038	1a9e414aed074958821f128e0885ec846ad4067a1c42c34c4ddb50fa43ba3571	2026-07-05 10:53:58.35924+00	20260705105324_audit_logs_append_only	\N	\N	2026-07-05 10:53:58.33809+00	1
0c82245e-5d78-4825-9e3a-a234a54ae21a	0d49120352d0d16ae060cc0f0a27bfefb9bf78b524cd8f727ae4c4dd9e093abf	2026-07-06 05:45:35.589662+00	20260706054401_phase8_journal_entry_branch	\N	\N	2026-07-06 05:45:35.557675+00	1
5e8d6ab4-21b1-47b6-b9a3-ea723bbce76d	875662068c8ce26900fae763f0ef4aaf3c1d38c2371ab05e3671bc1be0f463ac	2026-07-05 11:44:11.987457+00	20260705114411_phase2_gold_price_engine	\N	\N	2026-07-05 11:44:11.919484+00	1
eaf0a4a7-a3c4-4857-a9f2-f806a9e06ec0	60d697a2a3e864958e4603b00434429308be04d0f1572c5ffb45fc8dc1cc9149	2026-07-05 12:26:21.325607+00	20260705122620_phase3_inventory_schema	\N	\N	2026-07-05 12:26:20.806975+00	1
eb8a6a1d-98a6-4877-aa37-58498f86421c	0025d542e6faf3a1da16dc9c035af8845f2c73c80afd3fad2f967a2b9adf1590	2026-07-05 12:27:05.607271+00	20260705122636_stock_movements_append_only_and_checks	\N	\N	2026-07-05 12:27:05.565402+00	1
66b47aa7-2f43-4b6e-9734-03c479bf9116	de312dcb2e02d45335d5bcb9479006bcd25747ebd0beee3ee04b3db8c27b2eb7	2026-07-06 05:56:36.481458+00	20260706055609_phase8_cash_transfer	\N	\N	2026-07-06 05:56:36.423851+00	1
eacd78f9-d9b7-4a81-ab93-bcf210876ac7	9fa2fefcbf6c7c084bf552803dd81cb6fafe000fb569e99d1c69d069eb8fac81	2026-07-05 14:30:00.650322+00	20260705143000_phase4_pos	\N	\N	2026-07-05 14:30:00.205763+00	1
dbe09333-7ca9-4b5b-993d-c5cc9693c2cb	872027543f21e6c738bbcdbf4c4d33b86cbac66d684d29a09e097408ad9b9b99	2026-07-06 02:15:24.498034+00	20260706021524_phase5_pawn_schema	\N	\N	2026-07-06 02:15:24.311917+00	1
cfb38aa3-1313-4813-989b-20ef4cf90db4	e3dfb6aee40ce87881736469c811be92bf5d3f2916210a038928d70fb1cdd8b4	2026-07-06 02:16:21.22764+00	20260706021536_pawn_events_append_only_and_checks	\N	\N	2026-07-06 02:16:21.182314+00	1
b1c26b6d-b635-447d-a53b-62b7aa83e63f	ce85868a079a839d3cb11564fc86af955917394aef88b5f5f35bb7fb57c49618	2026-07-06 06:14:39.469217+00	20260706061439_phase8_fraud_audit_indexes	\N	\N	2026-07-06 06:14:39.439322+00	1
e7324162-7f55-44ea-abf7-486c1e08d53b	5e577038e50d639302cef50b5ddf28e702b315a0ca5ceb6b1d9a4204a8c4c9c6	2026-07-06 02:55:19.379557+00	20260706025518_phase6_savings_workorders_crm_amlo	\N	\N	2026-07-06 02:55:19.023141+00	1
19d6c01d-9b2f-4a39-875e-ae74ba6dee3c	dc3b42eb4f9da218b549b0edf90f29a49e92aec57fed2deb951a4d1e36b2df9a	2026-07-06 02:56:07.670467+00	20260706025532_phase6_append_only_and_checks	\N	\N	2026-07-06 02:56:07.624966+00	1
66fcd3f2-e6dd-47b2-86ae-412f1f4faca7	0bb0e1493a95695e0e7af74c3ad9d813731ac373058e8b5426446c5b28cfc150	2026-07-06 03:47:20.735058+00	20260706034720_phase7_accounting_schema	\N	\N	2026-07-06 03:47:20.523331+00	1
\.


--
-- Data for Name: accounting_periods; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.accounting_periods (id, year_month, status, locked_at, locked_by_id, created_at, updated_at) FROM stdin;
5321a95a-bdd7-49be-b186-90480bdf58c0	2569-07	OPEN	\N	\N	2026-07-06 04:40:56.441	2026-07-06 04:40:56.441
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.accounts (id, code, name, type, is_system, is_active, created_at, updated_at) FROM stdin;
341811d9-8171-44f6-ae78-bb727fda1908	1000	เงินสด	ASSET	t	t	2026-07-06 04:40:06.414	2026-07-06 06:08:33.028
89e1fe8d-0237-4eea-a675-45da8584ed6f	1010	เงินฝากธนาคาร	ASSET	t	t	2026-07-06 04:40:06.424	2026-07-06 06:08:33.035
7487b455-6bdb-4049-8fc3-bca435effcf9	1200	สินค้าคงเหลือ-ทองคำ	ASSET	t	t	2026-07-06 04:40:06.429	2026-07-06 06:08:33.039
e14a6984-3db7-4b14-a5f9-59218ad983c6	1300	ลูกหนี้เงินให้กู้ยืม-ขายฝาก	ASSET	t	t	2026-07-06 04:40:06.434	2026-07-06 06:08:33.044
b2d3a082-1766-4438-9183-ecf1346c3e96	2000	ภาษีขายค้างจ่าย	LIABILITY	t	t	2026-07-06 04:40:06.44	2026-07-06 06:08:33.049
ecff4cf1-9215-452a-8193-34c10c03612a	2100	เงินรับฝากล่วงหน้า-ออมทอง	LIABILITY	t	t	2026-07-06 04:40:06.445	2026-07-06 06:08:33.053
ca301582-32c2-4c3d-a8ed-6dd89d61fced	2110	เงินมัดจำรับล่วงหน้า-งานช่าง	LIABILITY	t	t	2026-07-06 04:40:06.449	2026-07-06 06:08:33.057
af181fb3-ea09-43ba-b03c-d4b612df0efd	2200	ค่าคอมมิชชั่นค้างจ่าย	LIABILITY	t	t	2026-07-06 04:40:06.453	2026-07-06 06:08:33.062
a96d9447-d1f5-4c31-893b-e54adee46b0e	3000	ทุน/กำไรสะสม	EQUITY	t	t	2026-07-06 04:40:06.459	2026-07-06 06:08:33.067
785bd6f4-6105-48db-a6a3-9b40ff5d517c	4000	รายได้ขายทอง-เนื้อทอง	REVENUE	t	t	2026-07-06 04:40:06.464	2026-07-06 06:08:33.072
eae2bec7-1ba2-45c3-8be7-2ed00ad36bd4	4010	รายได้ค่ากำเหน็จ	REVENUE	t	t	2026-07-06 04:40:06.468	2026-07-06 06:08:33.077
efc39e3c-6172-4d47-b678-b2fa6e8d77ef	4020	รายได้ดอกเบี้ยขายฝาก	REVENUE	t	t	2026-07-06 04:40:06.473	2026-07-06 06:08:33.082
2b369d1d-23ec-4824-8223-4e7d1558d2e5	4030	รายได้ค่าบริการซ่อม	REVENUE	t	t	2026-07-06 04:40:06.477	2026-07-06 06:08:33.086
4afd2a17-0abe-44f0-a974-68bc6a5afd47	4040	กำไรจากส่วนต่างราคาบัญชีออมทอง	REVENUE	t	t	2026-07-06 04:40:06.482	2026-07-06 06:08:33.091
dda4ebb2-bdee-4837-998c-e8aba77760a7	5000	ต้นทุนขายทอง	EXPENSE	t	t	2026-07-06 04:40:06.487	2026-07-06 06:08:33.096
d87e89cd-3fcd-490a-bd3d-87450fda344f	5100	ค่าใช้จ่ายทั่วไป	EXPENSE	t	t	2026-07-06 04:40:06.492	2026-07-06 06:08:33.101
e03a71df-9e8d-4116-a112-cb118b4af2fc	5200	ค่าคอมมิชชั่นพนักงาน	EXPENSE	t	t	2026-07-06 04:40:06.496	2026-07-06 06:08:33.106
465a885b-169d-424d-b14c-0a78096ecb55	5300	ค่าธรรมเนียมบัตรเครดิต	EXPENSE	t	t	2026-07-06 04:40:06.5	2026-07-06 06:08:33.11
9de38ddc-0dce-44d1-8890-6c15921ff61d	5400	ขาดทุนจากส่วนต่างราคาบัญชีออมทอง	EXPENSE	t	t	2026-07-06 04:40:06.505	2026-07-06 06:08:33.115
\.


--
-- Data for Name: amlo_alerts; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.amlo_alerts (id, customer_id, ref_type, ref_id, amount_satang, watchlist_match, status, reviewed_by_id, reviewed_at, reported_at, note, created_at) FROM stdin;
\.


--
-- Data for Name: amlo_watchlist_entries; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.amlo_watchlist_entries (id, citizen_id_hash, name, reason, added_by, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.audit_logs (id, request_id, actor_id, action, entity_type, entity_id, before, after, branch_id, ip, user_agent, created_at) FROM stdin;
1	43f82bd5-bb47-4690-bd00-54b550e0d347	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:16:28.774
2	e9bb59b1-ac9c-4b96-a543-1d72fbb4a9c0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:16:28.784
3	1d1313a5-5120-486a-bcb4-1aecd72399dd	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:16:28.804
4	cdd34d9d-86b9-4cfc-b7e0-c1064ccb916a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:17:20.767
5	f64ff88e-d057-494d-9631-c46c421712d7	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:17:20.778
6	519217ee-0ed5-4411-bb9f-272dd5fe3004	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:17:20.779
7	1c44c46e-128a-4957-9ec9-3836528be213	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:23:15.038
8	f678a035-ef17-4a1c-88bb-27f3d5463d26	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:23:15.042
9	eb333c6d-3155-48b6-81a6-832efa9acca8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:23:15.042
10	3f26186b-4fa8-4b64-973c-af01a8359bba	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:23:15.051
11	8c787666-0282-4a45-a54d-e7f6ecf7aade	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	66386734-f3d4-45f3-a57a-86962faec426	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783250592355", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-05 11:23:17.285
12	6764239d-f929-4579-80e8-e18a5ffe69bb	66386734-f3d4-45f3-a57a-86962faec426	auth.login_success	user	66386734-f3d4-45f3-a57a-86962faec426	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:23:18.178
13	f907abec-10d1-4a3d-a0b6-2f291af39b28	66386734-f3d4-45f3-a57a-86962faec426	auth.password_changed	user	66386734-f3d4-45f3-a57a-86962faec426	\N	\N	\N	\N	\N	2026-07-05 11:23:19.103
14	0490beed-987e-4e4b-b67c-545959b95c8c	66386734-f3d4-45f3-a57a-86962faec426	auth.totp_enabled	user	66386734-f3d4-45f3-a57a-86962faec426	\N	\N	\N	\N	\N	2026-07-05 11:23:19.612
15	6899e685-02fa-4cc9-b45b-d09e28800d8a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:24:12.935
16	4ad03782-a2a6-4705-a41e-87c3b8d1c443	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:24:12.946
17	51358495-7681-4507-be09-8a89c8f73ab6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:24:12.947
18	d522bc67-75d9-493a-b8f1-d0b27e0195e5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:24:12.949
19	35e8d2ff-7c19-4d97-b23a-4f0b1c9e5a26	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	be5cbe16-3a0f-4905-a442-18eea14d23e6	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783250650336", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-05 11:24:15.062
20	88624a54-7d51-4ae5-9e91-d7d154c73db0	be5cbe16-3a0f-4905-a442-18eea14d23e6	auth.login_success	user	be5cbe16-3a0f-4905-a442-18eea14d23e6	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:24:15.84
21	5e791746-395e-42e4-bef8-e86fab06f690	be5cbe16-3a0f-4905-a442-18eea14d23e6	auth.password_changed	user	be5cbe16-3a0f-4905-a442-18eea14d23e6	\N	\N	\N	\N	\N	2026-07-05 11:24:16.791
22	11993d58-d8bc-4082-a43f-9d7420c84ddc	be5cbe16-3a0f-4905-a442-18eea14d23e6	auth.totp_enabled	user	be5cbe16-3a0f-4905-a442-18eea14d23e6	\N	\N	\N	\N	\N	2026-07-05 11:24:17.313
23	89dd63f9-1ccc-4d78-ace7-895f8f0b7ef2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:25:23.481
24	dc856048-2862-40c3-a84c-5b8f29a49ee9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:25:23.484
25	32caee92-1130-420b-bfaf-57ff54733c13	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:25:23.497
26	3b970cd4-f5c2-4e2d-b336-25874974c820	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:25:23.499
88	1c479ed4-97e8-4497-b02d-b446a3d88e31	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	e18df7aa-9cfd-4260-a20a-4b3b8f6a913e	\N	\N	\N	\N	\N	2026-07-06 03:24:13.67
27	c5d15c81-19a5-417e-8d60-a4804a82bfb2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	d788f6cc-2452-4040-aea7-c5432733bd56	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783250720879", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-05 11:25:25.603
28	26d5bf2f-ac32-42c5-9dee-9e2294637b1f	d788f6cc-2452-4040-aea7-c5432733bd56	auth.login_success	user	d788f6cc-2452-4040-aea7-c5432733bd56	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:25:26.482
29	dff21e30-0195-4cd2-bb2c-8f3753d21ac7	d788f6cc-2452-4040-aea7-c5432733bd56	auth.password_changed	user	d788f6cc-2452-4040-aea7-c5432733bd56	\N	\N	\N	\N	\N	2026-07-05 11:25:27.428
30	6af4c801-7fad-4679-ba04-105b6975c298	d788f6cc-2452-4040-aea7-c5432733bd56	auth.totp_enabled	user	d788f6cc-2452-4040-aea7-c5432733bd56	\N	\N	\N	\N	\N	2026-07-05 11:25:27.95
31	7cf35052-b845-44fd-b040-bc0a2f04f423	d788f6cc-2452-4040-aea7-c5432733bd56	auth.login_success	user	d788f6cc-2452-4040-aea7-c5432733bd56	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:25:28.947
32	c79165ad-52c9-49e1-8a82-13e7d79207c8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:27.843
33	f2e1e571-8467-4b4a-bdbd-f2e8fec1db6e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:27.863
34	60d8a0ab-bca6-4ec5-a43c-4cbb394a8ab4	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:27.908
35	7b9062a4-6816-4a3d-b13a-7ade4d780b4f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:27.909
36	115241f2-bf6a-462d-ac65-dd82ccf50c90	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:27.911
37	114913d7-d614-4692-a992-1ebd924f4bc4	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:28.092
38	fc95aa2f-9220-4379-8299-e7b18a5a724c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	2c547ede-b3d0-4940-8448-dcc194dc7662	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783252585751", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-05 11:56:31.222
39	1f59e190-6b81-40f2-ab06-534adc383c18	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	7721ba4d-536b-4537-86b4-f8922ef0d8bc	\N	{"note": null, "barBuy": "5095000", "barSell": "5105000", "ornamentBuy": "5053200", "ornamentSell": "5975000", "basedOnFeedId": "02e31fcf-4102-4b48-b7cd-acc3517756bc"}	\N	\N	\N	2026-07-05 11:56:31.406
40	f53c7890-073b-4011-a2c0-49c56fe40446	2c547ede-b3d0-4940-8448-dcc194dc7662	auth.login_success	user	2c547ede-b3d0-4940-8448-dcc194dc7662	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:33.072
41	542081db-0588-4039-8abe-f0e8ca38be38	2c547ede-b3d0-4940-8448-dcc194dc7662	auth.password_changed	user	2c547ede-b3d0-4940-8448-dcc194dc7662	\N	\N	\N	\N	\N	2026-07-05 11:56:34.015
42	49de5aca-eeae-4abe-ac40-1b3ca32ae703	2c547ede-b3d0-4940-8448-dcc194dc7662	auth.totp_enabled	user	2c547ede-b3d0-4940-8448-dcc194dc7662	\N	\N	\N	\N	\N	2026-07-05 11:56:34.564
43	7d7e37aa-6974-4f6d-9346-6b3dae92d465	2c547ede-b3d0-4940-8448-dcc194dc7662	auth.login_success	user	2c547ede-b3d0-4940-8448-dcc194dc7662	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-05 11:56:35.654
44	22187d66-8903-49d3-a360-9e389140135c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:29:34.526
45	79901356-9fdd-48d6-91a4-9e8e74ffaf2a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:30:37.297
46	ae86cffb-e58c-48fe-a698-8593aa804856	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	c75683f8-d8d0-4136-841b-ef33f647174c	\N	{"docNo": "PWN-HQ-2569-000001", "dueDate": "2026-08-06T02:30:39.432Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:30:39.447
47	d6e41823-bf2d-4d5d-ad09-5df7eaea838e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	c75683f8-d8d0-4136-841b-ef33f647174c	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:30:41.786
48	527a7a20-bf66-4be8-a007-c6de822dfe29	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:28.713
49	e342cede-dfb4-4b29-b17e-bce1bf10220f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	3b68a161-9014-43d8-9da0-61f1fa2bfa34	\N	{"docNo": "PWN-HQ-2569-000002", "dueDate": "2026-08-06T02:31:30.941Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:31:30.953
50	22837608-7168-4a77-99fb-0eaee9cacf5b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	3b68a161-9014-43d8-9da0-61f1fa2bfa34	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:31:33.201
51	e4fefd47-33d0-4366-a5bf-cfecd8afc928	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:54.969
52	289967eb-1e30-4f68-b8b2-b53c38830e4f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:54.975
53	7c614bf1-5c89-4e3d-90c0-d74547a4db18	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:55.035
54	3911cfaa-213a-46b6-983e-f46928560b7c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:55.058
55	bcc4a61e-ce39-4c80-b0d2-4e81d0cd0d2a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:55.071
56	0e385d92-ed86-426d-9f7d-39feb81f2247	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:55.306
57	cecd06ea-7f38-4d8b-9cc8-1ee06aab23d8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:31:55.383
58	5f005881-f5e1-4cf2-b45d-e2c2c63ada66	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	e27d35f3-561f-4aee-948c-d3543775e5b2	\N	{"docNo": "PWN-HQ-2569-000003", "dueDate": "2026-08-06T02:31:58.894Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:31:58.912
59	97bdbae6-f4e0-4d5a-a545-61ef652d2cf2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	408b48e4-8342-46b3-83e3-131ea6928587	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783305112381", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:31:59.17
61	730ef710-760a-4ab9-a33a-2aa6d8a5df17	408b48e4-8342-46b3-83e3-131ea6928587	auth.login_success	user	408b48e4-8342-46b3-83e3-131ea6928587	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:32:01.172
60	d2bd3558-1146-4441-8320-4ce060e8eddd	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	01f1f320-172c-4dc6-b909-c0e74cdfa0d2	\N	{"note": null, "barBuy": "5095000", "barSell": "5105000", "ornamentBuy": "5053200", "ornamentSell": "5975000", "basedOnFeedId": "02e31fcf-4102-4b48-b7cd-acc3517756bc"}	\N	\N	\N	2026-07-06 02:31:59.357
62	df8fe2d1-8e87-45cf-878a-9ae57c94b657	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	e27d35f3-561f-4aee-948c-d3543775e5b2	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:32:02.479
63	77341d4a-9310-407a-8fee-b56de6d0fbf7	408b48e4-8342-46b3-83e3-131ea6928587	auth.password_changed	user	408b48e4-8342-46b3-83e3-131ea6928587	\N	\N	\N	\N	\N	2026-07-06 02:32:02.726
64	ec0e2a2a-dcc5-4471-825a-1a88c61d57b0	408b48e4-8342-46b3-83e3-131ea6928587	auth.totp_enabled	user	408b48e4-8342-46b3-83e3-131ea6928587	\N	\N	\N	\N	\N	2026-07-06 02:32:03.646
65	15bbbd74-6a37-4e3c-b66f-094c0489b3b9	408b48e4-8342-46b3-83e3-131ea6928587	auth.login_success	user	408b48e4-8342-46b3-83e3-131ea6928587	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:32:04.739
66	6b1a9cae-bf8a-4362-b839-101329e17a38	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.319
67	c0521955-3649-4a7d-a000-75e45545eb5a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.326
68	e5b27bb1-b1e4-47b6-8ec2-8473c7ad29df	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.328
69	02726390-430e-4ecb-9ac5-41d1151600e5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.339
70	ca272222-329a-4c6b-bb23-21b537a4dece	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.406
71	6bf16bf7-493c-479f-96b6-e2460dfe1093	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.413
72	4687e87c-cfd0-40bf-af88-b1add03455fe	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:31.437
73	3e401d77-c7f4-4e52-8f5d-4ea37809c0f6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	6bfff212-e20d-458c-8c3c-8ee808226883	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783305448940", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:37:34.877
74	f4a2c56b-519c-41d5-a8b7-cb5f71dae52d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	306b6da1-dfed-405e-a16c-48975d825227	\N	{"note": null, "barBuy": "5088000", "barSell": "5098000", "ornamentBuy": "5046200", "ornamentSell": "5975000", "basedOnFeedId": "03ef4a9d-2f89-4563-9178-7804a5613d34"}	\N	\N	\N	2026-07-06 02:37:35.134
75	999f4f01-d68f-4066-8d37-eb041b5ff256	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	85250ac9-1924-4096-8bc1-bd698b1dc0b9	\N	{"docNo": "PWN-HQ-2569-000004", "dueDate": "2026-08-06T02:37:35.129Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:37:35.161
76	3922c776-4505-4d01-9791-1cdedacbe8d6	6bfff212-e20d-458c-8c3c-8ee808226883	auth.login_success	user	6bfff212-e20d-458c-8c3c-8ee808226883	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:36.07
77	db1a9f48-64a8-4dfb-a533-9198a8feab88	6bfff212-e20d-458c-8c3c-8ee808226883	auth.password_changed	user	6bfff212-e20d-458c-8c3c-8ee808226883	\N	\N	\N	\N	\N	2026-07-06 02:37:37.5
78	027149ac-5dac-4688-8cfe-a21933f5bb83	6bfff212-e20d-458c-8c3c-8ee808226883	auth.totp_enabled	user	6bfff212-e20d-458c-8c3c-8ee808226883	\N	\N	\N	\N	\N	2026-07-06 02:37:37.996
79	a083bfe8-01ec-4729-b9d2-280749355647	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	85250ac9-1924-4096-8bc1-bd698b1dc0b9	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 02:37:38.313
80	876f697b-b07e-46fa-8fb4-45e44c3e79ac	6bfff212-e20d-458c-8c3c-8ee808226883	auth.login_success	user	6bfff212-e20d-458c-8c3c-8ee808226883	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 02:37:39.605
81	5056f2b0-1a91-4eed-99fb-e9dfc608cfc5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:24:04.872
82	3d9a5f81-360b-41d0-ad17-9ebfeb6e11cb	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:24:04.875
83	2114c889-b762-46f2-b8b9-9e31714c2db5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:24:04.913
84	b68a27f0-d303-4a47-85dc-48bcfd05be5b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	99934041-a9fc-4a86-b9c0-6c566047345a	\N	{"docNo": "SAV-HQ-2569-000001", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:24:09.347
85	1a87025c-0aac-4a9c-b04c-df29590a10da	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	e18df7aa-9cfd-4260-a20a-4b3b8f6a913e	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000001"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:24:09.619
86	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	e9dbc163-541d-46d0-837e-ccaccd2f3cc6	\N	{"code": "CUS-000001", "name": "ลูกค้าทดสอบ E2E 1783308246543"}	\N	\N	\N	2026-07-06 03:24:09.82
87	6c584167-02f1-4ab2-ad57-11ab4c4fe7ae	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	99934041-a9fc-4a86-b9c0-6c566047345a	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 03:24:13.389
89	516a447b-75ef-4141-b6d6-eda0e6ac165b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	99934041-a9fc-4a86-b9c0-6c566047345a	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 03:24:14.016
90	3f5cdf81-ea0c-4ff4-99e2-a9d7b2ead48f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:25:04.957
91	d2b497b6-cd23-4048-8d42-9f7cbc0cd15a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:25:04.958
92	aaf68dfe-bb25-47a3-914c-5e92756c1452	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:25:04.989
93	31a67be5-5cfc-422d-b992-44201973bca5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	d5cdd40c-8f84-46b1-8a21-a442a1e27391	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000002"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:25:07.493
94	369fcf4c-81ba-4b60-b166-edba62a1e21d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	0d53a61f-2558-4bf8-9760-c4ded5668e55	\N	{"docNo": "SAV-HQ-2569-000002", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:25:07.682
95	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	f47fa2f6-e061-4ef3-a35b-ef5f08c10167	\N	{"code": "CUS-000002", "name": "ลูกค้าทดสอบ E2E 1783308305873"}	\N	\N	\N	2026-07-06 03:25:07.761
96	f371e14d-b325-447a-8775-5c2afb6a0d33	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	0d53a61f-2558-4bf8-9760-c4ded5668e55	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 03:25:10.676
97	d7d934da-bb3b-4ee4-a799-1bd4b86f6459	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	0d53a61f-2558-4bf8-9760-c4ded5668e55	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 03:25:11.018
98	a7d9433d-2e09-4671-8b01-f4da51879382	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:11.608
99	5eafce9f-aa66-413e-8724-e1f33538d2da	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:11.61
100	b71ae7c6-4eda-4a48-bfcc-087ca206249e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:11.611
101	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	f979cb5e-d0ac-4e62-8202-3eea8f0a06ff	\N	{"code": "CUS-000003", "name": "ลูกค้าทดสอบ E2E 1783308372565"}	\N	\N	\N	2026-07-06 03:26:14.243
102	79632c98-5eed-411f-af32-29dd7d54c7d4	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	\N	{"docNo": "SAV-HQ-2569-000003", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:26:14.357
103	6b5ff354-4bb2-4947-8c5d-8827cce7ab93	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	20daae65-95e8-483c-b7a6-f16c6f202dcc	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000003"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:26:14.39
104	7f17322c-856e-4557-aad9-aa8ee5c40d27	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 03:26:17.49
105	f49c601b-9e3b-4ca0-947f-e73142fa6eee	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	20daae65-95e8-483c-b7a6-f16c6f202dcc	\N	\N	\N	\N	\N	2026-07-06 03:26:17.673
106	bd0320ec-bd7c-4892-8833-92cd2057dcf3	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 03:26:17.871
107	e36589f0-04ce-492b-9fe7-ad5157b6b52a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	20daae65-95e8-483c-b7a6-f16c6f202dcc	\N	\N	\N	\N	\N	2026-07-06 03:26:18.456
108	10d2f4f1-7e26-4de3-ac54-b338785c0320	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	20daae65-95e8-483c-b7a6-f16c6f202dcc	\N	\N	\N	\N	\N	2026-07-06 03:26:18.739
109	041d86a8-ae46-4f88-bd79-01631df35e8b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:37.639
110	c47986f3-5d65-4257-be06-602b8e7fde58	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:37.654
111	53fecca8-adc9-485e-84dd-ca9c21b58c44	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:37.715
112	ffefd9aa-f5cc-403c-89b7-6f5556904b9e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:26:37.72
113	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	e8dc1b21-3905-424b-ade4-a75ca47ff37a	\N	{"code": "CUS-000004", "name": "ลูกค้าทดสอบ E2E 1783308398737"}	\N	\N	\N	2026-07-06 03:26:40.431
114	3ca62385-2b2b-4d53-b7c4-3f56b0bb0519	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	68094637-a069-4ee4-9f88-cf9136e20692	\N	{"docNo": "SAV-HQ-2569-000004", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:26:40.59
115	4716dca2-a7f5-466b-86ee-576b4477bc60	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	3e4a7d7c-d75b-407b-bcb8-6b9e4dc3e790	\N	{"docNo": "PWN-HQ-2569-000005", "dueDate": "2026-08-06T03:26:40.736Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:26:40.748
116	b1228325-b12d-4d20-8f24-d7d7e5cace92	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	3e4a7d7c-d75b-407b-bcb8-6b9e4dc3e790	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:26:44.115
117	5db8645b-963a-458d-a7ca-f4c4c6eb0119	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	68094637-a069-4ee4-9f88-cf9136e20692	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 03:26:44.293
118	add5ee26-7ac3-4aef-82e1-645e42b8adf7	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	68094637-a069-4ee4-9f88-cf9136e20692	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 03:26:44.581
119	96e1de91-ffd4-4beb-ba55-eef2bb3ddb46	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:18.94
120	3d1fa930-b809-43c3-9fb9-ea34743fba3b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:18.946
121	0f10e132-6f7d-4a5f-a100-10757065f4d5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:18.949
122	ffe40ad6-d220-4531-abe1-092054fa7c0d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:18.975
123	872d5a8e-6adb-40d8-9a79-3959b6bc6e33	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:19.021
124	af771157-f909-4911-bb2d-2508e1172e7f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:19.126
125	a1102400-1e3b-4d2e-a3f4-c5de4b5ae4e9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:19.244
126	380c4648-33e8-41e9-b8cb-ec0cfb282a8b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:19.623
127	af9cb9b2-5498-45e1-95f6-8e2004f2744d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:20.774
128	9697a50d-09f3-4bc8-97f4-19270cfd2571	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	31ac2dd7-4409-4c1b-93d8-887fae6fae92	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000004"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:33:24.134
129	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	0e408aef-83b8-4ea0-be25-037eb93543b7	\N	{"code": "CUS-000005", "name": "ลูกค้าทดสอบ E2E 1783308800870"}	\N	\N	\N	2026-07-06 03:33:24.528
130	d1877749-fc0f-4455-a4c6-c59b3bf8b38d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	79e6625e-a08e-4f3d-b42b-aa535e8a86a0	\N	{"docNo": "SAV-HQ-2569-000005", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:33:24.53
131	65737ff3-5875-40f6-9ccd-55fb08733580	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	54aba1f3-48e6-4d2e-aa70-545d87423133	\N	{"docNo": "PWN-HQ-2569-000006", "dueDate": "2026-08-06T03:33:24.598Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:33:24.63
132	d28639e3-e544-4f4e-a277-12c89bae8354	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	87169750-2dfe-4f38-a393-da3e066b5c1e	\N	{"note": null, "barBuy": "5088500", "barSell": "5098500", "ornamentBuy": "5046700", "ornamentSell": "5975000", "basedOnFeedId": "e34259d6-eded-49ff-978a-c0ddf34fd005"}	\N	\N	\N	2026-07-06 03:33:24.997
133	deaa92ce-5651-428b-ad70-ff83f5945038	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:25.614
134	0560338c-950c-4c51-8151-9114883812ed	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	31ac2dd7-4409-4c1b-93d8-887fae6fae92	\N	\N	\N	\N	\N	2026-07-06 03:33:27.979
135	307fa191-4bf2-46e6-9643-17eb55177223	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	7e40436a-dd19-46d4-b9a5-5709b7bd243e	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783308804033", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:33:28.348
136	8b44b11e-8c9d-429c-b1a8-5f5e4f287204	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	31ac2dd7-4409-4c1b-93d8-887fae6fae92	\N	\N	\N	\N	\N	2026-07-06 03:33:28.918
137	12acd1b3-e11e-4e88-89e6-cf43f4597088	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	54aba1f3-48e6-4d2e-aa70-545d87423133	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 03:33:29.301
138	6e86a69a-b255-4341-bdae-17d76789011b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	79e6625e-a08e-4f3d-b42b-aa535e8a86a0	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 03:33:29.591
139	4d06dd6d-1f30-465c-8e90-a71f3bf893f2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	31ac2dd7-4409-4c1b-93d8-887fae6fae92	\N	\N	\N	\N	\N	2026-07-06 03:33:29.829
140	81329854-3b44-4b07-ab42-403592ee0428	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	79e6625e-a08e-4f3d-b42b-aa535e8a86a0	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 03:33:30.28
141	0d84cf4f-0a63-42b9-b6fa-0238db72e592	7e40436a-dd19-46d4-b9a5-5709b7bd243e	auth.login_success	user	7e40436a-dd19-46d4-b9a5-5709b7bd243e	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:30.513
142	98f8b350-848f-4c23-b689-ed39f5293c8d	7e40436a-dd19-46d4-b9a5-5709b7bd243e	auth.password_changed	user	7e40436a-dd19-46d4-b9a5-5709b7bd243e	\N	\N	\N	\N	\N	2026-07-06 03:33:31.809
143	ad9cf351-2fb3-43e7-b948-f38d0840e68d	7e40436a-dd19-46d4-b9a5-5709b7bd243e	auth.totp_enabled	user	7e40436a-dd19-46d4-b9a5-5709b7bd243e	\N	\N	\N	\N	\N	2026-07-06 03:33:32.32
144	27ef3543-bd4e-435b-a175-2d82fad646ad	7e40436a-dd19-46d4-b9a5-5709b7bd243e	auth.login_success	user	7e40436a-dd19-46d4-b9a5-5709b7bd243e	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 03:33:33.374
145	34ce9d40-ce7a-4ab0-bba8-976158fa296c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:40:52.909
146	0e2abc57-5195-460e-8256-3e327863b1ca	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:40:52.911
147	915633ba-bea8-45d7-8e9e-8ab00a0c76a3	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:40:52.931
148	18c4e243-4a6c-4c25-bd63-46c6d51f49f2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	d5bd5c51-6f4b-4fa4-b2fb-ea051dc316d3	\N	{"refId": "488bffbf-8185-4ca5-80e9-f47e7515ed06", "entryNo": "JE-GL-2569-000001", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 04:40:56.466
149	18c4e243-4a6c-4c25-bd63-46c6d51f49f2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	488bffbf-8185-4ca5-80e9-f47e7515ed06	\N	{"docNo": "EXP-HQ-2569-000001", "amountSatang": "123400", "expenseAccountCode": "5000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 04:40:56.474
150	b803c2b0-1349-49fe-b873-8b0b7f8a1cca	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:22.243
151	25f408af-ad81-45e5-b927-b04f4f0bbe0d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:22.245
152	47dc9633-42a2-4129-888a-0b15abdc1b7a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:22.269
153	d6242238-032d-48c0-a2ba-88d384c4a925	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	ed5911bd-6e78-4313-a8b6-4254d45d2b29	\N	{"refId": "f90049d7-52ee-48e1-ba27-981e05f80c0f", "entryNo": "JE-GL-2569-000002", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 04:41:25.322
154	d6242238-032d-48c0-a2ba-88d384c4a925	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	f90049d7-52ee-48e1-ba27-981e05f80c0f	\N	{"docNo": "EXP-HQ-2569-000002", "amountSatang": "123400", "expenseAccountCode": "5000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 04:41:25.33
155	0724bc6a-482a-4804-bb97-6b69128dad70	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:46.194
156	87c485e5-19e5-4e07-a462-0683b11d6a15	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:46.254
157	602635c0-0554-479a-9062-b3c8f318b273	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:46.262
158	4cd2425a-9a89-4b27-be0c-417eca2264ad	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 04:41:46.271
159	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	902c23b6-c48a-44ca-8bbd-69cf9301f493	\N	{"code": "CUS-000006", "name": "ลูกค้าทดสอบ E2E 1783312907472"}	\N	\N	\N	2026-07-06 04:41:49.387
160	c183a060-40c5-4902-94b0-14b7b6a36f56	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.648
161	26d22f7b-a79d-4278-a6d8-772554741aa1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.66
162	848f0cca-a7b3-4e09-802c-c416796e9852	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.718
163	557764b1-e336-4c8b-b0f6-d5c7dade2f71	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.72
164	fb74d430-eab8-4bbc-9b0e-709a8ac2ede5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.757
165	d2067211-2f83-4f28-a5b4-e00ed240b5ec	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.764
166	8c82544b-6723-4149-90d0-681e199ab251	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:43.84
167	73ef46c9-a873-4054-aba3-543314e76813	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:44.567
168	81beed6c-1acb-467a-99df-bb458944c709	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:46.409
169	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	a7b90d6f-ee3c-407e-bcc4-64e064f9b5f1	\N	{"code": "CUS-000007", "name": "ลูกค้าทดสอบ E2E 1783314046643"}	\N	\N	\N	2026-07-06 05:00:53.848
170	01605941-a387-4a75-b08e-cc61414b3bee	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	da4dd669-0b44-43e6-b979-f69b68435fbb	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000005"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:00:53.855
171	5287e00e-5070-4005-8452-520a7dd394c0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	f7141fc4-b667-4da4-afbc-4f7d5aa03481	\N	{"refId": "f2c04a1e-5d12-4b94-b20e-3ecfe1c9c74e", "entryNo": "JE-GL-2569-000003", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 05:00:54.236
172	5287e00e-5070-4005-8452-520a7dd394c0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	f2c04a1e-5d12-4b94-b20e-3ecfe1c9c74e	\N	{"docNo": "EXP-HQ-2569-000003", "amountSatang": "123400", "expenseAccountCode": "5000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:00:54.275
173	ad26ea36-f9ed-48a0-9032-9c26544cbff9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	1bc8e2c9-70c3-4e5d-8ccd-468c7bd93a28	\N	{"docNo": "PWN-HQ-2569-000007", "dueDate": "2026-08-06T05:00:54.296Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:00:54.438
175	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	36dd8d09-de2d-4c55-b2f1-9b21b457514c	\N	{"refId": "13", "entryNo": "JE-GL-2569-000004", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 05:00:54.708
176	1a51f4f8-5268-4b46-803c-5784419d25fa	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:00:55.172
174	c39c6af6-e2c5-48b2-acec-41f561e885a2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	ec176c50-5ab4-485c-9906-d048d939a119	\N	{"docNo": "SAV-HQ-2569-000006", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:00:54.486
177	6bb30f1b-1d3b-4a5c-84a5-45f5cf525650	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	da4dd669-0b44-43e6-b979-f69b68435fbb	\N	\N	\N	\N	\N	2026-07-06 05:01:01.109
178	0539e959-8d20-47aa-9d92-e0e5bacdddc6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	1bc8e2c9-70c3-4e5d-8ccd-468c7bd93a28	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:01:02.13
179	759772bb-87cf-452d-b714-8508c5f03990	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	ec176c50-5ab4-485c-9906-d048d939a119	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 05:01:02.285
180	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	9689f965-650e-4347-99ec-94eb7f846cc0	\N	{"refId": "14", "entryNo": "JE-GL-2569-000005", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 05:01:02.353
181	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	1307cff7-924b-4fe2-bbb5-4079e9cf8d0c	\N	{"refId": "17", "entryNo": "JE-GL-2569-000006", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 05:01:02.602
182	4945f458-20d1-4098-ab57-4cb79196a4fb	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	da4dd669-0b44-43e6-b979-f69b68435fbb	\N	\N	\N	\N	\N	2026-07-06 05:01:02.86
183	e764e042-a28f-4532-86a9-f567e3141959	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	ec176c50-5ab4-485c-9906-d048d939a119	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 05:01:03.429
184	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	ec16bf96-7538-4464-9058-5790fc3f78ab	\N	{"refId": "18", "entryNo": "JE-GL-2569-000007", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 05:01:03.523
185	6e922811-5ffa-46c2-92c9-3de39831eddd	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	da4dd669-0b44-43e6-b979-f69b68435fbb	\N	\N	\N	\N	\N	2026-07-06 05:01:03.807
186	43dcb8a0-2f75-4e09-99b8-507de062d9e5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.113
187	c53735bc-a51d-4c2d-8381-93b7c13796ca	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.128
188	3df812f3-d5d4-4a4c-af83-391327c436fe	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.145
189	21ddfdd8-78c8-4d4b-bf6b-da89b7e0c93b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.152
190	c6313ec7-cbeb-4b1c-8332-63d53ff978c5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.214
191	f76332ea-21d1-4366-83c0-d18081f5178c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.217
192	4bd22a37-0cce-4f06-b2e8-7694bda663c8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.232
193	b8132cc1-f94b-4b15-afb1-bae2272217af	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:21.898
194	0a7e287c-769f-4a51-aeb4-72e1e06325c1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:23.944
195	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	69c1fe00-19bc-4c65-99ad-e29e3de5cd23	\N	{"code": "CUS-000008", "name": "ลูกค้าทดสอบ E2E 1783314383700"}	\N	\N	\N	2026-07-06 05:06:30.594
196	c238150a-abce-426a-a56a-2022ff3e215f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	2fd51c70-25af-42fe-80c8-74203841a6c3	\N	{"docNo": "SAV-HQ-2569-000007", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:06:30.709
197	30fb778e-bfc4-447b-9e1c-e65b7e7e4879	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	784c7eb6-c877-4f85-a1cd-1556bde98e3a	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000006"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:06:30.75
198	492c71e4-39e1-4776-baff-4a6a713cec01	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	442d5052-c30a-44b1-9f6b-2182ff3b356d	\N	{"docNo": "PWN-HQ-2569-000008", "dueDate": "2026-08-06T05:06:30.660Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:06:30.828
199	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	5e6552df-5f53-403b-8812-682bbacdde21	\N	{"refId": "15", "entryNo": "JE-GL-2569-000008", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 05:06:31.305
200	628976f2-a21c-4ba3-b7ba-20a027fffa5d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	27d752e0-5ff8-4869-b957-ff77046eba99	\N	{"refId": "10522cfd-2ae2-491d-9674-0c8728eb8853", "entryNo": "JE-GL-2569-000009", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 05:06:31.615
201	628976f2-a21c-4ba3-b7ba-20a027fffa5d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	10522cfd-2ae2-491d-9674-0c8728eb8853	\N	{"docNo": "EXP-HQ-2569-000004", "amountSatang": "123400", "expenseAccountCode": "5000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:06:31.622
202	c044e1b4-3aba-44f4-b969-538964e02c1f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:06:32.014
203	726894d2-e335-4e0c-abb7-4894c2e52db2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	784c7eb6-c877-4f85-a1cd-1556bde98e3a	\N	\N	\N	\N	\N	2026-07-06 05:06:37.172
206	52854218-d052-4b8b-82b8-56505b0a667b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	784c7eb6-c877-4f85-a1cd-1556bde98e3a	\N	\N	\N	\N	\N	2026-07-06 05:06:38.465
204	0f078f1e-bb6e-4ad3-a813-1f36a8aaf558	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	2fd51c70-25af-42fe-80c8-74203841a6c3	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 05:06:37.648
205	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	b441011d-f240-4aa4-b8b7-5f7ce7d32742	\N	{"refId": "20", "entryNo": "JE-GL-2569-000010", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 05:06:38.023
209	050581c3-f82f-43a7-8793-cce205daf98e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	442d5052-c30a-44b1-9f6b-2182ff3b356d	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:06:39.057
210	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	13290e3e-4e4d-4f95-8fb7-56080ed58d12	\N	{"refId": "16", "entryNo": "JE-GL-2569-000012", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 05:06:39.193
207	0da099da-808e-4ca8-b011-9513498089aa	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	2fd51c70-25af-42fe-80c8-74203841a6c3	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 05:06:38.832
208	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	b548627b-acbd-4ac3-afc6-944eb97f0858	\N	{"refId": "21", "entryNo": "JE-GL-2569-000011", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 05:06:38.95
211	cbea97c4-1c8f-4f1a-8c66-71c864947d9a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	784c7eb6-c877-4f85-a1cd-1556bde98e3a	\N	\N	\N	\N	\N	2026-07-06 05:06:40.005
212	f0958bf7-85ec-420a-8822-9757f5820bcd	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:24:59.545
213	bc32ca6b-3968-438e-b307-e12255ffbb52	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:24:59.547
214	287161f9-1c06-40cc-b682-f95d8ac19def	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:24:59.549
215	780b2f69-f250-4ab4-b73e-f3fea231a234	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 05:24:59.551
216	b364f7a8-8e8b-4f4f-bfe4-b76e9be0df44	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:24:59.582
217	704eae67-21df-4a51-ba1c-c517e947e9e2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	f31bb720-310f-476e-a57a-72844b8f1ca3	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783315496827", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:25:02.581
218	2d4a1d30-6322-4653-99f1-72cc34e81635	f31bb720-310f-476e-a57a-72844b8f1ca3	auth.login_success	user	f31bb720-310f-476e-a57a-72844b8f1ca3	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:25:03.332
219	03b01bc0-37b8-4a00-b2c2-90cae3f32847	f31bb720-310f-476e-a57a-72844b8f1ca3	auth.password_changed	user	f31bb720-310f-476e-a57a-72844b8f1ca3	\N	\N	\N	\N	\N	2026-07-06 05:25:04.274
220	b12099f3-29c8-4ec0-9139-cd77c4ea64ff	f31bb720-310f-476e-a57a-72844b8f1ca3	auth.totp_enabled	user	f31bb720-310f-476e-a57a-72844b8f1ca3	\N	\N	\N	\N	\N	2026-07-06 05:25:04.732
221	cd5800ef-ae98-4181-b47c-fd9ea9b6af37	f31bb720-310f-476e-a57a-72844b8f1ca3	auth.login_success	user	f31bb720-310f-476e-a57a-72844b8f1ca3	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 05:25:05.817
222	b7a4626a-e819-4745-8944-7d1736f72bcb	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	dd0bd7a1-e049-4028-b68f-884a6fc11aae	\N	{"type": "REPAIR", "docNo": "WOR-HQ-2569-000007"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:25:11.128
223	94fc2473-a531-4df9-b5b6-ef723200b41a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	913a329f-7451-4cfc-b1f1-c309cb8340c6	\N	{"refId": "3609b637-81c8-4a3a-8b4d-5c9b40a58cb7", "entryNo": "JE-GL-2569-000013", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 05:25:11.218
224	94fc2473-a531-4df9-b5b6-ef723200b41a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	3609b637-81c8-4a3a-8b4d-5c9b40a58cb7	\N	{"docNo": "EXP-HQ-2569-000005", "amountSatang": "123400", "expenseAccountCode": "5000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:25:11.245
225	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	01854c34-e942-4004-83e6-a516032914de	\N	{"code": "CUS-000009", "name": "ลูกค้าทดสอบ E2E 1783315507201"}	\N	\N	\N	2026-07-06 05:25:11.659
226	ab897432-a545-4059-a851-1073c4a64637	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	24560b44-fd18-4bee-81ad-b0d943f1119a	\N	{"docNo": "PWN-HQ-2569-000009", "dueDate": "2026-08-06T05:25:11.579Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:25:11.664
227	f8018b97-9f15-41c7-b786-de011c4bc835	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	2d107340-fdea-4992-b9c6-65a4233efab6	\N	{"docNo": "SAV-HQ-2569-000008", "accountType": "CASH_SAVINGS"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:25:11.72
228	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	5767ee5d-fda6-4c64-b1e0-900bc6aef6f2	\N	{"refId": "17", "entryNo": "JE-GL-2569-000014", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 05:25:11.943
229	654e756c-f91d-418c-b40a-7cae188efcdf	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	777bf21e-8a0c-411d-895c-4110d1166e26	\N	{"note": null, "barBuy": "5094000", "barSell": "5104000", "ornamentBuy": "5052200", "ornamentSell": "5975000", "basedOnFeedId": "3e25eae1-a273-4b2e-a987-171675687d15"}	\N	\N	\N	2026-07-06 05:25:13.603
230	e490dbdc-0904-458a-a155-d576c0decef9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	dd0bd7a1-e049-4028-b68f-884a6fc11aae	\N	\N	\N	\N	\N	2026-07-06 05:25:15.688
231	cbfd1047-de4c-4216-96e9-10da2c490928	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	24560b44-fd18-4bee-81ad-b0d943f1119a	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 05:25:16.254
232	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	0f484da2-a2e2-45d0-a670-3acc890e3158	\N	{"refId": "18", "entryNo": "JE-GL-2569-000015", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 05:25:16.311
233	fea2c089-538f-4e06-978e-d7ad0dd6be0c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	dd0bd7a1-e049-4028-b68f-884a6fc11aae	\N	\N	\N	\N	\N	2026-07-06 05:25:16.569
234	4475365d-64dc-4877-88d0-51fc54c41eb1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	2d107340-fdea-4992-b9c6-65a4233efab6	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 05:25:16.808
235	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	e21460e7-26d9-408c-a529-e4576287b87b	\N	{"refId": "23", "entryNo": "JE-GL-2569-000016", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 05:25:16.868
236	0afc1fe6-520b-4cc1-8daa-842a60b4fa65	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	dd0bd7a1-e049-4028-b68f-884a6fc11aae	\N	\N	\N	\N	\N	2026-07-06 05:25:17.046
237	3e6ee9b3-ea7c-4757-b94f-5f3f491576a1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	2d107340-fdea-4992-b9c6-65a4233efab6	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 05:25:17.516
238	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	22f25776-8613-49d2-b381-538055c8368a	\N	{"refId": "24", "entryNo": "JE-GL-2569-000017", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 05:25:17.589
239	f08cacfb-5899-4ba3-b275-ee4b48739d05	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:06:59.627
240	a8f9b589-e68a-4e69-8c41-44f5515ba0d1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	{"code": "CTE021602", "name": "สาขาทดสอบ E2E CTE021602"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:07:03.786
241	9e6dd212-350e-4a56-8984-6edce9dc1007	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:08:01.158
242	f808221a-e61e-4be9-a711-5ae1620ef512	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	00538a12-1d56-4be0-98b8-99eae96b994e	\N	{"code": "CTE083176", "name": "สาขาทดสอบ E2E CTE083176"}	00538a12-1d56-4be0-98b8-99eae96b994e	\N	\N	2026-07-06 06:08:05.178
243	2b643217-097b-40cb-9419-f0890a55964f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:08:58.012
244	3d33bfee-9ea1-4ad0-a7b1-ae0066276e00	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	aff7cc5c-564f-4ea8-8b7d-500e4131ced5	\N	{"code": "CTE140023", "name": "สาขาทดสอบ E2E CTE140023"}	aff7cc5c-564f-4ea8-8b7d-500e4131ced5	\N	\N	2026-07-06 06:09:02.088
245	5d2ec3af-cbb5-499b-9a64-814a24612770	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:09:40.158
246	db6d1a28-0dfe-4f45-9f6f-a0d276766e9f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	ecea1827-213a-4f4b-ad62-91f1b02bfc40	\N	{"code": "CTE182161", "name": "สาขาทดสอบ E2E CTE182161"}	ecea1827-213a-4f4b-ad62-91f1b02bfc40	\N	\N	2026-07-06 06:09:44.186
247	d9bbdfda-a6d8-464c-89a3-34991bda80df	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.create	cash_transfer	c06535f0-d1b2-46ee-9b88-b5189765b0a3	\N	{"docNo": "CTF-HQ-2569-000001", "toBranchId": "ecea1827-213a-4f4b-ad62-91f1b02bfc40", "amountSatang": "1234500", "fromBranchId": "c4b3f601-0a95-485c-ab49-fa23c5f5196a"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:09:45.796
248	e4450560-bfbd-4128-80ee-41a2d98121b5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.cancel	cash_transfer	c06535f0-d1b2-46ee-9b88-b5189765b0a3	{"status": "DRAFT"}	{"status": "CANCELLED"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:09:46.646
249	60f1a2f1-92a3-448a-bcda-12f5aa8d3372	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:15.095
250	440b1a4d-9655-442b-80c8-7ac8ff7e66be	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:15.116
251	33f4a599-ffcb-4190-bb13-3e25f672c971	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:15.161
252	7f19419b-02ba-458c-9647-587f395a4db2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:15.163
253	ec516df4-b051-4e33-a002-546403cfc0b0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:15.168
254	38342cf3-424f-43e9-84f3-f6235d6ebb92	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	4f9a0c71-128f-4b9d-853e-2b6561d65d00	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783318211016", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:10:19.736
255	68de6133-2970-4485-99f1-8d03d2b070ac	4f9a0c71-128f-4b9d-853e-2b6561d65d00	auth.login_success	user	4f9a0c71-128f-4b9d-853e-2b6561d65d00	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:21.421
256	b3538da2-6daa-4ef8-9fb4-4f83b1240043	4f9a0c71-128f-4b9d-853e-2b6561d65d00	auth.password_changed	user	4f9a0c71-128f-4b9d-853e-2b6561d65d00	\N	\N	\N	\N	\N	2026-07-06 06:10:22.923
257	65e20ced-ab5d-4e39-b1f6-78646f70d7d3	4f9a0c71-128f-4b9d-853e-2b6561d65d00	auth.totp_enabled	user	4f9a0c71-128f-4b9d-853e-2b6561d65d00	\N	\N	\N	\N	\N	2026-07-06 06:10:23.944
258	815fa1ac-e8c2-4bc9-a39d-19772cbf7c6a	4f9a0c71-128f-4b9d-853e-2b6561d65d00	auth.login_success	user	4f9a0c71-128f-4b9d-853e-2b6561d65d00	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:10:26.007
259	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	d2dcfd0a-8102-4c24-81ce-c1b10a50b188	\N	{"code": "CUS-000010", "name": "ลูกค้าทดสอบ E2E 1783318227871"}	\N	\N	\N	2026-07-06 06:10:34.266
260	f69a7548-3e42-4218-a2ce-19a26a679469	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	9b270907-7025-49d6-914a-c08fa13aa470	\N	{"code": "CTE227588", "name": "สาขาทดสอบ E2E CTE227588"}	9b270907-7025-49d6-914a-c08fa13aa470	\N	\N	2026-07-06 06:10:34.406
261	b9377c2e-17a7-45ca-9789-08b5a94da5fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	881392c3-e7c4-4fb0-9998-5a57151e26c7	\N	{"type": "REPAIR", "docNo": "WOR-CTE021602-2569-000001"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:10:34.508
262	bdd680d5-feda-41c3-a4cf-8970ff6973cb	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	98b65d35-618e-48fb-bf79-68e33b03dae4	\N	{"docNo": "PWN-CTE021602-2569-000001", "dueDate": "2026-08-06T06:10:34.434Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:10:34.663
263	825a1b03-7a40-4b04-8db0-e009e3f7a206	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	6a4cd1b0-5b33-49f0-97a0-c14525779ecd	\N	{"docNo": "SAV-CTE021602-2569-000001", "accountType": "CASH_SAVINGS"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:10:34.676
264	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	b9ecf1e7-3628-4edf-b7c3-9322fb296b7d	\N	{"refId": "19", "entryNo": "JE-GL-2569-000018", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 06:10:35.156
268	ed1ab0a0-8e42-4cfb-be87-e4e5f18cd0a6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	9df89045-9b67-4d66-9ad0-89fd6991d417	\N	{"note": null, "barBuy": "5095000", "barSell": "5105000", "ornamentBuy": "5053200", "ornamentSell": "5975000", "basedOnFeedId": "65d2743e-1a4d-4e7d-b28f-66278203347a"}	\N	\N	\N	2026-07-06 06:10:41.076
276	bd9d8e71-2293-42f9-a585-dac12335411a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	6a4cd1b0-5b33-49f0-97a0-c14525779ecd	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 06:10:45.072
277	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	fb536cbf-37c6-4415-abb7-a08d6c855d2e	\N	{"refId": "27", "entryNo": "JE-GL-2569-000022", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 06:10:45.127
265	88907e6f-8466-4f56-af9b-10324cfaa284	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	541e5024-bcd7-4740-ad2b-1b31f2bb1ba6	\N	{"refId": "51a71c75-4301-43c9-87fb-8a4f37fa1ad6", "entryNo": "JE-GL-2569-000019", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 06:10:36.549
266	88907e6f-8466-4f56-af9b-10324cfaa284	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	51a71c75-4301-43c9-87fb-8a4f37fa1ad6	\N	{"docNo": "EXP-CTE021602-2569-000001", "amountSatang": "123400", "expenseAccountCode": "5000"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:10:36.572
270	94c88e21-6289-4f20-9858-50fa9843e3ca	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	881392c3-e7c4-4fb0-9998-5a57151e26c7	\N	\N	\N	\N	\N	2026-07-06 06:10:43.806
267	a3d74d46-a3e3-4a88-823a-280ca17e2159	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.create	cash_transfer	352526e3-986d-415c-9ed4-1664bfb19f6a	\N	{"docNo": "CTF-HQ-2569-000002", "toBranchId": "9b270907-7025-49d6-914a-c08fa13aa470", "amountSatang": "1234500", "fromBranchId": "c4b3f601-0a95-485c-ab49-fa23c5f5196a"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:10:40.815
271	10a06b2d-609e-4089-8376-1383b28db056	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	98b65d35-618e-48fb-bf79-68e33b03dae4	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:10:43.825
273	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	3e1a1946-1bfc-4b4c-b845-be4609e09c25	\N	{"refId": "20", "entryNo": "JE-GL-2569-000020", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 06:10:44.023
269	c8d0fa55-e0ba-4dd4-b40c-f9ee45a5223c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	881392c3-e7c4-4fb0-9998-5a57151e26c7	\N	\N	\N	\N	\N	2026-07-06 06:10:42.702
272	13e7c290-1b55-4868-9762-724c153bbfa7	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	6a4cd1b0-5b33-49f0-97a0-c14525779ecd	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 06:10:43.935
274	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	87c1b1b8-774c-431a-b5e2-4dbbdea898d4	\N	{"refId": "26", "entryNo": "JE-GL-2569-000021", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 06:10:44.101
275	20075de3-784a-4263-9a55-4fc4fab50169	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	881392c3-e7c4-4fb0-9998-5a57151e26c7	\N	\N	\N	\N	\N	2026-07-06 06:10:44.494
278	0631243e-f962-4a7d-9102-023bc35683fa	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:11:15.444
279	617b94f4-36bb-44d8-871f-7a30cc5433f6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	4937ecef-2a36-4f6c-b734-a7dd875f9baa	\N	{"note": null, "barBuy": "5089000", "barSell": "5099000", "ornamentBuy": "5047200", "ornamentSell": "5975000", "basedOnFeedId": "bf10b7df-29d0-49b5-9849-a1b052a581a8"}	\N	\N	\N	2026-07-06 06:11:20.369
280	1c0397ee-db65-4bc0-8fde-a7cce903168f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:15.706
281	f18f18eb-7ee3-4b75-9f16-7cabad5909e5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:15.708
282	2d371262-3a35-4598-be11-ac1f4a3e0c6c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:15.711
283	f49563bc-1de0-400c-b9dd-017b0c65fb13	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:15.753
284	0e13074b-a909-4134-8380-db61040fc812	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:15.767
285	ce64808c-6563-4d0b-bb67-81211362652b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	89110bb3-4b20-4c4f-bf79-fba611c411f8	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783319051525", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:24:20.365
286	ccf32f05-b0a4-4e0e-b1aa-824ec34a0ebe	89110bb3-4b20-4c4f-bf79-fba611c411f8	auth.login_success	user	89110bb3-4b20-4c4f-bf79-fba611c411f8	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:22.074
287	124eca86-2e44-4100-b516-81a7022acf5e	89110bb3-4b20-4c4f-bf79-fba611c411f8	auth.password_changed	user	89110bb3-4b20-4c4f-bf79-fba611c411f8	\N	\N	\N	\N	\N	2026-07-06 06:24:23.583
288	4af616b9-8c81-4607-925e-b6777802b76a	89110bb3-4b20-4c4f-bf79-fba611c411f8	auth.totp_enabled	user	89110bb3-4b20-4c4f-bf79-fba611c411f8	\N	\N	\N	\N	\N	2026-07-06 06:24:24.569
289	4e61aff4-b648-4add-b371-1c13a5e691ed	89110bb3-4b20-4c4f-bf79-fba611c411f8	auth.login_success	user	89110bb3-4b20-4c4f-bf79-fba611c411f8	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:24:26.53
290	55316114-608f-452b-a05d-ba981e85fdf3	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	7fd66471-d6f5-438b-ae93-450ff02ff5f2	\N	{"docNo": "SAV-CTE021602-2569-000002", "accountType": "CASH_SAVINGS"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:24:34.774
291	8a040831-f0d2-490c-b05e-d16a69d33caf	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	827bac65-b57c-4a29-8b9e-0da54ce14772	\N	{"type": "REPAIR", "docNo": "WOR-CTE021602-2569-000002"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:24:34.975
292	cb217b70-e4f1-4e20-931a-58acced92ad1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	096cdcea-c4f1-43d3-aae0-eafea12940bd	\N	{"docNo": "PWN-CTE021602-2569-000002", "dueDate": "2026-08-06T06:24:34.921Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:24:35.051
293	f6c9eda9-cacd-47c1-8844-a1471616cdf0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	4cd88678-491d-42b1-bf01-af0658cc3823	\N	{"code": "CTE068369", "name": "สาขาทดสอบ E2E CTE068369"}	4cd88678-491d-42b1-bf01-af0658cc3823	\N	\N	2026-07-06 06:24:35.065
294	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	6862fc8d-44d0-4aa5-8cda-e9af6c2ad5ef	\N	{"refId": "21", "entryNo": "JE-GL-2569-000023", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 06:24:35.393
295	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	866bb505-e287-46fa-89ce-12133fcc586b	\N	{"code": "CUS-000011", "name": "ลูกค้าทดสอบ E2E 1783319068439"}	\N	\N	\N	2026-07-06 06:24:35.77
296	805f4aa9-fd2f-4721-ab7c-1d748e6cab4a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	e7e083c9-d36e-4ce9-adb4-a3e2fb1a93d2	\N	{"refId": "44daa846-7107-45da-8141-69a6617d4429", "entryNo": "JE-GL-2569-000024", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 06:24:36.642
297	805f4aa9-fd2f-4721-ab7c-1d748e6cab4a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	44daa846-7107-45da-8141-69a6617d4429	\N	{"docNo": "EXP-CTE021602-2569-000002", "amountSatang": "123400", "expenseAccountCode": "5000"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:24:36.664
298	9c7c5164-a568-451c-876f-f2b222230834	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.create	cash_transfer	9d239106-f43c-4f68-8315-3f3ef9e70f81	\N	{"docNo": "CTF-HQ-2569-000003", "toBranchId": "4cd88678-491d-42b1-bf01-af0658cc3823", "amountSatang": "1234500", "fromBranchId": "c4b3f601-0a95-485c-ab49-fa23c5f5196a"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:24:42.201
299	f8192089-45d5-46ac-9595-3bbd83091ec6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	afe47a37-8f39-4c57-8571-d56768f37af7	\N	{"note": null, "barBuy": "5089000", "barSell": "5099000", "ornamentBuy": "5047200", "ornamentSell": "5975000", "basedOnFeedId": "bf10b7df-29d0-49b5-9849-a1b052a581a8"}	\N	\N	\N	2026-07-06 06:24:42.298
300	eff5e80b-c053-4758-b3a7-d7b4c3f03229	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	096cdcea-c4f1-43d3-aae0-eafea12940bd	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:24:43.937
301	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	e99bf889-a1ff-43a8-bfe5-e971c92b265b	\N	{"refId": "22", "entryNo": "JE-GL-2569-000025", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 06:24:44.052
302	d756f8f7-7f77-4322-93a1-3c0699ce3246	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	7fd66471-d6f5-438b-ae93-450ff02ff5f2	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 06:24:44.216
303	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	1132eed9-f627-4a5f-b3d1-45f045d7eb14	\N	{"refId": "29", "entryNo": "JE-GL-2569-000026", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 06:24:44.315
306	1cc2c871-48c4-4397-a4bd-14a1792abab9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	827bac65-b57c-4a29-8b9e-0da54ce14772	\N	\N	\N	\N	\N	2026-07-06 06:24:45.469
304	90b6a2cc-cbce-43b3-a502-45b9a908f36b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	827bac65-b57c-4a29-8b9e-0da54ce14772	\N	\N	\N	\N	\N	2026-07-06 06:24:44.37
305	66c8f85f-9f00-4b9e-b8d8-88c0f1826867	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	7fd66471-d6f5-438b-ae93-450ff02ff5f2	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 06:24:45.436
307	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	dfb1b9ba-5f34-49b1-a08a-c7fdffcc8175	\N	{"refId": "30", "entryNo": "JE-GL-2569-000027", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 06:24:45.638
308	a050b4ca-3e78-4208-92b1-5e7c6ef682fd	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	827bac65-b57c-4a29-8b9e-0da54ce14772	\N	\N	\N	\N	\N	2026-07-06 06:24:46.24
309	2a552e8a-227b-4557-8e51-12dc08a9699e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:25:25.186
310	70fb3ec5-7e94-4868-a8fd-7523f2982178	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	ba6c1de0-e53b-4743-89c7-d090294104a0	\N	{"code": "CTE127226", "name": "สาขาทดสอบ E2E CTE127226"}	ba6c1de0-e53b-4743-89c7-d090294104a0	\N	\N	2026-07-06 06:25:29.484
311	27068585-c53f-4079-9535-f8287aea5ccc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.create	cash_transfer	f2ec769d-a529-400f-b499-accc72b9fce2	\N	{"docNo": "CTF-HQ-2569-000004", "toBranchId": "ba6c1de0-e53b-4743-89c7-d090294104a0", "amountSatang": "1234500", "fromBranchId": "c4b3f601-0a95-485c-ab49-fa23c5f5196a"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:25:31.827
312	ca762c0e-9135-43e5-9534-9049a506ee0f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:23.455
313	132efe85-861b-4319-9442-bd80dbdecc14	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	93b355aa-c19c-4cd8-bb83-d9fbe7ab31f0	\N	{"code": "CTE185496", "name": "สาขาทดสอบ E2E CTE185496"}	93b355aa-c19c-4cd8-bb83-d9fbe7ab31f0	\N	\N	2026-07-06 06:26:27.515
314	4c2fb308-65ba-4ec0-a786-0614a073f85a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.create	cash_transfer	b7bb3382-79ec-450d-b5ab-362e5deb096b	\N	{"docNo": "CTF-HQ-2569-000005", "toBranchId": "93b355aa-c19c-4cd8-bb83-d9fbe7ab31f0", "amountSatang": "1234500", "fromBranchId": "c4b3f601-0a95-485c-ab49-fa23c5f5196a"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:26:29.222
315	ed529147-0f5c-4354-9c51-09bed0937835	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.cancel	cash_transfer	b7bb3382-79ec-450d-b5ab-362e5deb096b	{"status": "DRAFT"}	{"status": "CANCELLED"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:26:29.666
316	e0d7bc63-c169-4d3c-b575-229f2c1315a9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_failed	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	{"reason": "wrong_password", "attempts": 1}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:53.031
317	1296675d-c87e-47d3-9d1f-79f06eacc26e	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:53.038
318	63b29f45-5870-497f-a3ce-8167ee4f9620	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:53.041
319	04b28d14-62bc-45ed-9237-138c9021ccb0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:53.049
320	05ed535f-3a74-48cc-b043-4a46fd9eb8e9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	auth.login_success	user	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:53.103
321	412bea99-ea55-4bc4-8c8a-ec6f4efdf0a2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	user.create	user	a9babdcf-7232-4243-9bec-8ef76e94f2f9	\N	{"roleId": "1560e21d-ac2b-47da-a03b-16745fba2081", "username": "e2e1783319208940", "displayName": "พนักงานทดสอบ E2E"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:26:57.76
322	7500b164-0fce-4d05-b1ee-90402affd70b	a9babdcf-7232-4243-9bec-8ef76e94f2f9	auth.login_success	user	a9babdcf-7232-4243-9bec-8ef76e94f2f9	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:26:59.482
323	e289c73e-16a2-455c-8503-51cce565d86b	a9babdcf-7232-4243-9bec-8ef76e94f2f9	auth.password_changed	user	a9babdcf-7232-4243-9bec-8ef76e94f2f9	\N	\N	\N	\N	\N	2026-07-06 06:27:01.026
324	66f18517-01b5-492b-8505-8a8eb741f5d7	a9babdcf-7232-4243-9bec-8ef76e94f2f9	auth.totp_enabled	user	a9babdcf-7232-4243-9bec-8ef76e94f2f9	\N	\N	\N	\N	\N	2026-07-06 06:27:02.149
325	5d3a8ce2-d5f7-4c4b-820d-755a27098354	a9babdcf-7232-4243-9bec-8ef76e94f2f9	auth.login_success	user	a9babdcf-7232-4243-9bec-8ef76e94f2f9	\N	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36	2026-07-06 06:27:03.705
326	3fcb9f81-3a85-4004-a898-426ac51b1ab5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	branch.create	branch	7bd9a0bf-d41a-47c2-aafc-1e5890a23175	\N	{"code": "CTE225481", "name": "สาขาทดสอบ E2E CTE225481"}	7bd9a0bf-d41a-47c2-aafc-1e5890a23175	\N	\N	2026-07-06 06:27:11.919
327	6b0139bb-29fb-4273-883a-da37c13e4657	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.open	savings_account	0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	\N	{"docNo": "SAV-CTE021602-2569-000003", "accountType": "CASH_SAVINGS"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:27:12.572
328	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	customer.create	customer	229b4a20-9c46-4d33-8a37-7702d2085bbd	\N	{"code": "CUS-000012", "name": "ลูกค้าทดสอบ E2E 1783319225568"}	\N	\N	\N	2026-07-06 06:27:12.754
329	abcc010c-5a6a-4d70-b34d-f8e131a5e5e8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.create	work_order	33ed5886-b78a-4dd2-bdbe-580d4af91425	\N	{"type": "REPAIR", "docNo": "WOR-CTE021602-2569-000003"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:27:12.776
330	cde7ea99-49aa-4eaf-b027-396830123f5d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.open	pawn_contract	5cf59ee3-82c7-4669-8218-42e8d7a55ca4	\N	{"docNo": "PWN-CTE021602-2569-000003", "dueDate": "2026-08-06T06:27:12.786Z", "termMonths": 1, "principalSatang": "1000000", "annualInterestRatePercent": 15}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:27:13.274
331	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	7822fbe9-b9ee-44f1-93a0-c0bd3b7e623e	\N	{"refId": "23", "entryNo": "JE-GL-2569-000028", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 06:27:13.488
332	127e7fae-52a4-4448-a167-dd514da90ab8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	1d30938a-763c-494d-95e2-beadd9ebb599	\N	{"refId": "243be05f-1c66-40d5-a388-285b0391a9d3", "entryNo": "JE-GL-2569-000029", "refType": "expense", "totalDebitSatang": "123400"}	\N	\N	\N	2026-07-06 06:27:14.198
333	127e7fae-52a4-4448-a167-dd514da90ab8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	expense.record	expense	243be05f-1c66-40d5-a388-285b0391a9d3	\N	{"docNo": "EXP-CTE021602-2569-000003", "amountSatang": "123400", "expenseAccountCode": "5000"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:27:14.275
334	d0ee64c8-15af-49bd-b40a-588c46ff529c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	price.announce	shop_price_announcement	20dfa02f-3250-464c-9271-3fa2fb0b8023	\N	{"note": null, "barBuy": "5090000", "barSell": "5100000", "ornamentBuy": "5048200", "ornamentSell": "5975000", "basedOnFeedId": "b9c8648f-a002-4a41-8102-ac1a4639ebef"}	\N	\N	\N	2026-07-06 06:27:19.063
335	7cda09c9-35a6-4cc3-ae38-3673be07f2fd	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.create	cash_transfer	061b40a8-70aa-4524-bfb9-8d073a1f6fb1	\N	{"docNo": "CTF-HQ-2569-000006", "toBranchId": "7bd9a0bf-d41a-47c2-aafc-1e5890a23175", "amountSatang": "1234500", "fromBranchId": "c4b3f601-0a95-485c-ab49-fa23c5f5196a"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:27:19.791
339	e6f8adbd-c469-4814-828d-6cf985cfb767	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.deposit	savings_account	0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	\N	{"amountSatang": "100000"}	\N	\N	\N	2026-07-06 06:27:21.98
340	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	1cb2e668-bc98-4f96-9fb8-2ad3a2289c10	\N	{"refId": "32", "entryNo": "JE-GL-2569-000030", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 06:27:22.078
344	e3ac8442-0083-42c8-b8fc-3d0961ec03bf	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	savings.close_cash	savings_account	0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	\N	{"refundSatang": "100000"}	\N	\N	\N	2026-07-06 06:27:22.923
345	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	1a6a32d3-8a7f-4c6f-a072-af6e2d68c29a	\N	{"refId": "33", "entryNo": "JE-GL-2569-000032", "refType": "savings_transaction", "totalDebitSatang": "100000"}	\N	\N	\N	2026-07-06 06:27:22.999
336	ad987afa-80b8-441a-9f7f-4f447f371976	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cash_transfer.cancel	cash_transfer	061b40a8-70aa-4524-bfb9-8d073a1f6fb1	{"status": "DRAFT"}	{"status": "CANCELLED"}	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	\N	2026-07-06 06:27:20.772
337	ca00c79e-d3e0-451c-ae10-f7c95386855a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.start	work_order	33ed5886-b78a-4dd2-bdbe-580d4af91425	\N	\N	\N	\N	\N	2026-07-06 06:27:20.78
338	9f8c8f95-7d1d-4799-8633-6d5bc9936970	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.complete	work_order	33ed5886-b78a-4dd2-bdbe-580d4af91425	\N	\N	\N	\N	\N	2026-07-06 06:27:21.616
341	5ff14138-5e6a-4570-be5a-6b299a00e8a3	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	pawn.redeem	pawn_contract	5cf59ee3-82c7-4669-8218-42e8d7a55ca4	\N	{"interestSatang": "0", "totalPayableSatang": "1000000"}	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	\N	2026-07-06 06:27:22.227
342	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	accounting.post	journal_entry	95a07afc-083b-4fe1-b59a-6fcf8cf69687	\N	{"refId": "24", "entryNo": "JE-GL-2569-000031", "refType": "pawn_event", "totalDebitSatang": "1000000"}	\N	\N	\N	2026-07-06 06:27:22.288
343	fe3195d9-1e48-4feb-a462-7aa870ce99af	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	workorder.deliver	work_order	33ed5886-b78a-4dd2-bdbe-580d4af91425	\N	\N	\N	\N	\N	2026-07-06 06:27:22.619
\.


--
-- Data for Name: branch_transfer_items; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.branch_transfer_items (transfer_id, item_id) FROM stdin;
\.


--
-- Data for Name: branch_transfers; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.branch_transfers (id, doc_no, from_branch_id, to_branch_id, status, created_by, sent_by, sent_at, received_by, received_at, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.branches (id, code, name, address, is_active, created_at, updated_at) FROM stdin;
c4b3f601-0a95-485c-ab49-fa23c5f5196a	HQ	สำนักงานใหญ่	\N	t	2026-07-05 11:15:29.641	2026-07-05 11:15:29.641
fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	CTE021602	สาขาทดสอบ E2E CTE021602	\N	t	2026-07-06 06:07:03.781	2026-07-06 06:07:03.781
00538a12-1d56-4be0-98b8-99eae96b994e	CTE083176	สาขาทดสอบ E2E CTE083176	\N	t	2026-07-06 06:08:05.174	2026-07-06 06:08:05.174
aff7cc5c-564f-4ea8-8b7d-500e4131ced5	CTE140023	สาขาทดสอบ E2E CTE140023	\N	t	2026-07-06 06:09:02.083	2026-07-06 06:09:02.083
ecea1827-213a-4f4b-ad62-91f1b02bfc40	CTE182161	สาขาทดสอบ E2E CTE182161	\N	t	2026-07-06 06:09:44.182	2026-07-06 06:09:44.182
9b270907-7025-49d6-914a-c08fa13aa470	CTE227588	สาขาทดสอบ E2E CTE227588	\N	t	2026-07-06 06:10:34.387	2026-07-06 06:10:34.387
4cd88678-491d-42b1-bf01-af0658cc3823	CTE068369	สาขาทดสอบ E2E CTE068369	\N	t	2026-07-06 06:24:35.056	2026-07-06 06:24:35.056
ba6c1de0-e53b-4743-89c7-d090294104a0	CTE127226	สาขาทดสอบ E2E CTE127226	\N	t	2026-07-06 06:25:29.48	2026-07-06 06:25:29.48
93b355aa-c19c-4cd8-bb83-d9fbe7ab31f0	CTE185496	สาขาทดสอบ E2E CTE185496	\N	t	2026-07-06 06:26:27.511	2026-07-06 06:26:27.511
7bd9a0bf-d41a-47c2-aafc-1e5890a23175	CTE225481	สาขาทดสอบ E2E CTE225481	\N	t	2026-07-06 06:27:11.911	2026-07-06 06:27:11.911
\.


--
-- Data for Name: cash_drawers; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.cash_drawers (id, branch_id, code, name, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cash_transfers; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.cash_transfers (id, doc_no, from_branch_id, to_branch_id, from_drawer_id, to_drawer_id, amount_satang, status, created_by, sent_by, sent_at, received_by, received_at, note, created_at, updated_at) FROM stdin;
c06535f0-d1b2-46ee-9b88-b5189765b0a3	CTF-HQ-2569-000001	c4b3f601-0a95-485c-ab49-fa23c5f5196a	ecea1827-213a-4f4b-ad62-91f1b02bfc40	\N	\N	1234500	CANCELLED	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N		2026-07-06 06:09:45.788	2026-07-06 06:09:46.642
352526e3-986d-415c-9ed4-1664bfb19f6a	CTF-HQ-2569-000002	c4b3f601-0a95-485c-ab49-fa23c5f5196a	9b270907-7025-49d6-914a-c08fa13aa470	\N	\N	1234500	DRAFT	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N		2026-07-06 06:10:40.805	2026-07-06 06:10:40.805
9d239106-f43c-4f68-8315-3f3ef9e70f81	CTF-HQ-2569-000003	c4b3f601-0a95-485c-ab49-fa23c5f5196a	4cd88678-491d-42b1-bf01-af0658cc3823	\N	\N	1234500	DRAFT	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N		2026-07-06 06:24:42.133	2026-07-06 06:24:42.133
f2ec769d-a529-400f-b499-accc72b9fce2	CTF-HQ-2569-000004	c4b3f601-0a95-485c-ab49-fa23c5f5196a	ba6c1de0-e53b-4743-89c7-d090294104a0	\N	\N	1234500	DRAFT	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N		2026-07-06 06:25:31.82	2026-07-06 06:25:31.82
b7bb3382-79ec-450d-b5ab-362e5deb096b	CTF-HQ-2569-000005	c4b3f601-0a95-485c-ab49-fa23c5f5196a	93b355aa-c19c-4cd8-bb83-d9fbe7ab31f0	\N	\N	1234500	CANCELLED	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N		2026-07-06 06:26:29.216	2026-07-06 06:26:29.661
061b40a8-70aa-4524-bfb9-8d073a1f6fb1	CTF-HQ-2569-000006	c4b3f601-0a95-485c-ab49-fa23c5f5196a	7bd9a0bf-d41a-47c2-aafc-1e5890a23175	\N	\N	1234500	CANCELLED	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N		2026-07-06 06:27:19.779	2026-07-06 06:27:20.766
\.


--
-- Data for Name: commissions; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.commissions (id, staff_id, sales_order_id, period_id, rate_percent, amount_satang, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.customers (id, code, name, phone, address, note, citizen_id_enc, citizen_id_hash, loyalty_points, tier, consent_given_at, consent_withdrawn_at, anonymized_at, created_by, created_at, updated_at) FROM stdin;
e9dbc163-541d-46d0-837e-ccaccd2f3cc6	CUS-000001	ลูกค้าทดสอบ E2E 1783308246543	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:24:09.815	2026-07-06 03:24:09.815
f47fa2f6-e061-4ef3-a35b-ef5f08c10167	CUS-000002	ลูกค้าทดสอบ E2E 1783308305873	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:25:07.758	2026-07-06 03:25:07.758
f979cb5e-d0ac-4e62-8202-3eea8f0a06ff	CUS-000003	ลูกค้าทดสอบ E2E 1783308372565	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:14.24	2026-07-06 03:26:14.24
e8dc1b21-3905-424b-ade4-a75ca47ff37a	CUS-000004	ลูกค้าทดสอบ E2E 1783308398737	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:40.427	2026-07-06 03:26:40.427
0e408aef-83b8-4ea0-be25-037eb93543b7	CUS-000005	ลูกค้าทดสอบ E2E 1783308800870	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:24.521	2026-07-06 03:33:24.521
902c23b6-c48a-44ca-8bbd-69cf9301f493	CUS-000006	ลูกค้าทดสอบ E2E 1783312907472	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:49.382	2026-07-06 04:41:49.382
a7b90d6f-ee3c-407e-bcc4-64e064f9b5f1	CUS-000007	ลูกค้าทดสอบ E2E 1783314046643	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:53.797	2026-07-06 05:00:53.797
69c1fe00-19bc-4c65-99ad-e29e3de5cd23	CUS-000008	ลูกค้าทดสอบ E2E 1783314383700	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:30.58	2026-07-06 05:06:30.58
01854c34-e942-4004-83e6-a516032914de	CUS-000009	ลูกค้าทดสอบ E2E 1783315507201	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.651	2026-07-06 05:25:11.651
d2dcfd0a-8102-4c24-81ce-c1b10a50b188	CUS-000010	ลูกค้าทดสอบ E2E 1783318227871	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:34.252	2026-07-06 06:10:34.252
866bb505-e287-46fa-89ce-12133fcc586b	CUS-000011	ลูกค้าทดสอบ E2E 1783319068439	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:35.766	2026-07-06 06:24:35.766
229b4a20-9c46-4d33-8a37-7702d2085bbd	CUS-000012	ลูกค้าทดสอบ E2E 1783319225568	0812345678	\N	\N	\N	\N	0	BRONZE	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:12.718	2026-07-06 06:27:12.718
\.


--
-- Data for Name: document_sequences; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.document_sequences (key, next_number, updated_at) FROM stdin;
SAV-CTE021602-2569	4	2026-07-06 06:27:12.282
CUS	13	2026-07-06 06:27:12.693
WOR-CTE021602-2569	4	2026-07-06 06:27:12.537
PWN-CTE021602-2569	4	2026-07-06 06:27:12.755
EXP-CTE021602-2569	4	2026-07-06 06:27:13.896
CTF-HQ-2569	7	2026-07-06 06:27:19.631
JE-GL-2569	33	2026-07-06 06:27:22.979
WOR-HQ-2569	8	2026-07-06 05:25:11.09
EXP-HQ-2569	6	2026-07-06 05:25:11.104
PWN-HQ-2569	10	2026-07-06 05:25:11.553
SAV-HQ-2569	9	2026-07-06 05:25:11.628
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.expenses (id, doc_no, branch_id, account_id, amount_satang, description, expense_date, journal_entry_id, created_by, created_at) FROM stdin;
488bffbf-8185-4ca5-80e9-f47e7515ed06	EXP-HQ-2569-000001	c4b3f601-0a95-485c-ab49-fa23c5f5196a	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783312854242	2026-07-06 00:00:00	d5bd5c51-6f4b-4fa4-b2fb-ea051dc316d3	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:40:56.424
f90049d7-52ee-48e1-ba27-981e05f80c0f	EXP-HQ-2569-000002	c4b3f601-0a95-485c-ab49-fa23c5f5196a	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783312883127	2026-07-06 00:00:00	ed5911bd-6e78-4313-a8b6-4254d45d2b29	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:25.287
f2c04a1e-5d12-4b94-b20e-3ecfe1c9c74e	EXP-HQ-2569-000003	c4b3f601-0a95-485c-ab49-fa23c5f5196a	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783314046966	2026-07-06 00:00:00	f7141fc4-b667-4da4-afbc-4f7d5aa03481	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:54.026
10522cfd-2ae2-491d-9674-0c8728eb8853	EXP-HQ-2569-000004	c4b3f601-0a95-485c-ab49-fa23c5f5196a	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783314384609	2026-07-06 00:00:00	27d752e0-5ff8-4869-b957-ff77046eba99	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:31.584
3609b637-81c8-4a3a-8b4d-5c9b40a58cb7	EXP-HQ-2569-000005	c4b3f601-0a95-485c-ab49-fa23c5f5196a	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783315507313	2026-07-06 00:00:00	913a329f-7451-4cfc-b1f1-c309cb8340c6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.124
51a71c75-4301-43c9-87fb-8a4f37fa1ad6	EXP-CTE021602-2569-000001	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783318228764	2026-07-06 00:00:00	541e5024-bcd7-4740-ad2b-1b31f2bb1ba6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:36.23
44daa846-7107-45da-8141-69a6617d4429	EXP-CTE021602-2569-000002	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783319069340	2026-07-06 00:00:00	e7e083c9-d36e-4ce9-adb4-a3e2fb1a93d2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:36.545
243be05f-1c66-40d5-a388-285b0391a9d3	EXP-CTE021602-2569-000003	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	ค่าใช้จ่ายทดสอบ E2E 1783319226633	2026-07-06 00:00:00	1d30938a-763c-494d-95e2-beadd9ebb599	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:13.914
\.


--
-- Data for Name: gold_price_feeds; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.gold_price_feeds (id, source, announced_at, fetched_at, bar_buy, bar_sell, ornament_buy, ornament_sell, raw) FROM stdin;
02e31fcf-4102-4b48-b7cd-acc3517756bc	GTA	2026-07-05 11:55:00	2026-07-05 11:56:31.006	5095000	5105000	5053200	5185000	{"mock": true, "roundNo": "5944175"}
03ef4a9d-2f89-4563-9178-7804a5613d34	GTA	2026-07-06 02:30:00	2026-07-06 02:31:59.062	5088000	5098000	5046200	5178000	{"mock": true, "roundNo": "5944350"}
e34259d6-eded-49ff-978a-c0ddf34fd005	GTA	2026-07-06 02:35:00	2026-07-06 02:37:34.747	5088500	5098500	5046700	5178500	{"mock": true, "roundNo": "5944351"}
3e25eae1-a273-4b2e-a987-171675687d15	GTA	2026-07-06 03:30:00	2026-07-06 03:33:24.42	5094000	5104000	5052200	5184000	{"mock": true, "roundNo": "5944362"}
65d2743e-1a4d-4e7d-b28f-66278203347a	GTA	2026-07-06 05:25:00	2026-07-06 05:25:12.163	5095000	5105000	5053200	5185000	{"mock": true, "roundNo": "5944385"}
bf10b7df-29d0-49b5-9849-a1b052a581a8	GTA	2026-07-06 06:10:00	2026-07-06 06:10:38.798	5089000	5099000	5047200	5179000	{"mock": true, "roundNo": "5944394"}
b9c8648f-a002-4a41-8102-ac1a4639ebef	GTA	2026-07-06 06:20:00	2026-07-06 06:24:39.894	5090000	5100000	5048200	5180000	{"mock": true, "roundNo": "5944396"}
34c9000a-3e62-4abc-8ec9-28f81b8735b2	GTA	2026-07-06 06:25:00	2026-07-06 06:27:16.219	5090500	5100500	5048700	5180500	{"mock": true, "roundNo": "5944397"}
\.


--
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.inventory_items (id, serial_no, product_id, branch_id, status, weight_mg, gold_purity, cost_satang, labor_charge, source, supplier_id, location_id, photo_path, received_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.journal_entries (id, entry_no, period_id, entry_date, description, ref_type, ref_id, is_manual, created_by, created_at, branch_id) FROM stdin;
36dd8d09-de2d-4c55-b2f1-9b21b457514c	JE-GL-2569-000004	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:00:54.413	สัญญาขายฝาก PWN-HQ-2569-000007 — OPEN	pawn_event	13	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:54.673	c4b3f601-0a95-485c-ab49-fa23c5f5196a
9689f965-650e-4347-99ec-94eb7f846cc0	JE-GL-2569-000005	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:01:02.113	สัญญาขายฝาก PWN-HQ-2569-000007 — REDEEM	pawn_event	14	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:01:02.305	c4b3f601-0a95-485c-ab49-fa23c5f5196a
5e6552df-5f53-403b-8812-682bbacdde21	JE-GL-2569-000008	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:06:30.811	สัญญาขายฝาก PWN-HQ-2569-000008 — OPEN	pawn_event	15	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:31.251	c4b3f601-0a95-485c-ab49-fa23c5f5196a
13290e3e-4e4d-4f95-8fb7-56080ed58d12	JE-GL-2569-000012	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:06:39.036	สัญญาขายฝาก PWN-HQ-2569-000008 — REDEEM	pawn_event	16	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:39.175	c4b3f601-0a95-485c-ab49-fa23c5f5196a
5767ee5d-fda6-4c64-b1e0-900bc6aef6f2	JE-GL-2569-000014	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:25:11.656	สัญญาขายฝาก PWN-HQ-2569-000009 — OPEN	pawn_event	17	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.91	c4b3f601-0a95-485c-ab49-fa23c5f5196a
0f484da2-a2e2-45d0-a670-3acc890e3158	JE-GL-2569-000015	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:25:16.246	สัญญาขายฝาก PWN-HQ-2569-000009 — REDEEM	pawn_event	18	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:16.298	c4b3f601-0a95-485c-ab49-fa23c5f5196a
1307cff7-924b-4fe2-bbb5-4079e9cf8d0c	JE-GL-2569-000006	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:01:02.225	บัญชีออมทอง SAV-HQ-2569-000006 — DEPOSIT	savings_transaction	17	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:01:02.579	c4b3f601-0a95-485c-ab49-fa23c5f5196a
ec16bf96-7538-4464-9058-5790fc3f78ab	JE-GL-2569-000007	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:01:03.411	บัญชีออมทอง SAV-HQ-2569-000006 — CLOSE_CASH	savings_transaction	18	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:01:03.509	c4b3f601-0a95-485c-ab49-fa23c5f5196a
b441011d-f240-4aa4-b8b7-5f7ce7d32742	JE-GL-2569-000010	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:06:37.393	บัญชีออมทอง SAV-HQ-2569-000007 — DEPOSIT	savings_transaction	20	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:37.999	c4b3f601-0a95-485c-ab49-fa23c5f5196a
b548627b-acbd-4ac3-afc6-944eb97f0858	JE-GL-2569-000011	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:06:38.809	บัญชีออมทอง SAV-HQ-2569-000007 — CLOSE_CASH	savings_transaction	21	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:38.919	c4b3f601-0a95-485c-ab49-fa23c5f5196a
e21460e7-26d9-408c-a529-e4576287b87b	JE-GL-2569-000016	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:25:16.784	บัญชีออมทอง SAV-HQ-2569-000008 — DEPOSIT	savings_transaction	23	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:16.853	c4b3f601-0a95-485c-ab49-fa23c5f5196a
22f25776-8613-49d2-b381-538055c8368a	JE-GL-2569-000017	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 05:25:17.496	บัญชีออมทอง SAV-HQ-2569-000008 — CLOSE_CASH	savings_transaction	24	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:17.577	c4b3f601-0a95-485c-ab49-fa23c5f5196a
27d752e0-5ff8-4869-b957-ff77046eba99	JE-GL-2569-000009	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-HQ-2569-000004: ค่าใช้จ่ายทดสอบ E2E 1783314384609	expense	10522cfd-2ae2-491d-9674-0c8728eb8853	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:31.608	c4b3f601-0a95-485c-ab49-fa23c5f5196a
913a329f-7451-4cfc-b1f1-c309cb8340c6	JE-GL-2569-000013	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-HQ-2569-000005: ค่าใช้จ่ายทดสอบ E2E 1783315507313	expense	3609b637-81c8-4a3a-8b4d-5c9b40a58cb7	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.194	c4b3f601-0a95-485c-ab49-fa23c5f5196a
d5bd5c51-6f4b-4fa4-b2fb-ea051dc316d3	JE-GL-2569-000001	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-HQ-2569-000001: ค่าใช้จ่ายทดสอบ E2E 1783312854242	expense	488bffbf-8185-4ca5-80e9-f47e7515ed06	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:40:56.455	c4b3f601-0a95-485c-ab49-fa23c5f5196a
f7141fc4-b667-4da4-afbc-4f7d5aa03481	JE-GL-2569-000003	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-HQ-2569-000003: ค่าใช้จ่ายทดสอบ E2E 1783314046966	expense	f2c04a1e-5d12-4b94-b20e-3ecfe1c9c74e	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:54.203	c4b3f601-0a95-485c-ab49-fa23c5f5196a
ed5911bd-6e78-4313-a8b6-4254d45d2b29	JE-GL-2569-000002	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-HQ-2569-000002: ค่าใช้จ่ายทดสอบ E2E 1783312883127	expense	f90049d7-52ee-48e1-ba27-981e05f80c0f	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:25.313	c4b3f601-0a95-485c-ab49-fa23c5f5196a
b9ecf1e7-3628-4edf-b7c3-9322fb296b7d	JE-GL-2569-000018	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:10:34.63	สัญญาขายฝาก PWN-CTE021602-2569-000001 — OPEN	pawn_event	19	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:34.925	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
541e5024-bcd7-4740-ad2b-1b31f2bb1ba6	JE-GL-2569-000019	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-CTE021602-2569-000001: ค่าใช้จ่ายทดสอบ E2E 1783318228764	expense	51a71c75-4301-43c9-87fb-8a4f37fa1ad6	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:36.519	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
3e1a1946-1bfc-4b4c-b845-be4609e09c25	JE-GL-2569-000020	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:10:43.816	สัญญาขายฝาก PWN-CTE021602-2569-000001 — REDEEM	pawn_event	20	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:44.006	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
87c1b1b8-774c-431a-b5e2-4dbbdea898d4	JE-GL-2569-000021	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:10:43.823	บัญชีออมทอง SAV-CTE021602-2569-000001 — DEPOSIT	savings_transaction	26	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:44.029	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
fb536cbf-37c6-4415-abb7-a08d6c855d2e	JE-GL-2569-000022	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:10:45.055	บัญชีออมทอง SAV-CTE021602-2569-000001 — CLOSE_CASH	savings_transaction	27	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:45.113	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
6862fc8d-44d0-4aa5-8cda-e9af6c2ad5ef	JE-GL-2569-000023	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:24:35.031	สัญญาขายฝาก PWN-CTE021602-2569-000002 — OPEN	pawn_event	21	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:35.363	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
e7e083c9-d36e-4ce9-adb4-a3e2fb1a93d2	JE-GL-2569-000024	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-CTE021602-2569-000002: ค่าใช้จ่ายทดสอบ E2E 1783319069340	expense	44daa846-7107-45da-8141-69a6617d4429	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:36.62	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
e99bf889-a1ff-43a8-bfe5-e971c92b265b	JE-GL-2569-000025	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:24:43.924	สัญญาขายฝาก PWN-CTE021602-2569-000002 — REDEEM	pawn_event	22	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:43.996	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
1132eed9-f627-4a5f-b3d1-45f045d7eb14	JE-GL-2569-000026	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:24:44.144	บัญชีออมทอง SAV-CTE021602-2569-000002 — DEPOSIT	savings_transaction	29	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:44.295	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
dfb1b9ba-5f34-49b1-a08a-c7fdffcc8175	JE-GL-2569-000027	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:24:45.384	บัญชีออมทอง SAV-CTE021602-2569-000002 — CLOSE_CASH	savings_transaction	30	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:45.612	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
7822fbe9-b9ee-44f1-93a0-c0bd3b7e623e	JE-GL-2569-000028	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:27:13.238	สัญญาขายฝาก PWN-CTE021602-2569-000003 — OPEN	pawn_event	23	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:13.44	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
1d30938a-763c-494d-95e2-beadd9ebb599	JE-GL-2569-000029	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 00:00:00	ค่าใช้จ่าย EXP-CTE021602-2569-000003: ค่าใช้จ่ายทดสอบ E2E 1783319226633	expense	243be05f-1c66-40d5-a388-285b0391a9d3	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:14.162	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
1cb2e668-bc98-4f96-9fb8-2ad3a2289c10	JE-GL-2569-000030	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:27:21.952	บัญชีออมทอง SAV-CTE021602-2569-000003 — DEPOSIT	savings_transaction	32	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:22.036	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
95a07afc-083b-4fe1-b59a-6fcf8cf69687	JE-GL-2569-000031	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:27:22.211	สัญญาขายฝาก PWN-CTE021602-2569-000003 — REDEEM	pawn_event	24	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:22.271	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
1a6a32d3-8a7f-4c6f-a072-af6e2d68c29a	JE-GL-2569-000032	5321a95a-bdd7-49be-b186-90480bdf58c0	2026-07-06 06:27:22.904	บัญชีออมทอง SAV-CTE021602-2569-000003 — CLOSE_CASH	savings_transaction	33	f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:22.984	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd
\.


--
-- Data for Name: journal_lines; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.journal_lines (id, entry_id, account_id, debit_satang, credit_satang, memo, created_at) FROM stdin;
1	d5bd5c51-6f4b-4fa4-b2fb-ea051dc316d3	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 04:40:56.461
2	d5bd5c51-6f4b-4fa4-b2fb-ea051dc316d3	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 04:40:56.461
3	ed5911bd-6e78-4313-a8b6-4254d45d2b29	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 04:41:25.318
4	ed5911bd-6e78-4313-a8b6-4254d45d2b29	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 04:41:25.318
5	f7141fc4-b667-4da4-afbc-4f7d5aa03481	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 05:00:54.224
6	f7141fc4-b667-4da4-afbc-4f7d5aa03481	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 05:00:54.224
7	36dd8d09-de2d-4c55-b2f1-9b21b457514c	e14a6984-3db7-4b14-a5f9-59218ad983c6	1000000	0	เปิดสัญญาขายฝาก	2026-07-06 05:00:54.689
8	36dd8d09-de2d-4c55-b2f1-9b21b457514c	341811d9-8171-44f6-ae78-bb727fda1908	0	1000000	\N	2026-07-06 05:00:54.689
9	9689f965-650e-4347-99ec-94eb7f846cc0	e14a6984-3db7-4b14-a5f9-59218ad983c6	0	1000000	\N	2026-07-06 05:01:02.328
10	9689f965-650e-4347-99ec-94eb7f846cc0	341811d9-8171-44f6-ae78-bb727fda1908	1000000	0	ไถ่ถอนขายฝาก	2026-07-06 05:01:02.328
11	1307cff7-924b-4fe2-bbb5-4079e9cf8d0c	341811d9-8171-44f6-ae78-bb727fda1908	100000	0	รับฝากออมทอง	2026-07-06 05:01:02.589
12	1307cff7-924b-4fe2-bbb5-4079e9cf8d0c	ecff4cf1-9215-452a-8193-34c10c03612a	0	100000	\N	2026-07-06 05:01:02.589
13	ec16bf96-7538-4464-9058-5790fc3f78ab	ecff4cf1-9215-452a-8193-34c10c03612a	100000	0	ปิดบัญชีออมทองคืนเงิน	2026-07-06 05:01:03.517
14	ec16bf96-7538-4464-9058-5790fc3f78ab	341811d9-8171-44f6-ae78-bb727fda1908	0	100000	\N	2026-07-06 05:01:03.517
15	5e6552df-5f53-403b-8812-682bbacdde21	e14a6984-3db7-4b14-a5f9-59218ad983c6	1000000	0	เปิดสัญญาขายฝาก	2026-07-06 05:06:31.276
16	5e6552df-5f53-403b-8812-682bbacdde21	341811d9-8171-44f6-ae78-bb727fda1908	0	1000000	\N	2026-07-06 05:06:31.276
17	27d752e0-5ff8-4869-b957-ff77046eba99	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 05:06:31.611
18	27d752e0-5ff8-4869-b957-ff77046eba99	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 05:06:31.611
19	b441011d-f240-4aa4-b8b7-5f7ce7d32742	341811d9-8171-44f6-ae78-bb727fda1908	100000	0	รับฝากออมทอง	2026-07-06 05:06:38.01
20	b441011d-f240-4aa4-b8b7-5f7ce7d32742	ecff4cf1-9215-452a-8193-34c10c03612a	0	100000	\N	2026-07-06 05:06:38.01
21	b548627b-acbd-4ac3-afc6-944eb97f0858	ecff4cf1-9215-452a-8193-34c10c03612a	100000	0	ปิดบัญชีออมทองคืนเงิน	2026-07-06 05:06:38.928
22	b548627b-acbd-4ac3-afc6-944eb97f0858	341811d9-8171-44f6-ae78-bb727fda1908	0	100000	\N	2026-07-06 05:06:38.928
23	13290e3e-4e4d-4f95-8fb7-56080ed58d12	e14a6984-3db7-4b14-a5f9-59218ad983c6	0	1000000	\N	2026-07-06 05:06:39.184
24	13290e3e-4e4d-4f95-8fb7-56080ed58d12	341811d9-8171-44f6-ae78-bb727fda1908	1000000	0	ไถ่ถอนขายฝาก	2026-07-06 05:06:39.184
25	913a329f-7451-4cfc-b1f1-c309cb8340c6	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 05:25:11.207
26	913a329f-7451-4cfc-b1f1-c309cb8340c6	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 05:25:11.207
27	5767ee5d-fda6-4c64-b1e0-900bc6aef6f2	e14a6984-3db7-4b14-a5f9-59218ad983c6	1000000	0	เปิดสัญญาขายฝาก	2026-07-06 05:25:11.926
28	5767ee5d-fda6-4c64-b1e0-900bc6aef6f2	341811d9-8171-44f6-ae78-bb727fda1908	0	1000000	\N	2026-07-06 05:25:11.926
29	0f484da2-a2e2-45d0-a670-3acc890e3158	e14a6984-3db7-4b14-a5f9-59218ad983c6	0	1000000	\N	2026-07-06 05:25:16.304
30	0f484da2-a2e2-45d0-a670-3acc890e3158	341811d9-8171-44f6-ae78-bb727fda1908	1000000	0	ไถ่ถอนขายฝาก	2026-07-06 05:25:16.304
31	e21460e7-26d9-408c-a529-e4576287b87b	341811d9-8171-44f6-ae78-bb727fda1908	100000	0	รับฝากออมทอง	2026-07-06 05:25:16.861
32	e21460e7-26d9-408c-a529-e4576287b87b	ecff4cf1-9215-452a-8193-34c10c03612a	0	100000	\N	2026-07-06 05:25:16.861
33	22f25776-8613-49d2-b381-538055c8368a	ecff4cf1-9215-452a-8193-34c10c03612a	100000	0	ปิดบัญชีออมทองคืนเงิน	2026-07-06 05:25:17.583
34	22f25776-8613-49d2-b381-538055c8368a	341811d9-8171-44f6-ae78-bb727fda1908	0	100000	\N	2026-07-06 05:25:17.583
35	b9ecf1e7-3628-4edf-b7c3-9322fb296b7d	e14a6984-3db7-4b14-a5f9-59218ad983c6	1000000	0	เปิดสัญญาขายฝาก	2026-07-06 06:10:35.124
36	b9ecf1e7-3628-4edf-b7c3-9322fb296b7d	341811d9-8171-44f6-ae78-bb727fda1908	0	1000000	\N	2026-07-06 06:10:35.124
37	541e5024-bcd7-4740-ad2b-1b31f2bb1ba6	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 06:10:36.537
38	541e5024-bcd7-4740-ad2b-1b31f2bb1ba6	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 06:10:36.537
39	3e1a1946-1bfc-4b4c-b845-be4609e09c25	e14a6984-3db7-4b14-a5f9-59218ad983c6	0	1000000	\N	2026-07-06 06:10:44.015
40	3e1a1946-1bfc-4b4c-b845-be4609e09c25	341811d9-8171-44f6-ae78-bb727fda1908	1000000	0	ไถ่ถอนขายฝาก	2026-07-06 06:10:44.015
41	87c1b1b8-774c-431a-b5e2-4dbbdea898d4	341811d9-8171-44f6-ae78-bb727fda1908	100000	0	รับฝากออมทอง	2026-07-06 06:10:44.08
42	87c1b1b8-774c-431a-b5e2-4dbbdea898d4	ecff4cf1-9215-452a-8193-34c10c03612a	0	100000	\N	2026-07-06 06:10:44.08
43	fb536cbf-37c6-4415-abb7-a08d6c855d2e	ecff4cf1-9215-452a-8193-34c10c03612a	100000	0	ปิดบัญชีออมทองคืนเงิน	2026-07-06 06:10:45.12
44	fb536cbf-37c6-4415-abb7-a08d6c855d2e	341811d9-8171-44f6-ae78-bb727fda1908	0	100000	\N	2026-07-06 06:10:45.12
45	6862fc8d-44d0-4aa5-8cda-e9af6c2ad5ef	e14a6984-3db7-4b14-a5f9-59218ad983c6	1000000	0	เปิดสัญญาขายฝาก	2026-07-06 06:24:35.376
46	6862fc8d-44d0-4aa5-8cda-e9af6c2ad5ef	341811d9-8171-44f6-ae78-bb727fda1908	0	1000000	\N	2026-07-06 06:24:35.376
47	e7e083c9-d36e-4ce9-adb4-a3e2fb1a93d2	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 06:24:36.628
48	e7e083c9-d36e-4ce9-adb4-a3e2fb1a93d2	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 06:24:36.628
49	e99bf889-a1ff-43a8-bfe5-e971c92b265b	e14a6984-3db7-4b14-a5f9-59218ad983c6	0	1000000	\N	2026-07-06 06:24:44.011
50	e99bf889-a1ff-43a8-bfe5-e971c92b265b	341811d9-8171-44f6-ae78-bb727fda1908	1000000	0	ไถ่ถอนขายฝาก	2026-07-06 06:24:44.011
51	1132eed9-f627-4a5f-b3d1-45f045d7eb14	341811d9-8171-44f6-ae78-bb727fda1908	100000	0	รับฝากออมทอง	2026-07-06 06:24:44.304
52	1132eed9-f627-4a5f-b3d1-45f045d7eb14	ecff4cf1-9215-452a-8193-34c10c03612a	0	100000	\N	2026-07-06 06:24:44.304
53	dfb1b9ba-5f34-49b1-a08a-c7fdffcc8175	ecff4cf1-9215-452a-8193-34c10c03612a	100000	0	ปิดบัญชีออมทองคืนเงิน	2026-07-06 06:24:45.624
54	dfb1b9ba-5f34-49b1-a08a-c7fdffcc8175	341811d9-8171-44f6-ae78-bb727fda1908	0	100000	\N	2026-07-06 06:24:45.624
55	7822fbe9-b9ee-44f1-93a0-c0bd3b7e623e	e14a6984-3db7-4b14-a5f9-59218ad983c6	1000000	0	เปิดสัญญาขายฝาก	2026-07-06 06:27:13.463
56	7822fbe9-b9ee-44f1-93a0-c0bd3b7e623e	341811d9-8171-44f6-ae78-bb727fda1908	0	1000000	\N	2026-07-06 06:27:13.463
57	1d30938a-763c-494d-95e2-beadd9ebb599	dda4ebb2-bdee-4837-998c-e8aba77760a7	123400	0	\N	2026-07-06 06:27:14.181
58	1d30938a-763c-494d-95e2-beadd9ebb599	341811d9-8171-44f6-ae78-bb727fda1908	0	123400	\N	2026-07-06 06:27:14.181
59	1cb2e668-bc98-4f96-9fb8-2ad3a2289c10	341811d9-8171-44f6-ae78-bb727fda1908	100000	0	รับฝากออมทอง	2026-07-06 06:27:22.045
60	1cb2e668-bc98-4f96-9fb8-2ad3a2289c10	ecff4cf1-9215-452a-8193-34c10c03612a	0	100000	\N	2026-07-06 06:27:22.045
61	95a07afc-083b-4fe1-b59a-6fcf8cf69687	e14a6984-3db7-4b14-a5f9-59218ad983c6	0	1000000	\N	2026-07-06 06:27:22.279
62	95a07afc-083b-4fe1-b59a-6fcf8cf69687	341811d9-8171-44f6-ae78-bb727fda1908	1000000	0	ไถ่ถอนขายฝาก	2026-07-06 06:27:22.279
63	1a6a32d3-8a7f-4c6f-a072-af6e2d68c29a	ecff4cf1-9215-452a-8193-34c10c03612a	100000	0	ปิดบัญชีออมทองคืนเงิน	2026-07-06 06:27:22.993
64	1a6a32d3-8a7f-4c6f-a072-af6e2d68c29a	341811d9-8171-44f6-ae78-bb727fda1908	0	100000	\N	2026-07-06 06:27:22.993
\.


--
-- Data for Name: melt_lot_items; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.melt_lot_items (lot_id, item_id) FROM stdin;
\.


--
-- Data for Name: melt_lots; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.melt_lots (id, doc_no, branch_id, status, sent_weight_mg, returned_weight_mg, returned_satang, created_by, sent_at, closed_at, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pawn_contracts; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.pawn_contracts (id, doc_no, branch_id, status, customer_name, customer_phone, customer_citizen_id_enc, customer_citizen_id_hash, description, weight_mg, gold_purity, photo_path, customer_photo_path, location_id, principal_satang, annual_interest_rate_percent, term_months, start_date, due_date, interest_paid_through_date, redeemed_at, redeemed_by_id, forfeited_at, forfeited_by_id, cancelled_at, cancelled_by_id, cancel_reason, created_by, created_at, updated_at, customer_id) FROM stdin;
c75683f8-d8d0-4136-841b-ef33f647174c	PWN-HQ-2569-000001	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783305038318	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 02:30:39.432	2026-08-06 02:30:39.432	2026-07-06 02:30:41.769	2026-07-06 02:30:41.769	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:30:39.435	2026-07-06 02:30:41.782	\N
3b68a161-9014-43d8-9da0-61f1fa2bfa34	PWN-HQ-2569-000002	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783305089724	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 02:31:30.941	2026-08-06 02:31:30.941	2026-07-06 02:31:33.183	2026-07-06 02:31:33.183	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:30.943	2026-07-06 02:31:33.197	\N
e27d35f3-561f-4aee-948c-d3543775e5b2	PWN-HQ-2569-000003	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783305116401	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 02:31:58.894	2026-08-06 02:31:58.894	2026-07-06 02:32:02.463	2026-07-06 02:32:02.463	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:58.898	2026-07-06 02:32:02.475	\N
85250ac9-1924-4096-8bc1-bd698b1dc0b9	PWN-HQ-2569-000004	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783305452843	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 02:37:35.129	2026-08-06 02:37:35.129	2026-07-06 02:37:38.298	2026-07-06 02:37:38.298	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:35.131	2026-07-06 02:37:38.31	\N
3e4a7d7c-d75b-407b-bcb8-6b9e4dc3e790	PWN-HQ-2569-000005	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783308398687	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 03:26:40.736	2026-08-06 03:26:40.736	2026-07-06 03:26:44.098	2026-07-06 03:26:44.098	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:40.739	2026-07-06 03:26:44.112	\N
54aba1f3-48e6-4d2e-aa70-545d87423133	PWN-HQ-2569-000006	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783308800887	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 03:33:24.598	2026-08-06 03:33:24.598	2026-07-06 03:33:29.282	2026-07-06 03:33:29.282	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:24.6	2026-07-06 03:33:29.296	\N
1bc8e2c9-70c3-4e5d-8ccd-468c7bd93a28	PWN-HQ-2569-000007	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783314046592	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 05:00:54.296	2026-08-06 05:00:54.296	2026-07-06 05:01:01.985	2026-07-06 05:01:01.985	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:54.401	2026-07-06 05:01:02.125	\N
442d5052-c30a-44b1-9f6b-2182ff3b356d	PWN-HQ-2569-000008	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783314383730	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 05:06:30.66	2026-08-06 05:06:30.66	2026-07-06 05:06:38.951	2026-07-06 05:06:38.951	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:30.749	2026-07-06 05:06:39.047	\N
24560b44-fd18-4bee-81ad-b0d943f1119a	PWN-HQ-2569-000009	c4b3f601-0a95-485c-ab49-fa23c5f5196a	REDEEMED	ลูกค้าทดสอบ E2E 1783315507217	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 05:25:11.579	2026-08-06 05:25:11.579	2026-07-06 05:25:16.231	2026-07-06 05:25:16.231	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.645	2026-07-06 05:25:16.251	\N
98b65d35-618e-48fb-bf79-68e33b03dae4	PWN-CTE021602-2569-000001	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	REDEEMED	ลูกค้าทดสอบ E2E 1783318227787	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 06:10:34.434	2026-08-06 06:10:34.434	2026-07-06 06:10:43.771	2026-07-06 06:10:43.771	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:34.569	2026-07-06 06:10:43.82	\N
096cdcea-c4f1-43d3-aae0-eafea12940bd	PWN-CTE021602-2569-000002	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	REDEEMED	ลูกค้าทดสอบ E2E 1783319068446	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 06:24:34.921	2026-08-06 06:24:34.921	2026-07-06 06:24:43.904	2026-07-06 06:24:43.904	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:35.009	2026-07-06 06:24:43.932	\N
5cf59ee3-82c7-4669-8218-42e8d7a55ca4	PWN-CTE021602-2569-000003	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	REDEEMED	ลูกค้าทดสอบ E2E 1783319225560	\N	\N	\N	สร้อยคอทองทดสอบ E2E	15160	96.50	\N	\N	\N	1000000	15.00	1	2026-07-06 06:27:12.786	2026-08-06 06:27:12.786	2026-07-06 06:27:22.171	2026-07-06 06:27:22.171	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:13.213	2026-07-06 06:27:22.219	\N
\.


--
-- Data for Name: pawn_events; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.pawn_events (id, contract_id, event_type, principal_before_satang, principal_after_satang, interest_amount_satang, period_from, period_to, actor_id, request_id, note, created_at) FROM stdin;
1	c75683f8-d8d0-4136-841b-ef33f647174c	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	ae86cffb-e58c-48fe-a698-8593aa804856	\N	2026-07-06 02:30:39.443
2	c75683f8-d8d0-4136-841b-ef33f647174c	REDEEM	1000000	0	0	2026-07-06 02:30:39.432	2026-07-06 02:30:41.769	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	d6e41823-bf2d-4d5d-ad09-5df7eaea838e	\N	2026-07-06 02:30:41.777
3	3b68a161-9014-43d8-9da0-61f1fa2bfa34	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	e342cede-dfb4-4b29-b17e-bce1bf10220f	\N	2026-07-06 02:31:30.948
4	3b68a161-9014-43d8-9da0-61f1fa2bfa34	REDEEM	1000000	0	0	2026-07-06 02:31:30.941	2026-07-06 02:31:33.183	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	22837608-7168-4a77-99fb-0eaee9cacf5b	\N	2026-07-06 02:31:33.193
5	e27d35f3-561f-4aee-948c-d3543775e5b2	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	5f005881-f5e1-4cf2-b45d-e2c2c63ada66	\N	2026-07-06 02:31:58.905
6	e27d35f3-561f-4aee-948c-d3543775e5b2	REDEEM	1000000	0	0	2026-07-06 02:31:58.894	2026-07-06 02:32:02.463	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	df8fe2d1-8e87-45cf-878a-9ae57c94b657	\N	2026-07-06 02:32:02.471
7	85250ac9-1924-4096-8bc1-bd698b1dc0b9	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	999f4f01-d68f-4066-8d37-eb041b5ff256	\N	2026-07-06 02:37:35.14
8	85250ac9-1924-4096-8bc1-bd698b1dc0b9	REDEEM	1000000	0	0	2026-07-06 02:37:35.129	2026-07-06 02:37:38.298	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	a083bfe8-01ec-4729-b9d2-280749355647	\N	2026-07-06 02:37:38.306
9	3e4a7d7c-d75b-407b-bcb8-6b9e4dc3e790	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	4716dca2-a7f5-466b-86ee-576b4477bc60	\N	2026-07-06 03:26:40.744
10	3e4a7d7c-d75b-407b-bcb8-6b9e4dc3e790	REDEEM	1000000	0	0	2026-07-06 03:26:40.736	2026-07-06 03:26:44.098	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	b1228325-b12d-4d20-8f24-d7d7e5cace92	\N	2026-07-06 03:26:44.106
11	54aba1f3-48e6-4d2e-aa70-545d87423133	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	65737ff3-5875-40f6-9ccd-55fb08733580	\N	2026-07-06 03:33:24.62
12	54aba1f3-48e6-4d2e-aa70-545d87423133	REDEEM	1000000	0	0	2026-07-06 03:33:24.598	2026-07-06 03:33:29.282	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	12acd1b3-e11e-4e88-89e6-cf43f4597088	\N	2026-07-06 03:33:29.292
13	1bc8e2c9-70c3-4e5d-8ccd-468c7bd93a28	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	ad26ea36-f9ed-48a0-9032-9c26544cbff9	\N	2026-07-06 05:00:54.413
14	1bc8e2c9-70c3-4e5d-8ccd-468c7bd93a28	REDEEM	1000000	0	0	2026-07-06 05:00:54.296	2026-07-06 05:01:01.985	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	0539e959-8d20-47aa-9d92-e0e5bacdddc6	\N	2026-07-06 05:01:02.113
15	442d5052-c30a-44b1-9f6b-2182ff3b356d	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	492c71e4-39e1-4776-baff-4a6a713cec01	\N	2026-07-06 05:06:30.811
16	442d5052-c30a-44b1-9f6b-2182ff3b356d	REDEEM	1000000	0	0	2026-07-06 05:06:30.66	2026-07-06 05:06:38.951	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	050581c3-f82f-43a7-8793-cce205daf98e	\N	2026-07-06 05:06:39.036
17	24560b44-fd18-4bee-81ad-b0d943f1119a	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	ab897432-a545-4059-a851-1073c4a64637	\N	2026-07-06 05:25:11.656
18	24560b44-fd18-4bee-81ad-b0d943f1119a	REDEEM	1000000	0	0	2026-07-06 05:25:11.579	2026-07-06 05:25:16.231	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cbfd1047-de4c-4216-96e9-10da2c490928	\N	2026-07-06 05:25:16.246
19	98b65d35-618e-48fb-bf79-68e33b03dae4	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	bdd680d5-feda-41c3-a4cf-8970ff6973cb	\N	2026-07-06 06:10:34.63
20	98b65d35-618e-48fb-bf79-68e33b03dae4	REDEEM	1000000	0	0	2026-07-06 06:10:34.434	2026-07-06 06:10:43.771	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	10a06b2d-609e-4089-8376-1383b28db056	\N	2026-07-06 06:10:43.816
21	096cdcea-c4f1-43d3-aae0-eafea12940bd	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cb217b70-e4f1-4e20-931a-58acced92ad1	\N	2026-07-06 06:24:35.031
22	096cdcea-c4f1-43d3-aae0-eafea12940bd	REDEEM	1000000	0	0	2026-07-06 06:24:34.921	2026-07-06 06:24:43.904	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	eff5e80b-c053-4758-b3a7-d7b4c3f03229	\N	2026-07-06 06:24:43.924
23	5cf59ee3-82c7-4669-8218-42e8d7a55ca4	OPEN	0	1000000	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cde7ea99-49aa-4eaf-b027-396830123f5d	\N	2026-07-06 06:27:13.238
24	5cf59ee3-82c7-4669-8218-42e8d7a55ca4	REDEEM	1000000	0	0	2026-07-06 06:27:12.786	2026-07-06 06:27:22.171	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	5ff14138-5e6a-4570-be5a-6b299a00e8a3	\N	2026-07-06 06:27:22.211
\.


--
-- Data for Name: pawn_interest_payments; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.pawn_interest_payments (id, contract_id, period_from, period_to, interest_amount_satang, principal_after_satang, paid_at, actor_id, request_id) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.payments (id, sales_order_id, purchase_order_id, trade_in_id, payment_method, amount_satang, fee_satang, reference_no, slip_path, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.permissions (id, code, description) FROM stdin;
fcc73370-7555-48f8-aa1c-8dead81f5b61	pawn.view	ดูสัญญาขายฝากและทะเบียนคุมทรัพย์
179f8d5d-dc3a-4f78-af76-fe289fd54fd0	pawn.open	เปิดสัญญาขายฝากใหม่
0bb3f479-f2a0-4f16-846f-053c5ad193ce	pawn.renew	รับชำระดอกเบี้ย/ต่อสัญญาขายฝาก
49a07b0d-1aa1-4532-a169-bee58fb2790f	pawn.redeem	รับไถ่ถอนทองคืนลูกค้า
2ce2047f-dd31-4de7-a2e2-3a95fc7d0afa	user.manage	สร้าง/แก้ไข/ปิดใช้งานผู้ใช้ และ reset รหัสผ่าน
243c2dd5-f0cc-49fa-8827-4965575420f4	user.view	ดูรายชื่อผู้ใช้
18953c5d-8524-4f65-8f18-6ebb2150b636	role.manage	จัดการบทบาทและสิทธิ์
5edfca68-da15-4303-a27f-305ed3070754	branch.manage	สร้าง/แก้ไขสาขา
28bc4370-c916-48f9-a56b-4647d7fb6196	settings.manage	แก้ไขการตั้งค่าระบบ
4816001d-6bd1-4448-8bd9-68b663bde74b	settings.view	ดูการตั้งค่าระบบ
bfe2b223-da4c-49b2-812e-744f2f9c6d12	audit.view	ดู audit log
d4cd1015-06fa-48aa-9c0a-e577cffafe02	session.revoke	บังคับผู้ใช้ออกจากระบบ
50922a32-2e86-44ad-999d-632815e6603a	price.view	ดูราคาทองและประวัติ
099b93be-0727-4bbb-9209-79f62da38120	price.announce	ประกาศราคาหน้าร้าน / กรอกราคา feed มือ
a5a0c806-f529-4e20-bcee-6880ce8b221e	stock.view	ดูรายการสินค้าและสต๊อกสินค้า
0c1e48b3-c612-49a9-9330-ba516f919b81	stock.receive	รับสินค้าเข้าจาก Supplier
eeddb7b2-fd96-40c6-8787-e50070eb347b	stock.transfer	จัดการการโอนย้ายสินค้าข้ามสาขา
56687443-0c44-4ba7-bf13-6357338a49bd	stock.count	สร้างและตรวจนับสต๊อกสินค้า
555e4be3-2a36-4d74-8901-f777019b11b3	stock.adjust	ปรับปรุงยอดสต๊อกสินค้า (ต้องการ PIN ผู้อนุมัติ)
c6142c0a-316b-4d0e-9c95-b19fb923c191	stock.melt	จัดการส่งทองเก่าหลอม/คืนโรงงาน
98a1a663-052b-42eb-a231-bc72d69c1c1f	pawn.adjust_principal	เพิ่ม/ลดเงินต้นสัญญาขายฝาก
69fb3ea4-bcba-4e8f-bd4e-6ee6fa50e55c	pawn.forfeit	อนุมัติทองหลุด โอนเข้าสต๊อก (ต้องการ PIN ผู้อนุมัติ)
07a8895f-a951-4193-b8d3-c6e3e3c01850	pawn.cancel	ยกเลิกสัญญาขายฝาก (ต้องการ PIN ผู้อนุมัติ)
d9c03e00-9ab3-4207-a764-0c8815ff2df1	accounting.view	ดูผังบัญชี ใบสำคัญบัญชี และรายงานการเงิน
0a74a30c-2192-4835-a1fa-5044cb5cf770	accounting.post	บันทึกรายการบัญชีมือ (ค่าใช้จ่าย/ปรับปรุง)
8ef5a436-ce6e-4979-b0ef-f84afeec0c99	accounting.period_lock	ปิดงวดบัญชี (ต้องการ PIN ผู้อนุมัติ)
2d2a1405-fbb1-4fbe-a315-94aaf128b797	accounting.period_unlock	เปิดงวดบัญชีที่ปิดแล้วกลับมา (ต้องการ PIN ผู้อนุมัติ)
cb09c2ef-1711-46da-bdf3-4c06ac4ab370	expense.manage	บันทึกค่าใช้จ่ายของร้าน
578f252c-5d12-45bb-9dd9-52ee2c7d671c	customer.view	ดูโปรไฟล์ลูกค้าและประวัติธุรกรรม
269cbd45-11ba-42e5-b9f4-4dfa869acbe8	customer.manage	สร้าง/แก้ไขโปรไฟล์ลูกค้า
0bee77aa-f741-4ac9-9e06-ccbb0736d775	customer.view_pii	ดูข้อมูลอ่อนไหวลูกค้าแบบไม่ถูก mask (เลขบัตร ปชช.)
84542e40-1b8a-4c47-9827-c0fc22f57914	customer.anonymize	ล้างข้อมูลส่วนตัวลูกค้าตามสิทธิ์ถูกลืม PDPA (ต้องการ PIN ผู้อนุมัติ)
0069624c-c685-4a78-9dbd-28ccb8b1018d	savings.view	ดูบัญชีออมทองและรายงานภาระผูกพัน
58f6e23d-a08b-421b-a4a3-8154834e40a1	savings.open	เปิดบัญชีออมทองใหม่
3e99fc8c-cc79-4069-a2f8-51d120e86041	savings.deposit	รับฝากเงิน/น้ำหนักเข้าบัญชีออมทอง
0aaa8562-cc28-4277-89e3-c9f95637cf08	savings.close	ปิดบัญชีออมทอง (รับทอง/รับเงินคืน)
e4a0c314-b0f3-4f3f-8203-99622c89cd28	savings.cancel	ปิดบัญชีออมทองกรณีผิดนัด (ต้องการ PIN ผู้อนุมัติ)
f541fd05-a307-40d9-b163-23f046f723d2	workorder.view	ดูใบสั่งงานช่าง/ซ่อม
3c0632d9-34a4-4f1b-b96a-9745fc03a3b3	workorder.manage	สร้าง/อัปเดตสถานะใบสั่งงานช่าง/ซ่อม
30231a5e-17c1-4c6e-af98-63b0fd7fc752	workorder.cancel	ยกเลิกใบสั่งงานช่าง/ซ่อม
f257a65d-a4b9-48ff-8630-a39aba499894	amlo.view	ดูรายการแจ้งเตือน AMLO และทะเบียนเฝ้าระวัง
713ff3bd-3746-48a4-98bb-34f2b979f5c0	amlo.manage	ตรวจทาน/รายงานธุรกรรม AMLO และจัดการทะเบียนเฝ้าระวัง
f4a01c63-904a-4982-8a4c-31f2383ec40e	cash.transfer	จัดการโอนเงินสดข้ามสาขา (ต้องการ PIN ผู้อนุมัติตอนส่งเงิน)
96da6b3d-d397-4b86-9cfc-464856534bb5	commission.view	ดูรายงานค่าคอมมิชชั่นพนักงาน
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.product_categories (id, code, name, default_labor_charge, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_labels; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.product_labels (id, item_id, printed_by, printed_at, reason) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.products (id, sku, name, category_id, tracking, gold_purity, std_weight_mg, labor_charge, pattern, photo_path, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.purchase_order_items (id, order_id, product_id, item_id, description, weight_mg, gold_purity, unit_price_satang, total_amount_satang) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.purchase_orders (id, doc_no, branch_id, shift_id, price_snapshot, total_amount_satang, status, customer_name, customer_phone, customer_citizen_id, idempotency_key, voided_at, voided_by_id, void_reason, created_by, created_at, customer_id) FROM stdin;
\.


--
-- Data for Name: recovery_codes; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.recovery_codes (id, user_id, code_hash, used_at) FROM stdin;
208f7007-adcb-48d7-a49a-d942072d045e	66386734-f3d4-45f3-a57a-86962faec426	91acc3ab1e9a0944823acaaceb6057b3f7b8b15bac1c1fbbffb21ea944622ee2	\N
5bdf85e0-c825-48b5-84da-17174d301123	66386734-f3d4-45f3-a57a-86962faec426	24fbe95fe3d62f79271cfe4ea347d79e1bca02b6aec503f56e2accf15c20c67d	\N
9b811c01-ce8b-45ff-b159-cac61f112aa3	66386734-f3d4-45f3-a57a-86962faec426	522846a67c21fa0e5a57e02439b9c90fc1247df55ad1e5d902b60e7e9a00ae17	\N
d2c46867-d3f8-4298-b3c9-5069b08cc508	66386734-f3d4-45f3-a57a-86962faec426	ac7547f0ee9d62f3e784c9deabdcfd7d59510cd053f4a22e58b4fb4070816c98	\N
082ef90b-72f0-4c07-b2f3-97aeeff299e9	66386734-f3d4-45f3-a57a-86962faec426	d87184f140f2fd5b7342bd65a688746c840e1a99d320c13dcafc2204b98e075f	\N
301b1834-5791-4dc5-96b2-ee588d708098	66386734-f3d4-45f3-a57a-86962faec426	b235fecbb89b8b7f6d2be299cb4712a13941c999ee02a08a98eb4390783baf4f	\N
05fff2e3-86ec-407b-893b-35fb751a234f	66386734-f3d4-45f3-a57a-86962faec426	b6b51a8e06503a8eaac6e6fc0de80200c4166af2e7c1f87b641bbc93681d3d3d	\N
b7dd039f-8aef-4c03-9b15-bda05d61b13e	66386734-f3d4-45f3-a57a-86962faec426	fa272508598d05b5c5f9760dc323838b42da0d767088af4b17658b78081cd0a9	\N
7f901da0-48cb-4b27-97b6-f1954e89f7ab	66386734-f3d4-45f3-a57a-86962faec426	c7f02b7b723b9b834f5c0a2e187e42e46dcb74579e7c2bae2371c16d90859c2c	\N
58ad2000-8a9c-447a-b6d7-2a475649995e	66386734-f3d4-45f3-a57a-86962faec426	d36cf527742c83b80ee62d3927d54dd2bedc2e42df7d93958e60cdc9f92c99e9	\N
7a5b6a2d-fc97-4fcf-a59a-eb6f0121d0ca	be5cbe16-3a0f-4905-a442-18eea14d23e6	d61a334043f06a90a9bc72aec619bc1d2ec994b74a0f55b328007b439e3ddf4c	\N
99d5e121-a8ca-48ca-adca-7726c4a62000	be5cbe16-3a0f-4905-a442-18eea14d23e6	3e0a002e3cb68e4f332fe31f06f5b0a8d4270eee104c5093d14b21890c3cf09d	\N
0e19f2ed-e547-448f-a025-c4d0ad213e0b	be5cbe16-3a0f-4905-a442-18eea14d23e6	6edff399a2a5d4b05951730d67d097d1606bcf89f4f1786491c94e6abbc5091d	\N
854268fd-6a24-4496-8e2b-4d3abb18481f	be5cbe16-3a0f-4905-a442-18eea14d23e6	4da1fe9dda2871f44c67459568802f1a96f00d53ec321359a0f7b4df4a1cc88a	\N
ea81540c-2f5d-4fa4-ab78-54a2b95d5c8f	be5cbe16-3a0f-4905-a442-18eea14d23e6	304a4a4430ed9257836bfa3c00c9c48400f42b01670116ca18d4f2475fd0bf4d	\N
4fdf0d1b-7878-45ce-ae34-c603bfcf7995	be5cbe16-3a0f-4905-a442-18eea14d23e6	125d08407a87bf9b92fdc8eaea361ffde42a956f689237bff7b953434d258b64	\N
5708d8ec-aceb-4cf0-b7d0-632501a06171	be5cbe16-3a0f-4905-a442-18eea14d23e6	b67ca7d26ddce4ed7eb48cf52442a3aa0d670635b7d169aca1b3177d0c9d3b81	\N
82a71f2c-e5ec-479d-b1fb-ff467062694c	be5cbe16-3a0f-4905-a442-18eea14d23e6	17487d7883fdbc65c668389c7e560d911d6ea09131ee3a27b0ec9104abb78111	\N
7c85801e-93e1-4ac8-8d91-2cde3c23a36f	be5cbe16-3a0f-4905-a442-18eea14d23e6	94f335471de5c3a8d89f3c1092138dc95c1e50b2850ddb4694ca9e6bf1bd7433	\N
d2b6a3fb-161f-4eb8-99b9-ca9922eefb54	be5cbe16-3a0f-4905-a442-18eea14d23e6	ab885714b6f70919dcb7c932de799db2fc6f261ff1733a29b2ede1b3c86b3ae0	\N
46a1e805-8142-4e4e-96c6-e20b4ea67da6	d788f6cc-2452-4040-aea7-c5432733bd56	374b8e962c9e6f6785fa54a591c621eaba0cf045388c103aced95e16d4195549	\N
92e00f8a-d466-4df6-aca4-7bc2b1673335	d788f6cc-2452-4040-aea7-c5432733bd56	f31e71e0962e36b5c517b8e40b9528ebf74f360c7a3bc89ab7d6892508897d9c	\N
edb89b3a-b75c-4e93-93e0-ff7293c2bcbb	d788f6cc-2452-4040-aea7-c5432733bd56	1a7a63d49a88d4010580a199c0dfa33fe5d1b490e871bcd8b32d01a3fad72331	\N
902e0856-768a-444c-abaa-b93b8155cc45	d788f6cc-2452-4040-aea7-c5432733bd56	a5a0098302d1cf13831b3f821f6926340f7c98413e4b9b9fdf1f63449f3d93fe	\N
3456ab00-8ff1-4613-a279-96c5c8571f76	d788f6cc-2452-4040-aea7-c5432733bd56	344fcd16365c70aac5683a091a8989ef072474615c0e6a47f40623ba02efc56c	\N
950f228b-5764-45b1-8f4b-dae3fcbba592	d788f6cc-2452-4040-aea7-c5432733bd56	93d4c97d2780ea04fe70fda344239a24561e43f80dce04d8546c704c0bcc823f	\N
e36e1c7b-6e7e-48a8-b969-c94e0b6aa897	d788f6cc-2452-4040-aea7-c5432733bd56	4218e6f00f29805932ab2cea02a4e380cafae7c5000b264754906421a66124b4	\N
a5d5ea3a-11ae-4a0c-996d-02a27d8d4f4c	d788f6cc-2452-4040-aea7-c5432733bd56	11ea65b5a12844330e54d1500db62505d454a2c0d5e9e0340b0522aa11aaaf80	\N
c149b9cc-15b5-421b-8f72-628bd3560c61	d788f6cc-2452-4040-aea7-c5432733bd56	c127ca67089d0c0eb1e9a9d59c920e1473f3a9e882e21bcbab7f365debb24251	\N
c862e833-0b6b-4bfa-83cd-cf85ce7677dc	d788f6cc-2452-4040-aea7-c5432733bd56	355d793107a28b71f8acdda40fe3cedab9e35f97f6d44c0daca31cafc9d7a683	\N
ca2b331e-0b61-44bc-b23d-2014d9ab5ab1	2c547ede-b3d0-4940-8448-dcc194dc7662	07f756475a19b15471f2c925c4a91d97895727dddd475b753779d38ad13e079a	\N
36fda602-d491-4175-ae41-f6bc6e530561	2c547ede-b3d0-4940-8448-dcc194dc7662	b6770b1907884bfe59c891cf1c6b85cb030ac20502ddabe5b0f95c97b694c100	\N
90989289-1b49-446d-836c-d3f38192c4bb	2c547ede-b3d0-4940-8448-dcc194dc7662	967aa92d7d182d3fe6e6a8e08ba623eb3a808092d330cc5d8b00e491a355af72	\N
4d201893-d681-452a-af5c-299598b144b1	2c547ede-b3d0-4940-8448-dcc194dc7662	4480375e50ac2ba7ab0dfdd895775c71b0e9c805fd72b363d03d4f82f092ed00	\N
c230376f-6d27-4060-a552-c7c537f17fbb	2c547ede-b3d0-4940-8448-dcc194dc7662	d6b257f1feffdb16e032678ca5c6b84bc1a59b1668e96ff4e63745cbbb799e1e	\N
932ea2da-e4e0-4218-978f-9080b5f959d3	2c547ede-b3d0-4940-8448-dcc194dc7662	01d66f7d5f39371fa65dfcc98ac611dc09a9f7ae0e5641a201aebb40cc1517ae	\N
33fc42fb-ea61-449d-8924-1401fcaf03a5	2c547ede-b3d0-4940-8448-dcc194dc7662	5694da11d3bf69695ca8e9ea96a66c49d1a02942d88a0b4bebec7c8180acb989	\N
57a12a5b-f257-4e28-abdc-c5d696b50712	2c547ede-b3d0-4940-8448-dcc194dc7662	9a993a27350e39a590d7dc0a3cc78fecb058741f588add73150a4d6fdc7832a8	\N
b730f7b5-09db-4928-bb57-eb02bba65b6d	2c547ede-b3d0-4940-8448-dcc194dc7662	ffcd56772e6845f8887e037b27accd2ff4e202c49fc72b25daf4b8267f7cc9a0	\N
dc7c828e-4c4a-4317-96d9-69802e3c32c5	2c547ede-b3d0-4940-8448-dcc194dc7662	19edfc4fa3556339f1dcc8a6dcb68c2b702b8e67b40f2a9ba34dcfaac9b5c9a9	\N
14ac84b3-5ecf-4871-9148-5dc43201c754	408b48e4-8342-46b3-83e3-131ea6928587	ba9af126bac5e552ebb7151379a095da8cd323eb7f2c71afbff6caf1eb68bab5	\N
490bfdbc-cb3f-4de3-bdd9-cee556af53a0	408b48e4-8342-46b3-83e3-131ea6928587	02c37d587ec2fb99ee4407b71795ef9836e1969dabb87c91282baac385d1b808	\N
25b4d418-fe94-49cb-b4b0-ef2eaad137ae	408b48e4-8342-46b3-83e3-131ea6928587	70095e8a7287e521fb239057815244c61c3099b9899b5a880326d9eb592a44fd	\N
808953b8-6037-47b3-acc1-5cd37249f37d	408b48e4-8342-46b3-83e3-131ea6928587	cf0e0c4a85bdd9a67bdc28302ef71693372b3335c103907c7b07c6ad541614d7	\N
048d9edb-b2ca-4256-badf-b88a6092bcb9	408b48e4-8342-46b3-83e3-131ea6928587	04c498cbd75978e9cad1c40630b93157c6e9b4701d6ca72d33fe78fa1568ebb4	\N
7acc21c0-5626-4309-a105-2c9467421e05	408b48e4-8342-46b3-83e3-131ea6928587	331f445317212bc651a8aa2d015571e935f7b092067cf51f2f5184e7a8a56643	\N
3aa029a3-9280-4376-8ffe-b801920d0eef	408b48e4-8342-46b3-83e3-131ea6928587	1e11b0686a47da102342d3d3de4285992e768e287d2e99a9e499165b7bebfd29	\N
f6848591-65fb-4a5e-a6ba-e07f905e5154	408b48e4-8342-46b3-83e3-131ea6928587	19610a00641b907d00ac1bf9a1264769f2eaff2858d0062a5ebb7aa8142a3d4b	\N
50d0e76f-386e-4fc9-9f70-c54e691f7600	408b48e4-8342-46b3-83e3-131ea6928587	7d493d9a680a28136f85cc35a1571ddd879a48cab76974ba8c735ddf24ca71c7	\N
c7c784ca-bbec-4384-a4c9-e1d26012643c	408b48e4-8342-46b3-83e3-131ea6928587	df09095cd985ce4823ecd39a22e0ac76096791b744ee7be38c06c8e26ff69a57	\N
6aae96bb-9943-4813-9af2-05e6e4334e98	6bfff212-e20d-458c-8c3c-8ee808226883	10557af5ec9d85d86d2f64046cf52c26c83ae9760f3dee5f502c75aa32344742	\N
490f7f86-59e2-420c-b895-202776fda5e8	6bfff212-e20d-458c-8c3c-8ee808226883	f15f3cc41b003619860c28d0ccc41d0d26f40a2c175cad589458cf81b59ba2c7	\N
a902e1a2-af4d-4869-aa7d-ddd08ba4fb4a	6bfff212-e20d-458c-8c3c-8ee808226883	975d551c172ebceaaf4e8b32247a4f3b8c2c2adebf8e508dc34a658531e71ec9	\N
03f4b09c-7a22-4fdb-b3b6-ec13f8c77c76	6bfff212-e20d-458c-8c3c-8ee808226883	ff5845a1e5f60163979b2118d2131c0da32c1fe74fb86753e5ba3d5b1322f926	\N
6f338ee4-aeb7-441b-bf6e-0d8415d7cc83	6bfff212-e20d-458c-8c3c-8ee808226883	715ef2accaec986ef520eee8e22f435110b39b42b5c3dff040cc867fad3e22fa	\N
0eed5f7c-6369-4911-89e8-969e613f9a12	6bfff212-e20d-458c-8c3c-8ee808226883	19a50e4655048ed769e181ea8b55622be6169935f4cb3b073041e2a7291915a0	\N
9ee43cde-b85b-48f8-a547-eeff9acacd79	6bfff212-e20d-458c-8c3c-8ee808226883	57bd91a42d2a14681ad8dbfcd51bce4c046c14643c16ea36dd1cfaf0d3100781	\N
a65f6a51-065d-4d67-9d5c-ced715e0da44	6bfff212-e20d-458c-8c3c-8ee808226883	b77a075d6c337f17815832f1b343e56aaf7f840e247272cc188a7a382f266395	\N
0738882a-2e2e-4c7d-81fb-df5dfed2579f	6bfff212-e20d-458c-8c3c-8ee808226883	e07ac12c3016bd86539f5b576351bf591b4dcdb33322c416d9fe50d1bd4dae63	\N
6f483341-ee4c-4a8e-a408-c427386c779c	6bfff212-e20d-458c-8c3c-8ee808226883	e8e3aa3245d297db2d0a2555a6a4fe55a35dca60bcef00307829ca222987dd4c	\N
4489ee9c-ab53-4c38-8b42-610f4fe9bd5e	7e40436a-dd19-46d4-b9a5-5709b7bd243e	c9c9e567359f1238f936c2ec2c8e2571607f2b32e341866eb40d28b073dde4d6	\N
fd32cebc-706d-45ed-942d-2fbd1a8ae8eb	7e40436a-dd19-46d4-b9a5-5709b7bd243e	93519eb25248918aa3344d1c374bd3d4813d2516550e627fab4b1353df405167	\N
de372090-4d1e-489f-beb5-a434a359f590	7e40436a-dd19-46d4-b9a5-5709b7bd243e	587be9527b182953ae03e33f6167d0b0529732ab6d3bae9ce750ef7a4785aa80	\N
1bcd9052-c063-467e-a6c3-0c8b990909f2	7e40436a-dd19-46d4-b9a5-5709b7bd243e	93e7ca95d49c1adade77c418ef532f305751e56569c964d855581167e52440f9	\N
dbba9767-b4f1-444e-b548-673f04ec649c	7e40436a-dd19-46d4-b9a5-5709b7bd243e	2a60699157ba5fa0ea64fe8f648c91361ff45783edf705ad312533814791ee95	\N
ca0d78b3-abf8-4de7-a539-bffee48e37f7	7e40436a-dd19-46d4-b9a5-5709b7bd243e	dec538661b386316d6515a4d3b24e039ec4fc12eddcfe44d789c7d2124564de5	\N
e607833e-45dc-4bcc-a666-823c9061a7a9	7e40436a-dd19-46d4-b9a5-5709b7bd243e	674fcd41a0b381106dcd2ab281ac096485eafba5fa8f395330bcfceb592871b2	\N
00c668d4-0d0f-4737-b9fc-738406663d35	7e40436a-dd19-46d4-b9a5-5709b7bd243e	588f944ab041d1740ab7c716e5d4714b2fecaa1c9a3e4705952335001006e75c	\N
0abbbfe0-551e-4b06-9845-0a8ab6467b20	7e40436a-dd19-46d4-b9a5-5709b7bd243e	e652b1170fe5c8caa51731fa536a499938940c2315ec3038fcab5d6c8643b82a	\N
c43b999e-8d7b-46a1-ba74-b3c8f5a8027b	7e40436a-dd19-46d4-b9a5-5709b7bd243e	fa960372f88564423e032945f35c06d69479246226a7742635ca2da00756c5da	\N
83403b1e-affb-4f3e-8955-960b7c4d6cc4	f31bb720-310f-476e-a57a-72844b8f1ca3	55193d2e414e505fc301b24a95d87927208d2871b389cb0ca1b4f34dad4a9bad	\N
0b0c3e65-96a7-438f-9944-2711d98f875b	f31bb720-310f-476e-a57a-72844b8f1ca3	9d990b39a32e2fce4a108f9abcedb758a7512ebf174d02c38f328baf767322da	\N
7a158c7a-8ee8-4d59-876e-259cc389293c	f31bb720-310f-476e-a57a-72844b8f1ca3	190045fccce68336664683cd909066512b97434a958344d1da930836999e10c7	\N
8751f251-1ecc-43fe-8c42-a013e5ff678a	f31bb720-310f-476e-a57a-72844b8f1ca3	9a30331832aa3ae28cc8edde36a9d065dfd08d51ad9a16a2eef66df04b79b18f	\N
db93ecb0-077f-40f4-81ab-84367b74250e	f31bb720-310f-476e-a57a-72844b8f1ca3	96a3e9a356e169498fd473978b576d57b84783959646cb8bfd0fcdbe6f125e70	\N
d314a87c-236e-4b85-8880-22ce8a01d8fe	f31bb720-310f-476e-a57a-72844b8f1ca3	332c3b4337d793d107d88966619a5beeb90d2f2610f6d8a85be3dedc7f3d96ad	\N
bed0f6f7-7595-46c4-a172-b9e53030f2e0	f31bb720-310f-476e-a57a-72844b8f1ca3	ac2f232b2782c8fcd41ed6a33f4c8e967f4bb77d19e2dabd7a1341278c5708cf	\N
00cfeafc-0e91-4f6a-b5ed-c00d866c0c4f	f31bb720-310f-476e-a57a-72844b8f1ca3	56776229ad42b7a63639c2b26ca75498a23da58ca9ffca92b598de84e292657d	\N
860eb9ff-451c-4a3d-96a0-01a499d9b7ff	f31bb720-310f-476e-a57a-72844b8f1ca3	fb4c8b357f62bbdd730b942b04f907ee038bb3136841b759e0cc1f578f27f98a	\N
319a8754-3d87-469e-ad2b-39fae7d8adcf	f31bb720-310f-476e-a57a-72844b8f1ca3	e98c84a2dbd2b2445c673e36c93fd1fd34fe32321545756cae68d75258fd7ff2	\N
aadd80f8-1e1d-439e-bf89-6dbda78e16f4	4f9a0c71-128f-4b9d-853e-2b6561d65d00	f42a7aa80e19217503523c4f2265bad3dcd19769b53f6ebe937a6dd4c51601b5	\N
5dd3b60f-a6c1-4742-8d50-aecdf922b90c	4f9a0c71-128f-4b9d-853e-2b6561d65d00	5eb7c1dbecead2cdce4d999f1f232749d9429fb3601cf527aefc5d8c7c6a76a1	\N
b33237cb-e143-4bf0-bacc-6d665cbaaf5f	4f9a0c71-128f-4b9d-853e-2b6561d65d00	57fd22a95baff70a5d3f9414d63a4e5c524f706456356ce6b7da7bdf71a99105	\N
b67037f1-cea1-4ce6-b8db-64f6376d6faa	4f9a0c71-128f-4b9d-853e-2b6561d65d00	ee5eb7e0df3bc046772c3d2bac5080a958795fc0c2d33683fababa819fce1625	\N
409cf9f0-f72a-43ef-afbb-d81093c39765	4f9a0c71-128f-4b9d-853e-2b6561d65d00	b3dc63978e2f53149ae0b68f8c3e9f6741621463e17defd70359626dc6d93d03	\N
23eb106c-7478-4d26-8f7d-72a45455c034	4f9a0c71-128f-4b9d-853e-2b6561d65d00	6c185c2fe7b61beff286059e2f2a7caec90e6d14c22ba1fb63214b539aa12979	\N
18ad5852-1c88-490e-9531-917861f5de41	4f9a0c71-128f-4b9d-853e-2b6561d65d00	9297d9a9858286054ba41f1d2e2e0b058729a930f9be89b66c6e3147c7f04012	\N
6636b904-9919-408d-9f59-65734595397a	4f9a0c71-128f-4b9d-853e-2b6561d65d00	a92c0967a92a52b01149246f305956b4f5f951ec2f5a8b9f12d3a735a424fe1c	\N
56f9e25e-c2a7-4bf5-a67c-f34bac123efe	4f9a0c71-128f-4b9d-853e-2b6561d65d00	c698594f5ebd882b952d0e32280c5a641c3b3be84a2eefb6bcdebe5a011bf509	\N
37d7cf7c-ad7f-4dba-ae33-0a25d4025b60	4f9a0c71-128f-4b9d-853e-2b6561d65d00	7208b4eddca5c22bac58d5e0547045c1f8625c26a9775b0824970cd229e2368a	\N
32bc69f8-b22d-46ac-8f2b-c66283dbc935	89110bb3-4b20-4c4f-bf79-fba611c411f8	73c044d31fe10f190b92e5bffdb430ae9d81b002fc45d2ae6b894809a7918584	\N
862e1788-9a2e-4299-8883-2562c4b81616	89110bb3-4b20-4c4f-bf79-fba611c411f8	6c5734084f40d38e5ee43a0dd971537b532ff8ba39d9f3853d7b0b13fbf185e3	\N
30c75519-0ecb-4d35-ba1d-32a7e6b3722c	89110bb3-4b20-4c4f-bf79-fba611c411f8	327d3febe53ace494219b857ca3585633f8d6bdad0618be73cdf68b593077ee6	\N
d635ad9a-8971-4f56-91d2-07552108464e	89110bb3-4b20-4c4f-bf79-fba611c411f8	81f5417be3940fc1678538314b0f81c79dcb516d2a563d958457fb341136136f	\N
45724661-f120-4aee-ab75-a8fcdee8b42b	89110bb3-4b20-4c4f-bf79-fba611c411f8	bfcfac65a78a1e157cbc82ebe0af73549d96135ff1a318bc5e2bb34fdbcbc09b	\N
84cc2b55-5dd1-4c2e-901a-a270bed27198	89110bb3-4b20-4c4f-bf79-fba611c411f8	d1aff5ad374c30354e1c5d55d3a514573787331e4cd844b0ab5ec9ed0c03a634	\N
e544eb7e-5928-46e4-b2e9-c5bd2884e9f9	89110bb3-4b20-4c4f-bf79-fba611c411f8	68068010613176953c5c8821b033eccc879ae64ac9002985e18a2b7f19ec08fe	\N
faa264b7-9b92-4bf3-a9b2-46a21633bae1	89110bb3-4b20-4c4f-bf79-fba611c411f8	da2f87193a4e41f65e260668ac1f985ecffd8b2f7f8cd97671ef81a57915ec69	\N
52b61d66-5eec-4560-85b2-0b6b5e4cc78b	89110bb3-4b20-4c4f-bf79-fba611c411f8	2b8e8d563112afa874ecc7cdd3becf13f3fb3db824575d3de82f61c438b556fa	\N
7b16856f-0fc2-4e3d-b462-1daea09c3bc4	89110bb3-4b20-4c4f-bf79-fba611c411f8	d6ea66b5f88d7e32047ab5365aa4a7162461399505c2d80828b73e0d7390c1b1	\N
b7aba39a-4f5b-4e87-88ff-531089c230c3	a9babdcf-7232-4243-9bec-8ef76e94f2f9	7a8415de2691aedcb43bd6941b3402b9614135d54cf8cb4e03998bf1940e8dfa	\N
866474b6-1569-4adc-bdce-e95f41a81d99	a9babdcf-7232-4243-9bec-8ef76e94f2f9	64fbc6ac886f54cad79a5addc15b427192a61a63f6a619adc7f34aef2d17d7a2	\N
8e4839f7-3e41-48ab-a063-a174975228f7	a9babdcf-7232-4243-9bec-8ef76e94f2f9	80d9ad1ba5c9c5b420244f276940d2d03ac47eb4e94704283731adecddfabc52	\N
e5bfcec8-6bc5-4702-ada0-6e471a24b792	a9babdcf-7232-4243-9bec-8ef76e94f2f9	0bba09c9a748ff431f0ff7007ddcd27eb698c0dd62b9c97f94f46a424ddafd48	\N
4c88b24c-4ebb-47b3-a384-5c0f163c350e	a9babdcf-7232-4243-9bec-8ef76e94f2f9	d1cc7783357527bdfffb037bfd3a73cde26e77113f581eff2129b339ac9f478c	\N
15f92469-1df1-4f79-a8a9-5766014f609d	a9babdcf-7232-4243-9bec-8ef76e94f2f9	837c4561a88123c212d0422702812a5d8fa899d638fbaca28cb382c20f9c48f8	\N
c8a73c93-aa92-4e5d-902f-db2474462138	a9babdcf-7232-4243-9bec-8ef76e94f2f9	99a039226bcaeec1fa529fc79c233e4ea0b0cdfa80ebdc87fc4ff900a56865eb	\N
f14a4345-b0f5-4ee0-930d-f7906d263aca	a9babdcf-7232-4243-9bec-8ef76e94f2f9	5559787718b3542f94554597212f03309b30004506a6ff858957c47df1eda8ac	\N
a733f3e1-1277-439b-965f-7676360590f2	a9babdcf-7232-4243-9bec-8ef76e94f2f9	cf006c0aeb5e06ce44d0ef14b943ca777ac5c259cc4bcda01fda19692277568c	\N
3706a2ef-02fe-405a-add1-508ce10e66a4	a9babdcf-7232-4243-9bec-8ef76e94f2f9	c6bc831ac7554b1594d3878141933b7371a191ff6825b68edc80a3c5e7ff0e5f	\N
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
d9d7df78-e8c3-475e-93b6-945fd378c79e	fcc73370-7555-48f8-aa1c-8dead81f5b61
d9d7df78-e8c3-475e-93b6-945fd378c79e	179f8d5d-dc3a-4f78-af76-fe289fd54fd0
d9d7df78-e8c3-475e-93b6-945fd378c79e	0bb3f479-f2a0-4f16-846f-053c5ad193ce
d9d7df78-e8c3-475e-93b6-945fd378c79e	49a07b0d-1aa1-4532-a169-bee58fb2790f
d9d7df78-e8c3-475e-93b6-945fd378c79e	2ce2047f-dd31-4de7-a2e2-3a95fc7d0afa
d9d7df78-e8c3-475e-93b6-945fd378c79e	243c2dd5-f0cc-49fa-8827-4965575420f4
d9d7df78-e8c3-475e-93b6-945fd378c79e	18953c5d-8524-4f65-8f18-6ebb2150b636
d9d7df78-e8c3-475e-93b6-945fd378c79e	5edfca68-da15-4303-a27f-305ed3070754
d9d7df78-e8c3-475e-93b6-945fd378c79e	28bc4370-c916-48f9-a56b-4647d7fb6196
d9d7df78-e8c3-475e-93b6-945fd378c79e	4816001d-6bd1-4448-8bd9-68b663bde74b
d9d7df78-e8c3-475e-93b6-945fd378c79e	bfe2b223-da4c-49b2-812e-744f2f9c6d12
d9d7df78-e8c3-475e-93b6-945fd378c79e	d4cd1015-06fa-48aa-9c0a-e577cffafe02
d9d7df78-e8c3-475e-93b6-945fd378c79e	50922a32-2e86-44ad-999d-632815e6603a
d9d7df78-e8c3-475e-93b6-945fd378c79e	099b93be-0727-4bbb-9209-79f62da38120
d9d7df78-e8c3-475e-93b6-945fd378c79e	a5a0c806-f529-4e20-bcee-6880ce8b221e
d9d7df78-e8c3-475e-93b6-945fd378c79e	0c1e48b3-c612-49a9-9330-ba516f919b81
d9d7df78-e8c3-475e-93b6-945fd378c79e	eeddb7b2-fd96-40c6-8787-e50070eb347b
d9d7df78-e8c3-475e-93b6-945fd378c79e	56687443-0c44-4ba7-bf13-6357338a49bd
d9d7df78-e8c3-475e-93b6-945fd378c79e	555e4be3-2a36-4d74-8901-f777019b11b3
d9d7df78-e8c3-475e-93b6-945fd378c79e	c6142c0a-316b-4d0e-9c95-b19fb923c191
d9d7df78-e8c3-475e-93b6-945fd378c79e	98a1a663-052b-42eb-a231-bc72d69c1c1f
d9d7df78-e8c3-475e-93b6-945fd378c79e	69fb3ea4-bcba-4e8f-bd4e-6ee6fa50e55c
d9d7df78-e8c3-475e-93b6-945fd378c79e	07a8895f-a951-4193-b8d3-c6e3e3c01850
d9d7df78-e8c3-475e-93b6-945fd378c79e	d9c03e00-9ab3-4207-a764-0c8815ff2df1
d9d7df78-e8c3-475e-93b6-945fd378c79e	0a74a30c-2192-4835-a1fa-5044cb5cf770
d9d7df78-e8c3-475e-93b6-945fd378c79e	8ef5a436-ce6e-4979-b0ef-f84afeec0c99
d9d7df78-e8c3-475e-93b6-945fd378c79e	2d2a1405-fbb1-4fbe-a315-94aaf128b797
d9d7df78-e8c3-475e-93b6-945fd378c79e	cb09c2ef-1711-46da-bdf3-4c06ac4ab370
d9d7df78-e8c3-475e-93b6-945fd378c79e	578f252c-5d12-45bb-9dd9-52ee2c7d671c
d9d7df78-e8c3-475e-93b6-945fd378c79e	269cbd45-11ba-42e5-b9f4-4dfa869acbe8
d9d7df78-e8c3-475e-93b6-945fd378c79e	0bee77aa-f741-4ac9-9e06-ccbb0736d775
d9d7df78-e8c3-475e-93b6-945fd378c79e	84542e40-1b8a-4c47-9827-c0fc22f57914
d9d7df78-e8c3-475e-93b6-945fd378c79e	0069624c-c685-4a78-9dbd-28ccb8b1018d
d9d7df78-e8c3-475e-93b6-945fd378c79e	58f6e23d-a08b-421b-a4a3-8154834e40a1
d9d7df78-e8c3-475e-93b6-945fd378c79e	3e99fc8c-cc79-4069-a2f8-51d120e86041
d9d7df78-e8c3-475e-93b6-945fd378c79e	0aaa8562-cc28-4277-89e3-c9f95637cf08
d9d7df78-e8c3-475e-93b6-945fd378c79e	e4a0c314-b0f3-4f3f-8203-99622c89cd28
d9d7df78-e8c3-475e-93b6-945fd378c79e	f541fd05-a307-40d9-b163-23f046f723d2
d9d7df78-e8c3-475e-93b6-945fd378c79e	3c0632d9-34a4-4f1b-b96a-9745fc03a3b3
d9d7df78-e8c3-475e-93b6-945fd378c79e	30231a5e-17c1-4c6e-af98-63b0fd7fc752
d9d7df78-e8c3-475e-93b6-945fd378c79e	f257a65d-a4b9-48ff-8630-a39aba499894
d9d7df78-e8c3-475e-93b6-945fd378c79e	713ff3bd-3746-48a4-98bb-34f2b979f5c0
d9d7df78-e8c3-475e-93b6-945fd378c79e	f4a01c63-904a-4982-8a4c-31f2383ec40e
d9d7df78-e8c3-475e-93b6-945fd378c79e	96da6b3d-d397-4b86-9cfc-464856534bb5
3db1937c-b091-4ee2-baee-9244a76d59fa	2ce2047f-dd31-4de7-a2e2-3a95fc7d0afa
3db1937c-b091-4ee2-baee-9244a76d59fa	243c2dd5-f0cc-49fa-8827-4965575420f4
3db1937c-b091-4ee2-baee-9244a76d59fa	18953c5d-8524-4f65-8f18-6ebb2150b636
3db1937c-b091-4ee2-baee-9244a76d59fa	5edfca68-da15-4303-a27f-305ed3070754
3db1937c-b091-4ee2-baee-9244a76d59fa	28bc4370-c916-48f9-a56b-4647d7fb6196
3db1937c-b091-4ee2-baee-9244a76d59fa	4816001d-6bd1-4448-8bd9-68b663bde74b
3db1937c-b091-4ee2-baee-9244a76d59fa	d4cd1015-06fa-48aa-9c0a-e577cffafe02
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	fcc73370-7555-48f8-aa1c-8dead81f5b61
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	179f8d5d-dc3a-4f78-af76-fe289fd54fd0
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	0bb3f479-f2a0-4f16-846f-053c5ad193ce
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	49a07b0d-1aa1-4532-a169-bee58fb2790f
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	243c2dd5-f0cc-49fa-8827-4965575420f4
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	4816001d-6bd1-4448-8bd9-68b663bde74b
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	50922a32-2e86-44ad-999d-632815e6603a
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	a5a0c806-f529-4e20-bcee-6880ce8b221e
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	0c1e48b3-c612-49a9-9330-ba516f919b81
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	eeddb7b2-fd96-40c6-8787-e50070eb347b
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	56687443-0c44-4ba7-bf13-6357338a49bd
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	555e4be3-2a36-4d74-8901-f777019b11b3
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	c6142c0a-316b-4d0e-9c95-b19fb923c191
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	98a1a663-052b-42eb-a231-bc72d69c1c1f
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	69fb3ea4-bcba-4e8f-bd4e-6ee6fa50e55c
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	07a8895f-a951-4193-b8d3-c6e3e3c01850
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	d9c03e00-9ab3-4207-a764-0c8815ff2df1
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	0a74a30c-2192-4835-a1fa-5044cb5cf770
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	8ef5a436-ce6e-4979-b0ef-f84afeec0c99
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	2d2a1405-fbb1-4fbe-a315-94aaf128b797
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	cb09c2ef-1711-46da-bdf3-4c06ac4ab370
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	578f252c-5d12-45bb-9dd9-52ee2c7d671c
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	269cbd45-11ba-42e5-b9f4-4dfa869acbe8
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	0bee77aa-f741-4ac9-9e06-ccbb0736d775
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	84542e40-1b8a-4c47-9827-c0fc22f57914
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	0069624c-c685-4a78-9dbd-28ccb8b1018d
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	58f6e23d-a08b-421b-a4a3-8154834e40a1
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	3e99fc8c-cc79-4069-a2f8-51d120e86041
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	0aaa8562-cc28-4277-89e3-c9f95637cf08
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	e4a0c314-b0f3-4f3f-8203-99622c89cd28
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	f541fd05-a307-40d9-b163-23f046f723d2
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	3c0632d9-34a4-4f1b-b96a-9745fc03a3b3
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	30231a5e-17c1-4c6e-af98-63b0fd7fc752
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	f257a65d-a4b9-48ff-8630-a39aba499894
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	713ff3bd-3746-48a4-98bb-34f2b979f5c0
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	f4a01c63-904a-4982-8a4c-31f2383ec40e
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	96da6b3d-d397-4b86-9cfc-464856534bb5
1560e21d-ac2b-47da-a03b-16745fba2081	fcc73370-7555-48f8-aa1c-8dead81f5b61
1560e21d-ac2b-47da-a03b-16745fba2081	179f8d5d-dc3a-4f78-af76-fe289fd54fd0
1560e21d-ac2b-47da-a03b-16745fba2081	0bb3f479-f2a0-4f16-846f-053c5ad193ce
1560e21d-ac2b-47da-a03b-16745fba2081	49a07b0d-1aa1-4532-a169-bee58fb2790f
1560e21d-ac2b-47da-a03b-16745fba2081	50922a32-2e86-44ad-999d-632815e6603a
1560e21d-ac2b-47da-a03b-16745fba2081	a5a0c806-f529-4e20-bcee-6880ce8b221e
1560e21d-ac2b-47da-a03b-16745fba2081	56687443-0c44-4ba7-bf13-6357338a49bd
1560e21d-ac2b-47da-a03b-16745fba2081	578f252c-5d12-45bb-9dd9-52ee2c7d671c
1560e21d-ac2b-47da-a03b-16745fba2081	269cbd45-11ba-42e5-b9f4-4dfa869acbe8
1560e21d-ac2b-47da-a03b-16745fba2081	0069624c-c685-4a78-9dbd-28ccb8b1018d
1560e21d-ac2b-47da-a03b-16745fba2081	58f6e23d-a08b-421b-a4a3-8154834e40a1
1560e21d-ac2b-47da-a03b-16745fba2081	3e99fc8c-cc79-4069-a2f8-51d120e86041
1560e21d-ac2b-47da-a03b-16745fba2081	0aaa8562-cc28-4277-89e3-c9f95637cf08
1560e21d-ac2b-47da-a03b-16745fba2081	f541fd05-a307-40d9-b163-23f046f723d2
1560e21d-ac2b-47da-a03b-16745fba2081	3c0632d9-34a4-4f1b-b96a-9745fc03a3b3
f0af6410-1797-4772-a680-232f5f2a75ee	fcc73370-7555-48f8-aa1c-8dead81f5b61
f0af6410-1797-4772-a680-232f5f2a75ee	50922a32-2e86-44ad-999d-632815e6603a
f0af6410-1797-4772-a680-232f5f2a75ee	a5a0c806-f529-4e20-bcee-6880ce8b221e
f0af6410-1797-4772-a680-232f5f2a75ee	0c1e48b3-c612-49a9-9330-ba516f919b81
f0af6410-1797-4772-a680-232f5f2a75ee	eeddb7b2-fd96-40c6-8787-e50070eb347b
f0af6410-1797-4772-a680-232f5f2a75ee	56687443-0c44-4ba7-bf13-6357338a49bd
f0af6410-1797-4772-a680-232f5f2a75ee	c6142c0a-316b-4d0e-9c95-b19fb923c191
f0af6410-1797-4772-a680-232f5f2a75ee	f541fd05-a307-40d9-b163-23f046f723d2
5cdb9139-823e-4634-bf28-93a580fc63a9	fcc73370-7555-48f8-aa1c-8dead81f5b61
5cdb9139-823e-4634-bf28-93a580fc63a9	bfe2b223-da4c-49b2-812e-744f2f9c6d12
5cdb9139-823e-4634-bf28-93a580fc63a9	50922a32-2e86-44ad-999d-632815e6603a
5cdb9139-823e-4634-bf28-93a580fc63a9	d9c03e00-9ab3-4207-a764-0c8815ff2df1
5cdb9139-823e-4634-bf28-93a580fc63a9	0a74a30c-2192-4835-a1fa-5044cb5cf770
5cdb9139-823e-4634-bf28-93a580fc63a9	cb09c2ef-1711-46da-bdf3-4c06ac4ab370
5cdb9139-823e-4634-bf28-93a580fc63a9	578f252c-5d12-45bb-9dd9-52ee2c7d671c
5cdb9139-823e-4634-bf28-93a580fc63a9	0069624c-c685-4a78-9dbd-28ccb8b1018d
5cdb9139-823e-4634-bf28-93a580fc63a9	f257a65d-a4b9-48ff-8630-a39aba499894
5cdb9139-823e-4634-bf28-93a580fc63a9	96da6b3d-d397-4b86-9cfc-464856534bb5
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.roles (id, code, name, description, is_system) FROM stdin;
d9d7df78-e8c3-475e-93b6-945fd378c79e	OWNER	เจ้าของร้าน	เห็นทุกอย่างรวม audit log และตั้งค่าระบบ	t
3db1937c-b091-4ee2-baee-9244a76d59fa	ADMIN	ผู้ดูแลระบบ	จัดการผู้ใช้/สิทธิ์/สาขา — ไม่เห็นข้อมูลการเงิน	t
55ad03c7-30c7-476c-a2f9-a6cf8c93347d	BRANCH_MANAGER	ผู้จัดการสาขา	บริหารสาขาตัวเอง อนุมัติรายการพิเศษ (สิทธิ์ POS มาใน Phase 4)	t
1560e21d-ac2b-47da-a03b-16745fba2081	CASHIER	พนักงานขาย	ซื้อ-ขายหน้าร้าน (สิทธิ์ POS มาใน Phase 4)	t
f0af6410-1797-4772-a680-232f5f2a75ee	STOCK_KEEPER	พนักงานสต๊อก	จัดการสต๊อก (สิทธิ์มาใน Phase 3)	t
5cdb9139-823e-4634-bf28-93a580fc63a9	ACCOUNTANT	ฝ่ายบัญชี	บัญชีและภาษี	t
\.


--
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.sales_order_items (id, order_id, product_id, item_id, quantity, weight_mg, gold_purity, gold_price_satang, labor_charge_satang, vat_amount_satang, total_amount_satang) FROM stdin;
\.


--
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.sales_orders (id, doc_no, branch_id, shift_id, price_snapshot, total_amount_satang, vat_amount_satang, status, idempotency_key, voided_at, voided_by_id, void_reason, created_by, created_at, updated_at, customer_id) FROM stdin;
\.


--
-- Data for Name: savings_accounts; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.savings_accounts (id, doc_no, branch_id, customer_id, account_type, status, balance_satang, balance_weight_mg, target_weight_mg, opened_at, closed_at, closed_by_id, created_by, created_at, updated_at) FROM stdin;
99934041-a9fc-4a86-b9c0-6c566047345a	SAV-HQ-2569-000001	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 03:24:09.332	2026-07-06 03:24:13.999	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:24:09.332	2026-07-06 03:24:14.012
0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	SAV-CTE021602-2569-000003	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 06:27:12.527	2026-07-06 06:27:22.904	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:12.527	2026-07-06 06:27:22.919
0d53a61f-2558-4bf8-9760-c4ded5668e55	SAV-HQ-2569-000002	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 03:25:07.677	2026-07-06 03:25:11.008	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:25:07.677	2026-07-06 03:25:11.016
7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	SAV-HQ-2569-000003	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 03:26:14.349	2026-07-06 03:26:17.861	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:14.349	2026-07-06 03:26:17.869
68094637-a069-4ee4-9f88-cf9136e20692	SAV-HQ-2569-000004	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 03:26:40.582	2026-07-06 03:26:44.571	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:40.582	2026-07-06 03:26:44.578
79e6625e-a08e-4f3d-b42b-aa535e8a86a0	SAV-HQ-2569-000005	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 03:33:24.501	2026-07-06 03:33:30.27	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:24.501	2026-07-06 03:33:30.278
ec176c50-5ab4-485c-9906-d048d939a119	SAV-HQ-2569-000006	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 05:00:54.465	2026-07-06 05:01:03.411	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:54.465	2026-07-06 05:01:03.426
2fd51c70-25af-42fe-80c8-74203841a6c3	SAV-HQ-2569-000007	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 05:06:30.675	2026-07-06 05:06:38.809	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:30.675	2026-07-06 05:06:38.827
2d107340-fdea-4992-b9c6-65a4233efab6	SAV-HQ-2569-000008	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 05:25:11.671	2026-07-06 05:25:17.496	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.671	2026-07-06 05:25:17.512
6a4cd1b0-5b33-49f0-97a0-c14525779ecd	SAV-CTE021602-2569-000001	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 06:10:34.584	2026-07-06 06:10:45.055	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:34.584	2026-07-06 06:10:45.069
7fd66471-d6f5-438b-ae93-450ff02ff5f2	SAV-CTE021602-2569-000002	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	CASH_SAVINGS	CLOSED_CASH	100000	0	\N	2026-07-06 06:24:34.754	2026-07-06 06:24:45.384	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:34.754	2026-07-06 06:24:45.426
\.


--
-- Data for Name: savings_transactions; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.savings_transactions (id, account_id, tx_type, amount_satang, weight_mg, price_snapshot, actor_id, request_id, note, created_at) FROM stdin;
1	99934041-a9fc-4a86-b9c0-6c566047345a	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	b68a27f0-d303-4a47-85dc-48bcfd05be5b	\N	2026-07-06 03:24:09.338
2	99934041-a9fc-4a86-b9c0-6c566047345a	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	6c584167-02f1-4ab2-ad57-11ab4c4fe7ae	\N	2026-07-06 03:24:13.368
3	99934041-a9fc-4a86-b9c0-6c566047345a	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	516a447b-75ef-4141-b6d6-eda0e6ac165b	\N	2026-07-06 03:24:13.999
4	0d53a61f-2558-4bf8-9760-c4ded5668e55	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	369fcf4c-81ba-4b60-b166-edba62a1e21d	\N	2026-07-06 03:25:07.68
5	0d53a61f-2558-4bf8-9760-c4ded5668e55	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	f371e14d-b325-447a-8775-5c2afb6a0d33	\N	2026-07-06 03:25:10.661
6	0d53a61f-2558-4bf8-9760-c4ded5668e55	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	d7d934da-bb3b-4ee4-a799-1bd4b86f6459	\N	2026-07-06 03:25:11.008
7	7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	79632c98-5eed-411f-af32-29dd7d54c7d4	\N	2026-07-06 03:26:14.353
8	7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	7f17322c-856e-4557-aad9-aa8ee5c40d27	\N	2026-07-06 03:26:17.474
9	7d2f0ca0-f2dd-45bd-95d1-c36446a1ad24	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	bd0320ec-bd7c-4892-8833-92cd2057dcf3	\N	2026-07-06 03:26:17.861
10	68094637-a069-4ee4-9f88-cf9136e20692	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	3ca62385-2b2b-4d53-b7c4-3f56b0bb0519	\N	2026-07-06 03:26:40.587
11	68094637-a069-4ee4-9f88-cf9136e20692	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	5db8645b-963a-458d-a7ca-f4c4c6eb0119	\N	2026-07-06 03:26:44.281
12	68094637-a069-4ee4-9f88-cf9136e20692	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	add5ee26-7ac3-4aef-82e1-645e42b8adf7	\N	2026-07-06 03:26:44.571
13	79e6625e-a08e-4f3d-b42b-aa535e8a86a0	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	d1877749-fc0f-4455-a4c6-c59b3bf8b38d	\N	2026-07-06 03:33:24.522
14	79e6625e-a08e-4f3d-b42b-aa535e8a86a0	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	6e86a69a-b255-4341-bdae-17d76789011b	\N	2026-07-06 03:33:29.574
15	79e6625e-a08e-4f3d-b42b-aa535e8a86a0	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	81329854-3b44-4b07-ab42-403592ee0428	\N	2026-07-06 03:33:30.27
16	ec176c50-5ab4-485c-9906-d048d939a119	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	c39c6af6-e2c5-48b2-acec-41f561e885a2	\N	2026-07-06 05:00:54.475
17	ec176c50-5ab4-485c-9906-d048d939a119	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	759772bb-87cf-452d-b714-8508c5f03990	\N	2026-07-06 05:01:02.225
18	ec176c50-5ab4-485c-9906-d048d939a119	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	e764e042-a28f-4532-86a9-f567e3141959	\N	2026-07-06 05:01:03.411
19	2fd51c70-25af-42fe-80c8-74203841a6c3	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	c238150a-abce-426a-a56a-2022ff3e215f	\N	2026-07-06 05:06:30.687
20	2fd51c70-25af-42fe-80c8-74203841a6c3	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	0f078f1e-bb6e-4ad3-a813-1f36a8aaf558	\N	2026-07-06 05:06:37.393
21	2fd51c70-25af-42fe-80c8-74203841a6c3	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	0da099da-808e-4ca8-b011-9513498089aa	\N	2026-07-06 05:06:38.809
22	2d107340-fdea-4992-b9c6-65a4233efab6	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	f8018b97-9f15-41c7-b786-de011c4bc835	\N	2026-07-06 05:25:11.701
23	2d107340-fdea-4992-b9c6-65a4233efab6	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	4475365d-64dc-4877-88d0-51fc54c41eb1	\N	2026-07-06 05:25:16.784
24	2d107340-fdea-4992-b9c6-65a4233efab6	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	3e6ee9b3-ea7c-4757-b94f-5f3f491576a1	\N	2026-07-06 05:25:17.496
25	6a4cd1b0-5b33-49f0-97a0-c14525779ecd	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	825a1b03-7a40-4b04-8db0-e009e3f7a206	\N	2026-07-06 06:10:34.647
26	6a4cd1b0-5b33-49f0-97a0-c14525779ecd	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	13e7c290-1b55-4868-9762-724c153bbfa7	\N	2026-07-06 06:10:43.823
27	6a4cd1b0-5b33-49f0-97a0-c14525779ecd	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	bd9d8e71-2293-42f9-a585-dac12335411a	\N	2026-07-06 06:10:45.055
28	7fd66471-d6f5-438b-ae93-450ff02ff5f2	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	55316114-608f-452b-a05d-ba981e85fdf3	\N	2026-07-06 06:24:34.767
29	7fd66471-d6f5-438b-ae93-450ff02ff5f2	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	d756f8f7-7f77-4322-93a1-3c0699ce3246	\N	2026-07-06 06:24:44.144
30	7fd66471-d6f5-438b-ae93-450ff02ff5f2	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	66c8f85f-9f00-4b9e-b8d8-88c0f1826867	\N	2026-07-06 06:24:45.384
31	0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	OPEN	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	6b0139bb-29fb-4273-883a-da37c13e4657	\N	2026-07-06 06:27:12.542
32	0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	DEPOSIT	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	e6f8adbd-c469-4814-828d-6cf985cfb767	\N	2026-07-06 06:27:21.952
33	0dff4b0c-cf66-4f0c-b157-1d46b631f6e4	CLOSE_CASH	100000	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	e3ac8442-0083-42c8-b8fc-3d0961ec03bf	\N	2026-07-06 06:27:22.904
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.sessions (id, token_hash, user_id, created_at, last_seen_at, absolute_expires_at, revoked_at, ip, user_agent) FROM stdin;
667da59e-4dfa-445c-8d7a-67fb56f66820	59a25967623899d554d5d2ecc642c741ff5571e167f2140b2a67cc50f1ca8cd5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:16:28.778	2026-07-05 11:16:28.775	2026-07-05 23:16:28.775	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
8c2c1034-51d4-466b-b605-e8f0fc5e15d2	0be786c84796fea26edab4a50b2e09cca7ef4856c9e701697acc03d3d2e1be14	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:16:28.798	2026-07-05 11:16:28.797	2026-07-05 23:16:28.797	2026-07-05 11:16:29.898	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
d131fdd0-9a19-46dc-889c-5d1ccb5d6fc3	6a3f9c399348bf5ea61ab4cb535232e08c5114c6ab6cd29325f370449c86a0c2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:17:20.77	2026-07-05 11:17:20.768	2026-07-05 23:17:20.768	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
91c8ea42-f184-4de1-8a33-07864c05bd87	cbbf3bdbc1f484e3911a918534d3e0f483b4d287a2935fd723ec974eea31cdba	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:17:20.771	2026-07-05 11:17:20.771	2026-07-05 23:17:20.771	2026-07-05 11:17:21.982	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
809a02b6-934b-4f10-af37-06a70c4f7281	bd228c97b2a1bd766ed9110c14252d0f0942cbdcbaa86f6dc1ebef29f73b4fc8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:23:15.034	2026-07-05 11:23:15.03	2026-07-05 23:23:15.03	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
de0dbbd8-31a5-4e06-8456-1d3b9a73ef76	0702ea87d43b59b84a5e328f877895e968901e32f7d74a95324ee9c96b440403	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:23:15.04	2026-07-05 11:23:15.039	2026-07-05 23:23:15.039	2026-07-05 11:23:16.114	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
8b198428-2c32-4640-a6cc-913cc7a5ef23	2dfdac42209e3db1e013c00ee33ee87bfdb066d7cf26d5beb3cf989cc91341df	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:23:15.036	2026-07-05 11:23:15.035	2026-07-05 23:23:15.035	2026-07-05 11:23:17.549	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
1269dc86-23a1-4282-be87-15351799d707	8c26e3966db67623d936311e5f0ac8738520b7419f3dda0da7f799a754cc7667	66386734-f3d4-45f3-a57a-86962faec426	2026-07-05 11:23:18.173	2026-07-05 11:23:18.172	2026-07-05 23:23:18.172	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9a4a3069-8a7b-43c6-86d7-6893548027ff	ee0ae97a27198c0265268c9ddb0d80a78660dd92d29c3baf29725fe8ca94a2fc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:24:12.94	2026-07-05 11:24:12.94	2026-07-05 23:24:12.94	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
263b733b-1f4e-43fd-aa03-ad5e0eea13ad	654d342b60ef395b662796914bc90f1d15bd453e416fd098aa70868a6ff47d92	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:24:12.939	2026-07-05 11:24:12.937	2026-07-05 23:24:12.937	2026-07-05 11:24:13.998	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
47d1cf0d-189c-4f41-934c-6b6c017a3411	cd8da074440b47209715bd7f7d99cef201081938f2c266d5a1eec53a3facfa92	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:24:12.944	2026-07-05 11:24:12.943	2026-07-05 23:24:12.943	2026-07-05 11:24:15.363	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a90e592c-cb91-4f4c-a159-5ab5c689355f	f4b73bc37aea34ff974abfab8428c316d97a86aa99c7b74bb7d96d380eb57f07	be5cbe16-3a0f-4905-a442-18eea14d23e6	2026-07-05 11:24:15.837	2026-07-05 11:24:15.836	2026-07-05 23:24:15.836	2026-07-05 11:24:17.516	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a279e01b-aebc-434f-8274-9a50f75bf573	e62d08646e2b2d1cbe69a9bf422b936747861138b3e18d568fa278b51c04e7f8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:25:23.486	2026-07-05 11:25:23.485	2026-07-05 23:25:23.485	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
dec147c0-21f7-4990-8e78-1b6262da2ebf	c85647e9883d57d343964f6cba821ba4c7394fc63a8238f7263bda6e9e18abb2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:25:23.475	2026-07-05 11:25:23.471	2026-07-05 23:25:23.471	2026-07-05 11:25:24.485	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
97b64da0-8cba-4fd6-a532-165738271599	b845834f6e85bef0b8f1419a2a100be0e3f5f09c5e993b91e3569c97af817e77	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:25:23.487	2026-07-05 11:25:23.486	2026-07-05 23:25:23.486	2026-07-05 11:25:25.885	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
fd394ec4-21ab-49fb-b2c0-df16230d1d17	e06649f098ab1c2f1c295c482aaabb38c57b27240bd5bb3053b4b298f208267a	d788f6cc-2452-4040-aea7-c5432733bd56	2026-07-05 11:25:26.478	2026-07-05 11:25:26.478	2026-07-05 23:25:26.478	2026-07-05 11:25:28.198	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
fb14de98-1f87-4195-861d-c4db092237a7	140c6b8a70ed2fe754cc6b4c7672a061cbeaca86913e39c9db5fa0cde7b99dab	d788f6cc-2452-4040-aea7-c5432733bd56	2026-07-05 11:25:28.942	2026-07-05 11:25:28.942	2026-07-05 23:25:28.942	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
7a0f13c0-f6c1-4654-b8e7-2c323352f281	ec79ecf722fb1127d9ddc44574b83a42e985c1c6468554cf3e473c0eb30ec8c1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:56:27.851	2026-07-05 11:56:27.846	2026-07-05 23:56:27.846	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9321780a-3d27-4cc2-9438-e1d696789f0d	e1f868c3aac5f5e0365d6864190bce76a1528cc1c62b751e2e31e93871fdc07b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:56:27.898	2026-07-05 11:56:27.898	2026-07-05 23:56:27.898	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
57e2d413-2b3c-4e68-b01a-11216f1b2093	704aed61903d10f9e963701376d63d1a17245a13688295164c096dd46481e820	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:56:27.905	2026-07-05 11:56:27.904	2026-07-05 23:56:27.904	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f5647014-fbbf-479c-ad65-bc40539f89a3	f6ae5457e5be07df600885775de3a9404e6b32b5e61b24abed06ab9aef9ec7f2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:56:27.901	2026-07-05 11:56:27.9	2026-07-05 23:56:27.9	2026-07-05 11:56:29.23	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
b66be497-f6c0-4320-85b1-22de436d4bb2	5502cac77640282fa90f856b52139e06ed670877e638e84cf51d2c2915eb9e36	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-05 11:56:28.087	2026-07-05 11:56:28.086	2026-07-05 23:56:28.086	2026-07-05 11:56:31.895	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
827c200e-6928-46b6-b776-25b511eefe26	fb069fa107dc6698a14525ec1b7fdde14ede66e625de34662c5c55151893efbf	2c547ede-b3d0-4940-8448-dcc194dc7662	2026-07-05 11:56:33.067	2026-07-05 11:56:33.066	2026-07-05 23:56:33.066	2026-07-05 11:56:34.751	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
6df42a79-4a0c-4744-bb07-1ce67a71da3e	1fc90991a9e474485074b613970061039765990f8eee8d046dd8dbb2352c7f8e	2c547ede-b3d0-4940-8448-dcc194dc7662	2026-07-05 11:56:35.651	2026-07-05 11:56:35.65	2026-07-05 23:56:35.65	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
5b13c8c7-bb31-4245-acb8-d7a19b6c96f1	64841d67ea1780020f9969c0e8528a074988dc0495720f39c684e8dade46cb88	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:29:34.515	2026-07-06 02:29:34.51	2026-07-06 14:29:34.51	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
d963b219-aca1-4d60-88e2-1597e3fd43ce	adc12432e47906cf956674fa1a254e98364378f8414eb5fa09061de46f6e9fe9	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:30:37.285	2026-07-06 02:30:37.281	2026-07-06 14:30:37.281	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
0cfe09e8-a09d-42d0-b746-9045ee61766c	a533c401bc6e29a1bc5397b87c63330aa87203b493557a6dab14fb1255baeb6c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:28.705	2026-07-06 02:31:28.701	2026-07-06 14:31:28.701	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
3008829e-bcbf-42f0-8fcf-8f1574104e00	3ca4d47903d44c188327266493cc7eb49db5f4b5967192a93babd99eb0c39818	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:55.027	2026-07-06 02:31:55.025	2026-07-06 14:31:55.025	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
423c7f62-f7d6-4673-85ce-2f3aa0a1265e	384b8b35d50fd015889616e455d941853de0202bdd9b377bb60fc81b28693541	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:55.044	2026-07-06 02:31:55.042	2026-07-06 14:31:55.042	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
e66b22ae-b31e-4506-9a70-ec1e8bca1878	0ebba4d565e1dc84e667af598b44c4289b1611a5dc22a8cfe589a9e11314e9cc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:55.055	2026-07-06 02:31:55.054	2026-07-06 14:31:55.054	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
ba3dcb3f-9884-466d-9896-8ae09833ec55	1ef2402752c4f0159022aa8b753e3157d37e7b71c285ab85f327b3335cc93c2f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:55.299	2026-07-06 02:31:55.298	2026-07-06 14:31:55.298	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a10a656a-292d-4aa4-8e78-a7e2bded41db	dac928c7f9e54f7b6c680471308a144c89b788954dfc4889cc0bf1f3baa475f1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:54.956	2026-07-06 02:31:54.944	2026-07-06 14:31:54.944	2026-07-06 02:31:56.631	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
28678eff-964d-4d48-84f6-a7ee9fa11ed2	a95a53b3d1672310f51e09a7995cabc8d8aea539284f378f9218b31a52676266	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:31:55.378	2026-07-06 02:31:55.377	2026-07-06 14:31:55.377	2026-07-06 02:31:59.747	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f3cfaf99-e518-43d5-850d-52aa06cbdc9f	527158e08a895a0f82d715e1385b26344109289d399e5c0ffaddef51586d9a3e	408b48e4-8342-46b3-83e3-131ea6928587	2026-07-06 02:32:01.168	2026-07-06 02:32:01.167	2026-07-06 14:32:01.167	2026-07-06 02:32:03.837	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
7e4688f4-c727-453d-b8a9-da2831332392	3113e73112740ed440c996ed5ad14ce9055bcce1f15e9dfd3a74779e8773430d	408b48e4-8342-46b3-83e3-131ea6928587	2026-07-06 02:32:04.733	2026-07-06 02:32:04.733	2026-07-06 14:32:04.733	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9185c753-55ba-43d4-a435-e39868bcb124	f781793f98d4fce8c24f5493255d46cae4ddc5be0b3761e8f8365df1f727d97a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:31.309	2026-07-06 02:37:31.301	2026-07-06 14:37:31.301	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
be6aca8e-efde-413b-90da-ee7619627769	9d5f4e3279ca0d0caeb395086a8661839a40e5310b80321e7eb3a09e5ad3dcad	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:31.312	2026-07-06 02:37:31.311	2026-07-06 14:37:31.311	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
6ef8bba0-5ed5-4679-8585-7ef61cc6cd41	89806b7bc498b613a8b97bfbbe0e5a686672f7a22104e515090d4bf2b5b02273	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:31.322	2026-07-06 02:37:31.321	2026-07-06 14:37:31.321	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
daee19ac-aaae-4647-90ac-b0d651f3ee28	6b71b997ffc3cfd71c102435f0ca03f23864eb44a86f65ee5e2ee9ba31bcd7c6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:31.399	2026-07-06 02:37:31.398	2026-07-06 14:37:31.398	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
fe726a8f-3995-45b7-be15-d6452320ad93	6fa77849d7836ded80d94ff7b35c521cfefe62b44b4568a91e8d07f875535433	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:31.39	2026-07-06 02:37:31.389	2026-07-06 14:37:31.389	2026-07-06 02:37:34.168	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
6117af2d-f032-473e-88c2-f9c2fc644a19	a97e53cdcb2861ddc04cba7b3acaf3833ec9efab20484a630a48dcd41815c281	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 02:37:31.43	2026-07-06 02:37:31.429	2026-07-06 14:37:31.429	2026-07-06 02:37:35.422	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
50ae43f6-1e4a-4e3e-9773-aeca82e78593	32bd2e4c52cab38a1df7f18e93c91f68adcb046f41bfff1a579df23cfe0e9c65	6bfff212-e20d-458c-8c3c-8ee808226883	2026-07-06 02:37:36.064	2026-07-06 02:37:36.063	2026-07-06 14:37:36.063	2026-07-06 02:37:38.233	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
1052603d-bc9f-421c-8fb4-e65bda011573	f8f9a51a219e1489efc68a11b146a6b7bc9d326ea5f4011e97f99b6d5753787a	6bfff212-e20d-458c-8c3c-8ee808226883	2026-07-06 02:37:39.6	2026-07-06 02:37:39.599	2026-07-06 14:37:39.599	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
14c083ef-fcb2-42f7-96f0-4324ad8efbb4	2ca33c04651aa260ebc6a8faf40353bc8d972458da0de427de1e402157be403d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:24:04.86	2026-07-06 03:24:04.85	2026-07-06 15:24:04.85	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
82a1c25b-8d07-4c7b-b67e-639dee320570	3b425a916fb902908404b3525973e7ee646655dfb7df648e773abcf656bd642b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:24:04.863	2026-07-06 03:24:04.862	2026-07-06 15:24:04.862	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f8d64e6f-870b-4a56-8d3d-df9df005170e	122b212a347df7eb78f8c054733a8f41dcfeb658c2202d40e7471769bc03eaac	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:24:04.903	2026-07-06 03:24:04.901	2026-07-06 15:24:04.901	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
bc17c0a7-6771-4e85-9d17-61eca874d0a7	69a6674172ddfece2727ce6512ed34cd0a45a0b2acf0ec192226307dabb86e2b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:25:04.949	2026-07-06 03:25:04.943	2026-07-06 15:25:04.943	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f65c5d16-3d02-4b20-892b-221c735e8d49	4c62382a70f25280fbb35d21c3c1d9921a4fd0ca068a8af65395881f05303588	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:25:04.951	2026-07-06 03:25:04.95	2026-07-06 15:25:04.95	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f378e4ba-25ce-47dd-9c0a-e9924ea74083	f9da15a80c6108970265813146485d43e9aa7e83849e7e57f4318962d2be1cda	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:25:04.981	2026-07-06 03:25:04.98	2026-07-06 15:25:04.98	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
96851f39-781b-4b2c-8312-1e36393a46e4	ff81d242cdb6e4605e0efbdf01068ef9a35d7cb0dd867944f7048c884ea933ab	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:11.599	2026-07-06 03:26:11.594	2026-07-06 15:26:11.594	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9c7a89fa-4e39-4b4c-8a15-6c33e5947511	54f19febfdcae6c23df47d18191b0c730cfce159f8badc0ab96d07ca7583013a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:11.602	2026-07-06 03:26:11.601	2026-07-06 15:26:11.601	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
8c1813a0-dfb6-444e-98e5-3c796b44aa4c	eee8097f91c0af0da2d07f22c60709a98186b592fe2a0e53b0ccca4bb07526ca	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:11.603	2026-07-06 03:26:11.602	2026-07-06 15:26:11.602	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a03f7eac-cf89-4b36-a8dd-28f1909b07a0	d3c4147e52140cfd28224a714dd1a69bdff35723a1f64dc844f7b0f80fb41334	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:37.645	2026-07-06 03:26:37.642	2026-07-06 15:26:37.642	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
40f2b8bb-6e6a-4fbf-a156-5f77f2f4ce61	ff7b935b57bccf94bd9e2bffd2355aa1505ff946e9682590b8f984248632d644	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:37.705	2026-07-06 03:26:37.704	2026-07-06 15:26:37.704	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
47aeed3a-8c11-4c27-a273-e1f721cd7f46	084229f894ef4b2a8b67ed17f0b5cd7bfaaafcf12489a9061ddcfa8027122a6c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:37.709	2026-07-06 03:26:37.708	2026-07-06 15:26:37.708	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
17c35508-f389-431a-b36d-f461836dfc3f	cbad0a6513c1a10b5ac94bdbf72e88b82b3c738c0cf77d856467f0c0693adb88	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:18.926	2026-07-06 03:33:18.919	2026-07-06 15:33:18.919	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
ba6870b4-58d1-4d35-ab69-93bd5f5dace9	add3e132f30e9c2381467c98c0148563fd6c09a7677ed4b33931e34bd5e36f3d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:18.931	2026-07-06 03:33:18.93	2026-07-06 15:33:18.93	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
b10fdd5f-5c0a-4f86-91c9-cb1b0779fb10	0d80f411137dabdcdc2b23a9fbbdb4974f07f72cf673e5b11c4672781a2cf72d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:18.934	2026-07-06 03:33:18.933	2026-07-06 15:33:18.933	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
5a948d07-2e03-45e9-ac2c-1cd86dd6eaa0	94d9f67a5a43a367184a8e6c2339d630a6e5df86672c56aa6676dca9d2cda921	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:19.12	2026-07-06 03:33:19.119	2026-07-06 15:33:19.119	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a27eec18-a7e2-4b15-a2fa-f760b9703da7	bd7c910166bfce2cf16ccd8159422ea02ba129012bac996e3d0e1ebc746d3697	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:19.239	2026-07-06 03:33:19.238	2026-07-06 15:33:19.238	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
83652d7c-a816-4659-b71e-44e395da6c5e	fc248d116c1aa652e1e6e7eba3c491e62d93e760a84fe49294c4d8be1e1a4675	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:19.615	2026-07-06 03:33:19.614	2026-07-06 15:33:19.614	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9e6d74f0-678f-4811-939c-3e42c05d1337	c0f2c9689f7bd88b54bc231c4eb142a6b5bd88a45e811408ee789ba722fb71ed	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:20.769	2026-07-06 03:33:20.768	2026-07-06 15:33:20.768	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
746650fd-d759-4b82-bdd6-bc273dc4db7b	1e469774ee277915c925b4f8f22aa48b677caa643c62b6bb84ffde57f0c5954d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:19.013	2026-07-06 03:33:19.012	2026-07-06 15:33:19.012	2026-07-06 03:33:21.207	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
ec529b0c-2ca7-431b-a80a-e989cf4400d3	729d3b57bed9fb5173768dba984f6d75891d8cd7d71e1f7ea586401d1020a8a2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:25.607	2026-07-06 03:33:25.606	2026-07-06 15:33:25.606	2026-07-06 03:33:29.171	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
1fe3d534-d02f-438c-b762-cd401c0bafe0	ab0e17601b26f7b5a2715e78e9617728d9e317674834afd85d6569525189bdda	7e40436a-dd19-46d4-b9a5-5709b7bd243e	2026-07-06 03:33:30.509	2026-07-06 03:33:30.508	2026-07-06 15:33:30.508	2026-07-06 03:33:32.518	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
691ae8f5-ff15-4a4f-838c-4c10d6d0f6b7	3771c557ea17ea93293aa585472378fd18aaab6d564a40aa99039448e9e22c45	7e40436a-dd19-46d4-b9a5-5709b7bd243e	2026-07-06 03:33:33.37	2026-07-06 03:33:33.369	2026-07-06 15:33:33.369	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
378ab29e-67be-4320-9903-46bbb0af4a6a	b6b09a64be7945070a1f117ff2e02cfdb79a1a237bc00ad05f6f11751be7c4f6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:40:52.899	2026-07-06 04:40:52.893	2026-07-06 16:40:52.893	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
30e16140-0a57-47bb-b1cd-b078b212e9bd	ea6b37ba258e16c68d749ec9a58527946aa5ea4dbac17093f7d4aea9f0a19a28	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:40:52.902	2026-07-06 04:40:52.901	2026-07-06 16:40:52.901	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
37d8678b-1794-47ec-964d-a7d4eecde8c0	4df32477d8f1e67cb2ff6152a1712e884cd1b7ccbe365989adab1ad7759fa260	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:40:52.919	2026-07-06 04:40:52.918	2026-07-06 16:40:52.918	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
5de40505-706d-422f-98b0-531e71bf2ac4	eb7f3a68cc274344faa7e202e4cfbbb10ed20022206bc20c556662168ae21a9a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:22.235	2026-07-06 04:41:22.228	2026-07-06 16:41:22.228	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
e3a70351-dfb7-4c38-98c2-041a432d2f99	b31bfa24f9f8c9365c748c6b47f10fe18ae7bebfc07425ead35ce6b7192bf63f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:22.237	2026-07-06 04:41:22.236	2026-07-06 16:41:22.236	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a86e6d47-6876-4482-b692-63aa93651d15	038db442dab5d9cfd5166b8e2a0bf526d6d15327fb1885939b74c97ff515ae6f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:22.26	2026-07-06 04:41:22.259	2026-07-06 16:41:22.259	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
2d4e0ba1-b049-4488-8e4a-c1f21fb25b1a	8f004c5b3d5e6911506e284446fb5f4ae7e71851478c83faadecff9b022a1720	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:46.251	2026-07-06 04:41:46.25	2026-07-06 16:41:46.25	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f27424c2-31e6-4c44-bc8d-e02119cff3d6	9680f6996d0d9dc46c82ef25256789178e4c40abb876ed038c46b055306122bf	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:46.261	2026-07-06 04:41:46.26	2026-07-06 16:41:46.26	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
57b81f01-67bc-47e7-b670-2380f2920aaa	fdce6cbc1e67e8b3f76962d05443428d9dfbbc7505caeb6dfad9e1191eeead73	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 04:41:46.183	2026-07-06 04:41:46.177	2026-07-06 16:41:46.177	2026-07-06 04:41:47.718	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9c5333cb-9c31-4373-847c-3cfba2d5454f	bed0277e37add11b59fb9513cb874c8f548ba00a55824fe5c8b14465eb425ae1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:43.638	2026-07-06 05:00:43.626	2026-07-06 17:00:43.626	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
c9b30aa0-3a3f-460d-b558-4a5b93ee4b92	db3421dee41e593d1a9114ce78b80aa2786236247ed68759a6df23f390d731cb	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:43.681	2026-07-06 05:00:43.679	2026-07-06 17:00:43.679	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
fcaca7b9-b991-45c1-9273-9877ba877de2	e5592519ea5fabb508973f4ce102c93dd2ef9cd8c172b7cd7a8619cb9d35714d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:43.691	2026-07-06 05:00:43.689	2026-07-06 17:00:43.689	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
035e17ba-c72f-46df-86c9-d16f66842988	21d2119a68923e3c1c7ef02d9861b5938f5c1fd517f8cc84123bae15dd3ce729	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:43.729	2026-07-06 05:00:43.727	2026-07-06 17:00:43.727	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
4e8e76e4-4587-4b1f-9195-bfc52ae418a7	477cb75dfbe31b6e9ae91437acd038a43c31a9161182c435a0279321618b7322	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:43.746	2026-07-06 05:00:43.744	2026-07-06 17:00:43.744	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
2c286596-2b92-4015-8f0e-5faf67e39d8f	e15880af767546fb9d33d59be5b5f6cc288719919cb13ed504bfb2d798bf7df3	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:44.548	2026-07-06 05:00:44.546	2026-07-06 17:00:44.546	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
be8c4c05-a341-4e3b-8f72-cd41d98abbee	1790e7b3787b75cb42907982f74b2c3fa62473970fd3ee8af0ed01cadc1779c7	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:46.404	2026-07-06 05:00:46.403	2026-07-06 17:00:46.403	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
d4a8ce59-a3f7-4a2b-8e6b-50a6d7eeea00	3f97940b9ee2d4dcb93b75839a8763897c83b8733ee47cfe3a8d58b2db41bbd2	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:43.83	2026-07-06 05:00:43.828	2026-07-06 17:00:43.828	2026-07-06 05:00:47.099	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
c9cd9cb4-5111-444c-b376-420d00e3e7f0	1b375345aef1ab895234b2e225b267d2757d37c3c4e69fa54b304fcfc634b763	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:55.165	2026-07-06 05:00:55.164	2026-07-06 17:00:55.164	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
05834640-1c60-4f8d-8cdf-83321882d02a	a8c3b5dfcfc7f2506d40116c5dd4b6c4d85ce4c868e6979edda61809c35a002c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.102	2026-07-06 05:06:21.089	2026-07-06 17:06:21.089	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
56ec5d75-5353-444f-bd29-6ad6cf09cf02	55d61dd2f7a66c32fc785025748db1cef92d6ab851d45e1e817e8a5b717324c6	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.117	2026-07-06 05:06:21.115	2026-07-06 17:06:21.115	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
7ded7afe-de57-4d0f-8e55-5072ad393c28	a2a307ef85299ed66b450352ea5eb72f6abf7ccfe1cd83c78c1559575791ca77	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.196	2026-07-06 05:06:21.195	2026-07-06 17:06:21.195	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
68abf180-6edc-45fb-adb6-28749297ef01	342d06cfd0b61f8965db29a41fd6f0f89c177250bbc292b3d09590a9fb07a8da	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.204	2026-07-06 05:06:21.203	2026-07-06 17:06:21.203	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
2b538a6a-4afe-45e3-bbb1-69d181e624eb	40fe2736c1eb0e17e473942bec05e1916f57c500ba1e52e2e02e8377d7eedf5c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.216	2026-07-06 05:06:21.216	2026-07-06 17:06:21.216	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
ccd9a1b4-4071-4f9e-be2a-4acdba9684f9	58651037d8af76fa4b064fd4104eaa59b4f3354189d8bf883bf25b506c56128f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.89	2026-07-06 05:06:21.889	2026-07-06 17:06:21.889	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
e208d61e-f507-49f6-9b30-32d2d5185b67	a0ab1047708f1e96bc66e51f473cd96b814371d24c3741bac035f2defc1ed498	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:23.934	2026-07-06 05:06:23.932	2026-07-06 17:06:23.932	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
2d6f25cf-6b88-4c93-ae89-f0f759b019e6	d9a026da444bae46695a079dc30b724f1e44efe898fa37e76cde1ce98193d2c5	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:21.121	2026-07-06 05:06:21.119	2026-07-06 17:06:21.119	2026-07-06 05:06:24.181	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
dcf3a19f-2305-4a32-9b73-0d18b681a0d8	7c3c8ef8c8d6dc47f63a3920b55b9261ac2b25c46c3d342df89fcd260ac9f79a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:32.005	2026-07-06 05:06:32.004	2026-07-06 17:06:32.004	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
aad6d489-cb07-4eb3-9a47-d486ff069f41	d4d56b3207a4e7c81b8d0d96fe63ae99a1b2198066faee26372224227d0b4004	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:24:59.539	2026-07-06 05:24:59.538	2026-07-06 17:24:59.538	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
978b42f9-0a71-4024-b923-220da7ac4bca	506655d248a92b13892697bdd78f5a92a8b6d6cd1f09c8492d2b6f5dacf4619d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:24:59.541	2026-07-06 05:24:59.541	2026-07-06 17:24:59.541	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
4331c50c-e6ff-4e94-ace2-2f048d7a8808	70bbcdc7929e5e8d3606528714568d3a28ae407d0c7186a142330875bf15ce35	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:24:59.535	2026-07-06 05:24:59.528	2026-07-06 17:24:59.528	2026-07-06 05:25:01.132	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
5f3de219-9274-4de9-955a-bc64d43e661a	069b5fe419b493096b3e37bf5e42113d929f42f86efbc449f8df4f01ebf6ab3d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:24:59.537	2026-07-06 05:24:59.536	2026-07-06 17:24:59.536	2026-07-06 05:25:02.817	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
73418cc0-3b76-4528-8e33-165540e36e6f	afce849413a6f83056440e6df1c8393586802365a8c79684f218ba6fbd4bae6f	f31bb720-310f-476e-a57a-72844b8f1ca3	2026-07-06 05:25:03.328	2026-07-06 05:25:03.328	2026-07-06 17:25:03.328	2026-07-06 05:25:04.944	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
193fc2f1-ed90-4e7e-9dbc-8dec19b66a90	50be45e88cf5476e9aeea0967028ced852ec4a2d2a15836752a59a229050c924	f31bb720-310f-476e-a57a-72844b8f1ca3	2026-07-06 05:25:05.814	2026-07-06 05:25:05.813	2026-07-06 17:25:05.813	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
3b8166a1-6ab9-4cbb-adf4-2239dd4c7531	ec5a94765ca00311dbdf5c9f308cbe7be718f5c07f2132d1ddb97a6e13cde6d0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:06:59.616	2026-07-06 06:06:59.606	2026-07-06 18:06:59.606	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
ece47f18-e4c4-4f8c-b230-61af6cb79734	37857e508748286fbeecae477ef63b9fb56dc1be932bc6c6c1b70a9525b63e60	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:08:01.147	2026-07-06 06:08:01.138	2026-07-06 18:08:01.138	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
5c866eb3-2a0c-4d3f-a5f4-2fb3f1d17119	6269e4ed6142621aec86ec9f6871f938c6a89a95f3a841601498a5bcb99959c1	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:08:58.002	2026-07-06 06:08:57.992	2026-07-06 18:08:57.992	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
7a76a410-6d19-44fe-8f9a-b4a8c0df1aa8	0abef444ec35f0c5c7545fc9fe11123ef4618e8bd9b1adb3043818303ca6376b	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:09:40.149	2026-07-06 06:09:40.141	2026-07-06 18:09:40.141	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
790b601c-2e8f-413c-90c1-d2f56d956b87	7583e1f62418e432c45e7493f53a1161de0ec5e373bc095e534a9ee72443d46c	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:15.105	2026-07-06 06:10:15.098	2026-07-06 18:10:15.098	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
294c01b2-5d8e-42b5-99cf-1971f188268b	20ee54eeff977ffb08bac6fc9e27dfca878dee05053d6e0b6a7a5fcc4fd9c90d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:15.153	2026-07-06 06:10:15.152	2026-07-06 18:10:15.152	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
d8acec07-bbdd-4abe-af5d-6dd1d14e82ae	be3647fb8489d046e97d87c855944557ea6cdf5cbdbd7261fcb0434bbc71ce46	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:15.155	2026-07-06 06:10:15.154	2026-07-06 18:10:15.154	2026-07-06 06:10:17.347	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
be0173d6-420e-4ea9-a26b-2ca20002360d	734bf3ee181d1d370bbd4116c58a9a458c6f4f4f2007835b8b23f0ac39c7a2c0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:15.158	2026-07-06 06:10:15.157	2026-07-06 18:10:15.157	2026-07-06 06:10:20.529	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
d20ae3a7-1be8-4211-b005-17d0f49d34fd	b62d2d9253488acad6e59342e27d48a57e64e16b99cbffd9805fe1b849851fcb	4f9a0c71-128f-4b9d-853e-2b6561d65d00	2026-07-06 06:10:21.416	2026-07-06 06:10:21.415	2026-07-06 18:10:21.415	2026-07-06 06:10:24.362	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
53cbabca-68a3-4ca2-a040-2ffc415b33bc	30056c1728a0315d00e2b7402e01a6e1ef3ececa1611868f2ce48254dffd2b69	4f9a0c71-128f-4b9d-853e-2b6561d65d00	2026-07-06 06:10:26.002	2026-07-06 06:10:26.001	2026-07-06 18:10:26.001	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
9b124990-01f9-4d1e-bc50-478a2dbf0d75	96028913d2bb57dbfaa9352a34ad1a2843978a11550d3b359030677747a7b0b0	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:11:15.433	2026-07-06 06:11:15.423	2026-07-06 18:11:15.423	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
6d4c6199-1fef-403a-b13f-ed7cf56eaea1	383c12f16e266edafc02ff035924d9aa8471dfd2b86b67351cfbd4235f969c5f	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:15.695	2026-07-06 06:24:15.686	2026-07-06 18:24:15.686	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
2bbc1710-024e-44cf-bcb2-7e08f0303d41	082a7ee130607d7d666ddf9132cb6d3ae7887f3310e3c3a05cf4f925fe765a61	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:15.743	2026-07-06 06:24:15.742	2026-07-06 18:24:15.742	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
2b80959f-1bee-4df0-8294-9157cf895dd6	81acba3d458c69321047d375c9b6f4b66807f12f9b8f4896fb489a6f33aec641	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:15.698	2026-07-06 06:24:15.697	2026-07-06 18:24:15.697	2026-07-06 06:24:17.96	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
5ad0d542-93ac-4e16-bb42-5ac6cec25021	fb0431d9b95ead59dbd5cbe0cffc77dec8d951c9d78d616ac83d9fdaf331d41d	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:15.7	2026-07-06 06:24:15.699	2026-07-06 18:24:15.699	2026-07-06 06:24:21.167	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
f74f6d49-0423-42b5-9624-18629845ac87	01decf851afc7afef0702a7d2c6fb98751bb2b8ac8ba1a4cffdeab451eab7ced	89110bb3-4b20-4c4f-bf79-fba611c411f8	2026-07-06 06:24:22.068	2026-07-06 06:24:22.067	2026-07-06 18:24:22.067	2026-07-06 06:24:24.86	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
a1ce3b0a-7747-4f4f-8b81-82b851e97d7a	394b66721d459506106c2aed073ed5b5c6dadb5d718fd979adf9032885b16727	89110bb3-4b20-4c4f-bf79-fba611c411f8	2026-07-06 06:24:26.524	2026-07-06 06:24:26.523	2026-07-06 18:24:26.523	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
8aa2e8d7-d35f-4fe7-ba53-b677d953cfc3	a0191aa6b2ebf5be8268b81861fdd65cd371bfb6c20467d8faefdcd02a33c101	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:25:25.176	2026-07-06 06:25:25.168	2026-07-06 18:25:25.168	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
017d5c7b-8751-4ec9-8496-fdc51f06f5cb	cda2be4665705af6c8e98501ef8c28005583a44b7ae5ad828598f6c5183b8263	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:26:23.445	2026-07-06 06:26:23.436	2026-07-06 18:26:23.436	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
112cab48-2e1b-4377-99a5-dd3299b119f3	739067733c2784891019b53fe7b0e0eab61804c08e604393f8a34de004b93af4	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:26:53.022	2026-07-06 06:26:53.013	2026-07-06 18:26:53.013	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
77a44266-fc8a-412c-92b5-2e8d5d9861f4	1f17089e91ba13b324ef54df86577f41a41c9dceaa02e2b7344843179a586786	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:26:53.034	2026-07-06 06:26:53.033	2026-07-06 18:26:53.033	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/149.0.7827.55 Safari/537.36
72d6c0e0-4629-47d1-a0e2-cc00ab9e570b	7f07a3c1fbda4974973358a67147916acb0ac3ccfbd98a0074ee215d0a3407bf	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:26:53.025	2026-07-06 06:26:53.024	2026-07-06 18:26:53.024	2026-07-06 06:26:58.574	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
7fb8e070-d373-4b08-b48f-860274a22153	22e20cae3f7492e62c19aab148a3d656f5749db16f25d69801ccd04bde3a37f4	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:26:53.091	2026-07-06 06:26:53.09	2026-07-06 18:26:53.09	2026-07-06 06:26:54.83	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
b3ccb71e-d2c7-4bd5-93e1-bdc96d99ca79	80b90f6cab63d83462a82e6d4451b583994b77b381e024ec5b154b33c64de483	a9babdcf-7232-4243-9bec-8ef76e94f2f9	2026-07-06 06:26:59.476	2026-07-06 06:26:59.475	2026-07-06 18:26:59.475	2026-07-06 06:27:02.45	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
531700ad-3989-478f-93b0-920671c83fba	2a3512a27274b836a187c1df8cbcb278516b1f9c337e5ff86bee15e7ec37cc73	a9babdcf-7232-4243-9bec-8ef76e94f2f9	2026-07-06 06:27:03.699	2026-07-06 06:27:03.698	2026-07-06 18:27:03.698	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.settings (key, value, description, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.shifts (id, branch_id, drawer_id, opened_by_id, opened_at, closed_by_id, closed_at, start_cash_satang, end_cash_satang, expected_cash_satang, reconciled_at, reconciled_by_id, status) FROM stdin;
\.


--
-- Data for Name: shop_price_announcements; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.shop_price_announcements (id, announced_at, bar_buy, bar_sell, ornament_buy, ornament_sell, based_on_feed_id, announced_by, note) FROM stdin;
7721ba4d-536b-4537-86b4-f8922ef0d8bc	2026-07-05 11:56:31.401	5095000	5105000	5053200	5975000	02e31fcf-4102-4b48-b7cd-acc3517756bc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
01f1f320-172c-4dc6-b909-c0e74cdfa0d2	2026-07-06 02:31:59.351	5095000	5105000	5053200	5975000	02e31fcf-4102-4b48-b7cd-acc3517756bc	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
306b6da1-dfed-405e-a16c-48975d825227	2026-07-06 02:37:35.125	5088000	5098000	5046200	5975000	03ef4a9d-2f89-4563-9178-7804a5613d34	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
87169750-2dfe-4f38-a393-da3e066b5c1e	2026-07-06 03:33:24.978	5088500	5098500	5046700	5975000	e34259d6-eded-49ff-978a-c0ddf34fd005	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
777bf21e-8a0c-411d-895c-4110d1166e26	2026-07-06 05:25:13.583	5094000	5104000	5052200	5975000	3e25eae1-a273-4b2e-a987-171675687d15	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
9df89045-9b67-4d66-9ad0-89fd6991d417	2026-07-06 06:10:41.067	5095000	5105000	5053200	5975000	65d2743e-1a4d-4e7d-b28f-66278203347a	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
4937ecef-2a36-4f6c-b734-a7dd875f9baa	2026-07-06 06:11:20.354	5089000	5099000	5047200	5975000	bf10b7df-29d0-49b5-9849-a1b052a581a8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
afe47a37-8f39-4c57-8571-d56768f37af7	2026-07-06 06:24:42.286	5089000	5099000	5047200	5975000	bf10b7df-29d0-49b5-9849-a1b052a581a8	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
20dfa02f-3250-464c-9271-3fa2fb0b8023	2026-07-06 06:27:19.05	5090000	5100000	5048200	5975000	b9c8648f-a002-4a41-8102-ac1a4639ebef	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	\N
\.


--
-- Data for Name: stock_count_items; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.stock_count_items (count_id, item_id, expected, found, counted_by, counted_at) FROM stdin;
\.


--
-- Data for Name: stock_counts; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.stock_counts (id, doc_no, branch_id, status, created_by, approved_by, started_at, closed_at, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.stock_movements (id, movement_type, branch_id, product_id, item_id, quantity, weight_mg, cost_satang, ref_type, ref_id, actor_id, request_id, note, created_at) FROM stdin;
\.


--
-- Data for Name: storage_locations; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.storage_locations (id, branch_id, code, name, kind, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.suppliers (id, code, name, phone, address, note, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tax_invoices; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.tax_invoices (id, doc_no, sales_order_id, customer_name, customer_address, customer_tax_id, is_full, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: trade_ins; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.trade_ins (id, doc_no, sales_order_id, purchase_order_id, net_amount_satang, created_at) FROM stdin;
\.


--
-- Data for Name: user_branch_roles; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.user_branch_roles (user_id, branch_id, role_id) FROM stdin;
beb4ff84-6047-4c0a-ad07-399a42e7d2fc	c4b3f601-0a95-485c-ab49-fa23c5f5196a	d9d7df78-e8c3-475e-93b6-945fd378c79e
66386734-f3d4-45f3-a57a-86962faec426	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
be5cbe16-3a0f-4905-a442-18eea14d23e6	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
d788f6cc-2452-4040-aea7-c5432733bd56	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
2c547ede-b3d0-4940-8448-dcc194dc7662	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
408b48e4-8342-46b3-83e3-131ea6928587	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
6bfff212-e20d-458c-8c3c-8ee808226883	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
7e40436a-dd19-46d4-b9a5-5709b7bd243e	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
f31bb720-310f-476e-a57a-72844b8f1ca3	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
4f9a0c71-128f-4b9d-853e-2b6561d65d00	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
89110bb3-4b20-4c4f-bf79-fba611c411f8	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
a9babdcf-7232-4243-9bec-8ef76e94f2f9	c4b3f601-0a95-485c-ab49-fa23c5f5196a	1560e21d-ac2b-47da-a03b-16745fba2081
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.users (id, username, password_hash, display_name, email, is_active, must_change_password, failed_login_attempts, locked_until, totp_secret_enc, totp_enabled, approval_pin_hash, created_at, updated_at) FROM stdin;
d788f6cc-2452-4040-aea7-c5432733bd56	e2e1783250720879	$argon2id$v=19$m=65536,t=3,p=4$0ZPiB0cHFno0tBBAVTww4Q$joE8owLL5LwmeeGhBvJYOWi0fK6qng/DA2ZBD2IHUR4	พนักงานทดสอบ E2E	\N	t	f	0	\N	qPoRLkEAxLSnqtWr.UONW9Q+9qY/0iMDJJxht9g==.FA/Px5d/1KF4ZX+wrd1sA679SXGujwsARJRx39ZRtu8=	t	\N	2026-07-05 11:25:25.597	2026-07-05 11:25:28.932
7e40436a-dd19-46d4-b9a5-5709b7bd243e	e2e1783308804033	$argon2id$v=19$m=65536,t=3,p=4$DxmmTr91zuuVK8LuTpc+og$gmr+yXNXh8N7VNXwBzyqtfrzGzmB9qXMjXV51ymTZMs	พนักงานทดสอบ E2E	\N	t	f	0	\N	WyeK5WLInzu025C7.fhxFRT5Vz5OwIa/2TtTmfg==.JBw9ipFLAuDgwi4ociqIKE4HktBAz4nyayeajkYN8zM=	t	\N	2026-07-06 03:33:28.336	2026-07-06 03:33:33.359
beb4ff84-6047-4c0a-ad07-399a42e7d2fc	owner	$argon2id$v=19$m=65536,t=3,p=4$RlhYXZOPLRQPndgzQNvudA$KT0eH+C84z8f7+N5GSiDSBGvim5WAr/i4X4J+/izpP4	เจ้าของร้าน	\N	t	f	0	\N	\N	f	\N	2026-07-05 11:15:29.72	2026-07-06 06:26:53.076
408b48e4-8342-46b3-83e3-131ea6928587	e2e1783305112381	$argon2id$v=19$m=65536,t=3,p=4$TtxIjaQGcxejzmzs+L501A$W4aPB/QNa5YPe+iUIsh6HCRzSKNP95zW5qHJZnhh1Eg	พนักงานทดสอบ E2E	\N	t	f	0	\N	rpL0WcnSUnSiLRwG.ptBWnVJlwi+mWyKKE01lYA==.alKXU+MUFMbak9rxyWFeX28KDPfibSVuHrZeHAFJ/Ys=	t	\N	2026-07-06 02:31:59.147	2026-07-06 02:32:04.723
f31bb720-310f-476e-a57a-72844b8f1ca3	e2e1783315496827	$argon2id$v=19$m=65536,t=3,p=4$5jqnf77d+Rm/6hDw8slxEQ$cDeJEmPgmTpFJo3NQUht/0B+Sn05Xdy2Ys4P7vrpzio	พนักงานทดสอบ E2E	\N	t	f	0	\N	K0AlgOz5nwLw+J0+.ZpOBPAvtYMrBWeNqrNbvdA==.1HcbBE5YRv4J5e+cNyNQkZYJYq5/RTopG7cbROvzgGk=	t	\N	2026-07-06 05:25:02.573	2026-07-06 05:25:05.804
66386734-f3d4-45f3-a57a-86962faec426	e2e1783250592355	$argon2id$v=19$m=65536,t=3,p=4$7QcV1XerkFzZwEpgMfgudw$52QLoC0bQk6VRpoqpvl36gl17i8ESJE8l/D7GsgbFfw	พนักงานทดสอบ E2E	\N	t	f	0	\N	9IlL+PNKXvTYevko.5G7YyJVxxorDD5mP9BsEyg==.4CqW0CqxryIs19yV/K1XmwjvEZycupENrofz5yMgjoo=	t	\N	2026-07-05 11:23:17.28	2026-07-05 11:23:19.586
2c547ede-b3d0-4940-8448-dcc194dc7662	e2e1783252585751	$argon2id$v=19$m=65536,t=3,p=4$zVkuwDNmH/IK1wErpCpmVg$h2skhfgBuHz1nG3j3cW6f2Mf9xWW0ljDBGYmsIgQrxI	พนักงานทดสอบ E2E	\N	t	f	0	\N	+5oHaMEaSEBrhF+a.z4sj7J91TrG3Zm2fqpI0sQ==.KCyzY5u7o8mVG19ibvYtjKHafSQ6wdHnFV2jruO2540=	t	\N	2026-07-05 11:56:31.216	2026-07-05 11:56:35.641
a9babdcf-7232-4243-9bec-8ef76e94f2f9	e2e1783319208940	$argon2id$v=19$m=65536,t=3,p=4$ntAgHUcG2CphsvvFg6/fAw$IEjfBAJQbalRM19SaWDUH5PkCSNkrO4NVMWQl2KyuFg	พนักงานทดสอบ E2E	\N	t	f	0	\N	K/GVtyilU9dB+qdv.sXlMxjtfW/3dnD2IoYAd4A==.LoD0FKyZy4Os/JCa28mInQiF+l6QSNNr/VJVLe5f/cc=	t	\N	2026-07-06 06:26:57.751	2026-07-06 06:27:03.69
be5cbe16-3a0f-4905-a442-18eea14d23e6	e2e1783250650336	$argon2id$v=19$m=65536,t=3,p=4$y9CnSMgPgilM2pXqkvomdA$E8MFI1X4hA3MFreFbCjkF6l0+BGyVTUIuw2ryLTYbFo	พนักงานทดสอบ E2E	\N	t	f	0	\N	jk8l8fDVHfQxtDTm.Ct4rom7vPo7i+n3nEva4hw==.pCurNcutwIjCONateBuFwnZH7RaGQm49dN1PS+awSnw=	t	\N	2026-07-05 11:24:15.057	2026-07-05 11:24:17.297
6bfff212-e20d-458c-8c3c-8ee808226883	e2e1783305448940	$argon2id$v=19$m=65536,t=3,p=4$pO6VEV49rLKagaKkJO1VXQ$NX1aAscfllsKxb4f2ytbP+XZTIcZSSiGQ4YXTjyo9g4	พนักงานทดสอบ E2E	\N	t	f	0	\N	HZZTTB/Ss5/cU3vv.Jrk6BVh8UJSVyLhfY1UtMg==.xM6NI12Smy+rzsIKwKKDtUzA9hgS/skMPUXN3uFFN54=	t	\N	2026-07-06 02:37:34.86	2026-07-06 02:37:39.589
89110bb3-4b20-4c4f-bf79-fba611c411f8	e2e1783319051525	$argon2id$v=19$m=65536,t=3,p=4$y4/yhct12oxB/FrroXfwJw$vmgzWSyZoKuH/Z+fae8tpcQb37iWW0csK2tT1T0TYlo	พนักงานทดสอบ E2E	\N	t	f	0	\N	S0P0ANYFfcSaT3gf.s+lCrZ5U6LwAsXnmy4NuFg==.EiN8lUa/K9SF1OQvNE4X9t4LIFaPMHIIKd7v9DLOjt0=	t	\N	2026-07-06 06:24:20.356	2026-07-06 06:24:26.509
4f9a0c71-128f-4b9d-853e-2b6561d65d00	e2e1783318211016	$argon2id$v=19$m=65536,t=3,p=4$eHzVY219Xwsb9X2w0UOzlw$dJmfac59sT7hIVNeKi3yH6wN2qO74ulEqgNO7oJXaP4	พนักงานทดสอบ E2E	\N	t	f	0	\N	ZCvQEDj1vkCJzLqL.hCLwEKKN+7PJrtWIew6uBw==.PY3Q0gg9/qdC9e+AZ2thk9J49tR6UrxbZ/dtXk2eAuc=	t	\N	2026-07-06 06:10:19.728	2026-07-06 06:10:25.996
\.


--
-- Data for Name: work_order_events; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.work_order_events (id, work_order_id, event_type, note, actor_id, request_id, created_at) FROM stdin;
1	e18df7aa-9cfd-4260-a20a-4b3b8f6a913e	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	1a87025c-0aac-4a9c-b04c-df29590a10da	2026-07-06 03:24:09.614
2	e18df7aa-9cfd-4260-a20a-4b3b8f6a913e	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	1c479ed4-97e8-4497-b02d-b446a3d88e31	2026-07-06 03:24:13.662
3	d5cdd40c-8f84-46b1-8a21-a442a1e27391	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	31a67be5-5cfc-422d-b992-44201973bca5	2026-07-06 03:25:07.486
4	20daae65-95e8-483c-b7a6-f16c6f202dcc	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	6b5ff354-4bb2-4947-8c5d-8827cce7ab93	2026-07-06 03:26:14.383
5	20daae65-95e8-483c-b7a6-f16c6f202dcc	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	f49c601b-9e3b-4ca0-947f-e73142fa6eee	2026-07-06 03:26:17.668
6	20daae65-95e8-483c-b7a6-f16c6f202dcc	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	e36589f0-04ce-492b-9fe7-ad5157b6b52a	2026-07-06 03:26:18.451
7	20daae65-95e8-483c-b7a6-f16c6f202dcc	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	10d2f4f1-7e26-4de3-ac54-b338785c0320	2026-07-06 03:26:18.734
8	31ac2dd7-4409-4c1b-93d8-887fae6fae92	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	9697a50d-09f3-4bc8-97f4-19270cfd2571	2026-07-06 03:33:24.128
9	31ac2dd7-4409-4c1b-93d8-887fae6fae92	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	0560338c-950c-4c51-8151-9114883812ed	2026-07-06 03:33:27.971
10	31ac2dd7-4409-4c1b-93d8-887fae6fae92	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	8b44b11e-8c9d-429c-b1a8-5f5e4f287204	2026-07-06 03:33:28.908
11	31ac2dd7-4409-4c1b-93d8-887fae6fae92	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	4d06dd6d-1f30-465c-8e90-a71f3bf893f2	2026-07-06 03:33:29.823
12	da4dd669-0b44-43e6-b979-f69b68435fbb	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	01605941-a387-4a75-b08e-cc61414b3bee	2026-07-06 05:00:53.843
13	da4dd669-0b44-43e6-b979-f69b68435fbb	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	6bb30f1b-1d3b-4a5c-84a5-45f5cf525650	2026-07-06 05:01:01.095
14	da4dd669-0b44-43e6-b979-f69b68435fbb	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	4945f458-20d1-4098-ab57-4cb79196a4fb	2026-07-06 05:01:02.851
15	da4dd669-0b44-43e6-b979-f69b68435fbb	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	6e922811-5ffa-46c2-92c9-3de39831eddd	2026-07-06 05:01:03.8
16	784c7eb6-c877-4f85-a1cd-1556bde98e3a	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	30fb778e-bfc4-447b-9e1c-e65b7e7e4879	2026-07-06 05:06:30.736
17	784c7eb6-c877-4f85-a1cd-1556bde98e3a	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	726894d2-e335-4e0c-abb7-4894c2e52db2	2026-07-06 05:06:37.163
18	784c7eb6-c877-4f85-a1cd-1556bde98e3a	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	52854218-d052-4b8b-82b8-56505b0a667b	2026-07-06 05:06:38.453
19	784c7eb6-c877-4f85-a1cd-1556bde98e3a	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	cbea97c4-1c8f-4f1a-8c66-71c864947d9a	2026-07-06 05:06:39.995
20	dd0bd7a1-e049-4028-b68f-884a6fc11aae	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	b7a4626a-e819-4745-8944-7d1736f72bcb	2026-07-06 05:25:11.12
21	dd0bd7a1-e049-4028-b68f-884a6fc11aae	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	e490dbdc-0904-458a-a155-d576c0decef9	2026-07-06 05:25:15.681
22	dd0bd7a1-e049-4028-b68f-884a6fc11aae	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	fea2c089-538f-4e06-978e-d7ad0dd6be0c	2026-07-06 05:25:16.563
23	dd0bd7a1-e049-4028-b68f-884a6fc11aae	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	0afc1fe6-520b-4cc1-8daa-842a60b4fa65	2026-07-06 05:25:17.041
24	881392c3-e7c4-4fb0-9998-5a57151e26c7	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	b9377c2e-17a7-45ca-9789-08b5a94da5fc	2026-07-06 06:10:34.439
25	881392c3-e7c4-4fb0-9998-5a57151e26c7	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	c8d0fa55-e0ba-4dd4-b40c-f9ee45a5223c	2026-07-06 06:10:42.693
26	881392c3-e7c4-4fb0-9998-5a57151e26c7	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	94c88e21-6289-4f20-9858-50fa9843e3ca	2026-07-06 06:10:43.799
27	881392c3-e7c4-4fb0-9998-5a57151e26c7	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	20075de3-784a-4263-9a55-4fc4fab50169	2026-07-06 06:10:44.488
28	827bac65-b57c-4a29-8b9e-0da54ce14772	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	8a040831-f0d2-490c-b05e-d16a69d33caf	2026-07-06 06:24:34.959
29	827bac65-b57c-4a29-8b9e-0da54ce14772	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	90b6a2cc-cbce-43b3-a502-45b9a908f36b	2026-07-06 06:24:44.313
30	827bac65-b57c-4a29-8b9e-0da54ce14772	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	1cc2c871-48c4-4397-a4bd-14a1792abab9	2026-07-06 06:24:45.461
31	827bac65-b57c-4a29-8b9e-0da54ce14772	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	a050b4ca-3e78-4208-92b1-5e7c6ef682fd	2026-07-06 06:24:46.234
32	33ed5886-b78a-4dd2-bdbe-580d4af91425	RECEIVE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	abcc010c-5a6a-4d70-b34d-f8e131a5e5e8	2026-07-06 06:27:12.759
33	33ed5886-b78a-4dd2-bdbe-580d4af91425	STATUS_CHANGE	เริ่มดำเนินงาน	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	ca00c79e-d3e0-451c-ae10-f7c95386855a	2026-07-06 06:27:20.769
34	33ed5886-b78a-4dd2-bdbe-580d4af91425	COMPLETE	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	9f8c8f95-7d1d-4799-8633-6d5bc9936970	2026-07-06 06:27:21.608
35	33ed5886-b78a-4dd2-bdbe-580d4af91425	DELIVER	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	fe3195d9-1e48-4feb-a462-7aa870ce99af	2026-07-06 06:27:22.612
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: gold
--

COPY public.work_orders (id, doc_no, branch_id, customer_id, type, status, description, deposit_satang, gold_issued_mg, tolerance_mg, service_fee_satang, received_at, promised_at, completed_at, delivered_at, cancelled_at, created_by, created_at, updated_at) FROM stdin;
e18df7aa-9cfd-4260-a20a-4b3b8f6a913e	WOR-HQ-2569-000001	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	IN_PROGRESS	ซ่อมสร้อยคอทดสอบ E2E	0	0	0	0	2026-07-06 03:24:09.609	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:24:09.609	2026-07-06 03:24:13.667
d5cdd40c-8f84-46b1-8a21-a442a1e27391	WOR-HQ-2569-000002	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	RECEIVED	ซ่อมสร้อยคอทดสอบ E2E	0	0	0	0	2026-07-06 03:25:07.483	\N	\N	\N	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:25:07.483	2026-07-06 03:25:07.483
20daae65-95e8-483c-b7a6-f16c6f202dcc	WOR-HQ-2569-000003	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783308372565	0	0	0	0	2026-07-06 03:26:14.36	\N	2026-07-06 03:26:18.45	2026-07-06 03:26:18.733	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:26:14.36	2026-07-06 03:26:18.737
31ac2dd7-4409-4c1b-93d8-887fae6fae92	WOR-HQ-2569-000004	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783308800751	0	0	0	0	2026-07-06 03:33:24.119	\N	2026-07-06 03:33:28.906	2026-07-06 03:33:29.822	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 03:33:24.119	2026-07-06 03:33:29.827
da4dd669-0b44-43e6-b979-f69b68435fbb	WOR-HQ-2569-000005	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783314046607	0	0	0	0	2026-07-06 05:00:53.751	\N	2026-07-06 05:01:02.836	2026-07-06 05:01:03.791	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:00:53.751	2026-07-06 05:01:03.804
784c7eb6-c877-4f85-a1cd-1556bde98e3a	WOR-HQ-2569-000006	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783314383655	0	0	0	0	2026-07-06 05:06:30.712	\N	2026-07-06 05:06:38.437	2026-07-06 05:06:39.981	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:06:30.712	2026-07-06 05:06:40.001
dd0bd7a1-e049-4028-b68f-884a6fc11aae	WOR-HQ-2569-000007	c4b3f601-0a95-485c-ab49-fa23c5f5196a	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783315507255	0	0	0	0	2026-07-06 05:25:11.114	\N	2026-07-06 05:25:16.556	2026-07-06 05:25:17.033	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 05:25:11.114	2026-07-06 05:25:17.044
881392c3-e7c4-4fb0-9998-5a57151e26c7	WOR-CTE021602-2569-000001	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783318227951	0	0	0	0	2026-07-06 06:10:34.421	\N	2026-07-06 06:10:43.759	2026-07-06 06:10:44.478	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:10:34.421	2026-07-06 06:10:44.491
827bac65-b57c-4a29-8b9e-0da54ce14772	WOR-CTE021602-2569-000002	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783319068473	0	0	0	0	2026-07-06 06:24:34.938	\N	2026-07-06 06:24:45.449	2026-07-06 06:24:46.222	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:24:34.938	2026-07-06 06:24:46.237
33ed5886-b78a-4dd2-bdbe-580d4af91425	WOR-CTE021602-2569-000003	fc5e5620-0da6-47bc-8b0c-95891e8c3fdd	\N	REPAIR	DELIVERED	ซ่อมสร้อยคอทดสอบ E2E 1783319225569	0	0	0	0	2026-07-06 06:27:12.721	\N	2026-07-06 06:27:21.597	2026-07-06 06:27:22.6	\N	beb4ff84-6047-4c0a-ad07-399a42e7d2fc	2026-07-06 06:27:12.721	2026-07-06 06:27:22.615
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gold
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 345, true);


--
-- Name: journal_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gold
--

SELECT pg_catalog.setval('public.journal_lines_id_seq', 64, true);


--
-- Name: pawn_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gold
--

SELECT pg_catalog.setval('public.pawn_events_id_seq', 24, true);


--
-- Name: savings_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gold
--

SELECT pg_catalog.setval('public.savings_transactions_id_seq', 33, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gold
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 1, false);


--
-- Name: work_order_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gold
--

SELECT pg_catalog.setval('public.work_order_events_id_seq', 35, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounting_periods accounting_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.accounting_periods
    ADD CONSTRAINT accounting_periods_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: amlo_alerts amlo_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.amlo_alerts
    ADD CONSTRAINT amlo_alerts_pkey PRIMARY KEY (id);


--
-- Name: amlo_watchlist_entries amlo_watchlist_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.amlo_watchlist_entries
    ADD CONSTRAINT amlo_watchlist_entries_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branch_transfer_items branch_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branch_transfer_items
    ADD CONSTRAINT branch_transfer_items_pkey PRIMARY KEY (transfer_id, item_id);


--
-- Name: branch_transfers branch_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branch_transfers
    ADD CONSTRAINT branch_transfers_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: cash_drawers cash_drawers_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_drawers
    ADD CONSTRAINT cash_drawers_pkey PRIMARY KEY (id);


--
-- Name: cash_transfers cash_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_transfers
    ADD CONSTRAINT cash_transfers_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: document_sequences document_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.document_sequences
    ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (key);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: gold_price_feeds gold_price_feeds_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.gold_price_feeds
    ADD CONSTRAINT gold_price_feeds_pkey PRIMARY KEY (id);


--
-- Name: inventory_items inventory_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);


--
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- Name: journal_lines journal_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_pkey PRIMARY KEY (id);


--
-- Name: melt_lot_items melt_lot_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.melt_lot_items
    ADD CONSTRAINT melt_lot_items_pkey PRIMARY KEY (lot_id, item_id);


--
-- Name: melt_lots melt_lots_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.melt_lots
    ADD CONSTRAINT melt_lots_pkey PRIMARY KEY (id);


--
-- Name: pawn_contracts pawn_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_contracts
    ADD CONSTRAINT pawn_contracts_pkey PRIMARY KEY (id);


--
-- Name: pawn_events pawn_events_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_events
    ADD CONSTRAINT pawn_events_pkey PRIMARY KEY (id);


--
-- Name: pawn_interest_payments pawn_interest_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_interest_payments
    ADD CONSTRAINT pawn_interest_payments_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_labels product_labels_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.product_labels
    ADD CONSTRAINT product_labels_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: recovery_codes recovery_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.recovery_codes
    ADD CONSTRAINT recovery_codes_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sales_order_items sales_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);


--
-- Name: sales_orders sales_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);


--
-- Name: savings_accounts savings_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.savings_accounts
    ADD CONSTRAINT savings_accounts_pkey PRIMARY KEY (id);


--
-- Name: savings_transactions savings_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.savings_transactions
    ADD CONSTRAINT savings_transactions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: shop_price_announcements shop_price_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.shop_price_announcements
    ADD CONSTRAINT shop_price_announcements_pkey PRIMARY KEY (id);


--
-- Name: stock_count_items stock_count_items_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_count_items
    ADD CONSTRAINT stock_count_items_pkey PRIMARY KEY (count_id, item_id);


--
-- Name: stock_counts stock_counts_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_counts
    ADD CONSTRAINT stock_counts_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: storage_locations storage_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_locations_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: tax_invoices tax_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.tax_invoices
    ADD CONSTRAINT tax_invoices_pkey PRIMARY KEY (id);


--
-- Name: trade_ins trade_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.trade_ins
    ADD CONSTRAINT trade_ins_pkey PRIMARY KEY (id);


--
-- Name: user_branch_roles user_branch_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.user_branch_roles
    ADD CONSTRAINT user_branch_roles_pkey PRIMARY KEY (user_id, branch_id, role_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: work_order_events work_order_events_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.work_order_events
    ADD CONSTRAINT work_order_events_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: accounting_periods_year_month_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX accounting_periods_year_month_key ON public.accounting_periods USING btree (year_month);


--
-- Name: accounts_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX accounts_code_key ON public.accounts USING btree (code);


--
-- Name: amlo_alerts_ref_type_ref_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX amlo_alerts_ref_type_ref_id_idx ON public.amlo_alerts USING btree (ref_type, ref_id);


--
-- Name: amlo_alerts_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX amlo_alerts_status_idx ON public.amlo_alerts USING btree (status);


--
-- Name: amlo_watchlist_entries_citizen_id_hash_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX amlo_watchlist_entries_citizen_id_hash_key ON public.amlo_watchlist_entries USING btree (citizen_id_hash);


--
-- Name: audit_logs_action_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX audit_logs_action_created_at_idx ON public.audit_logs USING btree (action, created_at);


--
-- Name: audit_logs_actor_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX audit_logs_actor_id_created_at_idx ON public.audit_logs USING btree (actor_id, created_at);


--
-- Name: audit_logs_branch_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX audit_logs_branch_id_created_at_idx ON public.audit_logs USING btree (branch_id, created_at);


--
-- Name: audit_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX audit_logs_entity_type_entity_id_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: branch_transfers_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX branch_transfers_doc_no_key ON public.branch_transfers USING btree (doc_no);


--
-- Name: branch_transfers_from_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX branch_transfers_from_branch_id_status_idx ON public.branch_transfers USING btree (from_branch_id, status);


--
-- Name: branch_transfers_to_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX branch_transfers_to_branch_id_status_idx ON public.branch_transfers USING btree (to_branch_id, status);


--
-- Name: branches_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX branches_code_key ON public.branches USING btree (code);


--
-- Name: cash_drawers_branch_id_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX cash_drawers_branch_id_code_key ON public.cash_drawers USING btree (branch_id, code);


--
-- Name: cash_transfers_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX cash_transfers_doc_no_key ON public.cash_transfers USING btree (doc_no);


--
-- Name: cash_transfers_from_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX cash_transfers_from_branch_id_status_idx ON public.cash_transfers USING btree (from_branch_id, status);


--
-- Name: cash_transfers_to_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX cash_transfers_to_branch_id_status_idx ON public.cash_transfers USING btree (to_branch_id, status);


--
-- Name: commissions_sales_order_id_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX commissions_sales_order_id_key ON public.commissions USING btree (sales_order_id);


--
-- Name: commissions_staff_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX commissions_staff_id_created_at_idx ON public.commissions USING btree (staff_id, created_at);


--
-- Name: customers_citizen_id_hash_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX customers_citizen_id_hash_key ON public.customers USING btree (citizen_id_hash);


--
-- Name: customers_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX customers_code_key ON public.customers USING btree (code);


--
-- Name: expenses_branch_id_expense_date_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX expenses_branch_id_expense_date_idx ON public.expenses USING btree (branch_id, expense_date);


--
-- Name: expenses_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX expenses_doc_no_key ON public.expenses USING btree (doc_no);


--
-- Name: expenses_journal_entry_id_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX expenses_journal_entry_id_key ON public.expenses USING btree (journal_entry_id);


--
-- Name: gold_price_feeds_announced_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX gold_price_feeds_announced_at_idx ON public.gold_price_feeds USING btree (announced_at);


--
-- Name: gold_price_feeds_source_announced_at_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX gold_price_feeds_source_announced_at_key ON public.gold_price_feeds USING btree (source, announced_at);


--
-- Name: inventory_items_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX inventory_items_branch_id_status_idx ON public.inventory_items USING btree (branch_id, status);


--
-- Name: inventory_items_product_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX inventory_items_product_id_idx ON public.inventory_items USING btree (product_id);


--
-- Name: inventory_items_serial_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX inventory_items_serial_no_key ON public.inventory_items USING btree (serial_no);


--
-- Name: journal_entries_branch_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX journal_entries_branch_id_idx ON public.journal_entries USING btree (branch_id);


--
-- Name: journal_entries_entry_date_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX journal_entries_entry_date_idx ON public.journal_entries USING btree (entry_date);


--
-- Name: journal_entries_entry_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX journal_entries_entry_no_key ON public.journal_entries USING btree (entry_no);


--
-- Name: journal_entries_period_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX journal_entries_period_id_idx ON public.journal_entries USING btree (period_id);


--
-- Name: journal_entries_ref_type_ref_id_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX journal_entries_ref_type_ref_id_key ON public.journal_entries USING btree (ref_type, ref_id);


--
-- Name: journal_lines_account_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX journal_lines_account_id_idx ON public.journal_lines USING btree (account_id);


--
-- Name: journal_lines_entry_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX journal_lines_entry_id_idx ON public.journal_lines USING btree (entry_id);


--
-- Name: melt_lots_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX melt_lots_branch_id_status_idx ON public.melt_lots USING btree (branch_id, status);


--
-- Name: melt_lots_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX melt_lots_doc_no_key ON public.melt_lots USING btree (doc_no);


--
-- Name: pawn_contracts_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX pawn_contracts_branch_id_status_idx ON public.pawn_contracts USING btree (branch_id, status);


--
-- Name: pawn_contracts_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX pawn_contracts_doc_no_key ON public.pawn_contracts USING btree (doc_no);


--
-- Name: pawn_contracts_status_due_date_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX pawn_contracts_status_due_date_idx ON public.pawn_contracts USING btree (status, due_date);


--
-- Name: pawn_events_contract_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX pawn_events_contract_id_created_at_idx ON public.pawn_events USING btree (contract_id, created_at);


--
-- Name: pawn_interest_payments_contract_id_paid_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX pawn_interest_payments_contract_id_paid_at_idx ON public.pawn_interest_payments USING btree (contract_id, paid_at);


--
-- Name: permissions_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX permissions_code_key ON public.permissions USING btree (code);


--
-- Name: product_categories_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX product_categories_code_key ON public.product_categories USING btree (code);


--
-- Name: product_labels_item_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX product_labels_item_id_idx ON public.product_labels USING btree (item_id);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: purchase_orders_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX purchase_orders_doc_no_key ON public.purchase_orders USING btree (doc_no);


--
-- Name: purchase_orders_idempotency_key_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX purchase_orders_idempotency_key_key ON public.purchase_orders USING btree (idempotency_key);


--
-- Name: recovery_codes_user_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX recovery_codes_user_id_idx ON public.recovery_codes USING btree (user_id);


--
-- Name: roles_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX roles_code_key ON public.roles USING btree (code);


--
-- Name: sales_orders_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX sales_orders_doc_no_key ON public.sales_orders USING btree (doc_no);


--
-- Name: sales_orders_idempotency_key_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX sales_orders_idempotency_key_key ON public.sales_orders USING btree (idempotency_key);


--
-- Name: savings_accounts_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX savings_accounts_branch_id_status_idx ON public.savings_accounts USING btree (branch_id, status);


--
-- Name: savings_accounts_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX savings_accounts_doc_no_key ON public.savings_accounts USING btree (doc_no);


--
-- Name: savings_transactions_account_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX savings_transactions_account_id_created_at_idx ON public.savings_transactions USING btree (account_id, created_at);


--
-- Name: sessions_token_hash_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX sessions_token_hash_key ON public.sessions USING btree (token_hash);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: shop_price_announcements_announced_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX shop_price_announcements_announced_at_idx ON public.shop_price_announcements USING btree (announced_at);


--
-- Name: stock_counts_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX stock_counts_branch_id_status_idx ON public.stock_counts USING btree (branch_id, status);


--
-- Name: stock_counts_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX stock_counts_doc_no_key ON public.stock_counts USING btree (doc_no);


--
-- Name: stock_movements_branch_id_product_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX stock_movements_branch_id_product_id_created_at_idx ON public.stock_movements USING btree (branch_id, product_id, created_at);


--
-- Name: stock_movements_item_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX stock_movements_item_id_idx ON public.stock_movements USING btree (item_id);


--
-- Name: stock_movements_ref_type_ref_id_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX stock_movements_ref_type_ref_id_idx ON public.stock_movements USING btree (ref_type, ref_id);


--
-- Name: storage_locations_branch_id_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX storage_locations_branch_id_code_key ON public.storage_locations USING btree (branch_id, code);


--
-- Name: suppliers_code_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX suppliers_code_key ON public.suppliers USING btree (code);


--
-- Name: tax_invoices_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX tax_invoices_doc_no_key ON public.tax_invoices USING btree (doc_no);


--
-- Name: trade_ins_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX trade_ins_doc_no_key ON public.trade_ins USING btree (doc_no);


--
-- Name: trade_ins_purchase_order_id_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX trade_ins_purchase_order_id_key ON public.trade_ins USING btree (purchase_order_id);


--
-- Name: trade_ins_sales_order_id_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX trade_ins_sales_order_id_key ON public.trade_ins USING btree (sales_order_id);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: work_order_events_work_order_id_created_at_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX work_order_events_work_order_id_created_at_idx ON public.work_order_events USING btree (work_order_id, created_at);


--
-- Name: work_orders_branch_id_status_idx; Type: INDEX; Schema: public; Owner: gold
--

CREATE INDEX work_orders_branch_id_status_idx ON public.work_orders USING btree (branch_id, status);


--
-- Name: work_orders_doc_no_key; Type: INDEX; Schema: public; Owner: gold
--

CREATE UNIQUE INDEX work_orders_doc_no_key ON public.work_orders USING btree (doc_no);


--
-- Name: audit_logs audit_logs_append_only; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER audit_logs_append_only BEFORE DELETE OR UPDATE ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION public.forbid_audit_log_mutation();


--
-- Name: audit_logs audit_logs_no_truncate; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER audit_logs_no_truncate BEFORE TRUNCATE ON public.audit_logs FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_audit_log_truncate();


--
-- Name: journal_lines journal_lines_append_only; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER journal_lines_append_only BEFORE DELETE OR UPDATE ON public.journal_lines FOR EACH ROW EXECUTE FUNCTION public.forbid_journal_line_mutation();


--
-- Name: journal_lines journal_lines_balanced; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE CONSTRAINT TRIGGER journal_lines_balanced AFTER INSERT ON public.journal_lines DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.check_journal_entry_balanced();


--
-- Name: journal_lines journal_lines_no_truncate; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER journal_lines_no_truncate BEFORE TRUNCATE ON public.journal_lines FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_journal_line_truncate();


--
-- Name: pawn_events pawn_events_append_only; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER pawn_events_append_only BEFORE DELETE OR UPDATE ON public.pawn_events FOR EACH ROW EXECUTE FUNCTION public.forbid_pawn_event_mutation();


--
-- Name: pawn_events pawn_events_no_truncate; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER pawn_events_no_truncate BEFORE TRUNCATE ON public.pawn_events FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_pawn_event_truncate();


--
-- Name: savings_transactions savings_transactions_append_only; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER savings_transactions_append_only BEFORE DELETE OR UPDATE ON public.savings_transactions FOR EACH ROW EXECUTE FUNCTION public.forbid_savings_tx_mutation();


--
-- Name: savings_transactions savings_transactions_no_truncate; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER savings_transactions_no_truncate BEFORE TRUNCATE ON public.savings_transactions FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_savings_tx_truncate();


--
-- Name: stock_movements stock_movements_append_only; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER stock_movements_append_only BEFORE DELETE OR UPDATE ON public.stock_movements FOR EACH ROW EXECUTE FUNCTION public.forbid_stock_movement_mutation();


--
-- Name: stock_movements stock_movements_no_truncate; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER stock_movements_no_truncate BEFORE TRUNCATE ON public.stock_movements FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_stock_movement_truncate();


--
-- Name: work_order_events work_order_events_append_only; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER work_order_events_append_only BEFORE DELETE OR UPDATE ON public.work_order_events FOR EACH ROW EXECUTE FUNCTION public.forbid_work_order_event_mutation();


--
-- Name: work_order_events work_order_events_no_truncate; Type: TRIGGER; Schema: public; Owner: gold
--

CREATE TRIGGER work_order_events_no_truncate BEFORE TRUNCATE ON public.work_order_events FOR EACH STATEMENT EXECUTE FUNCTION public.forbid_work_order_event_truncate();


--
-- Name: amlo_alerts amlo_alerts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.amlo_alerts
    ADD CONSTRAINT amlo_alerts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: branch_transfer_items branch_transfer_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branch_transfer_items
    ADD CONSTRAINT branch_transfer_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: branch_transfer_items branch_transfer_items_transfer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branch_transfer_items
    ADD CONSTRAINT branch_transfer_items_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES public.branch_transfers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: branch_transfers branch_transfers_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branch_transfers
    ADD CONSTRAINT branch_transfers_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: branch_transfers branch_transfers_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.branch_transfers
    ADD CONSTRAINT branch_transfers_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cash_drawers cash_drawers_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_drawers
    ADD CONSTRAINT cash_drawers_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cash_transfers cash_transfers_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_transfers
    ADD CONSTRAINT cash_transfers_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cash_transfers cash_transfers_from_drawer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_transfers
    ADD CONSTRAINT cash_transfers_from_drawer_id_fkey FOREIGN KEY (from_drawer_id) REFERENCES public.cash_drawers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cash_transfers cash_transfers_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_transfers
    ADD CONSTRAINT cash_transfers_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cash_transfers cash_transfers_to_drawer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.cash_transfers
    ADD CONSTRAINT cash_transfers_to_drawer_id_fkey FOREIGN KEY (to_drawer_id) REFERENCES public.cash_drawers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: commissions commissions_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.accounting_periods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: commissions commissions_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: commissions commissions_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: expenses expenses_journal_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_items inventory_items_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.storage_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inventory_items inventory_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: inventory_items inventory_items_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.inventory_items
    ADD CONSTRAINT inventory_items_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: journal_entries journal_entries_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_entries journal_entries_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_entries
    ADD CONSTRAINT journal_entries_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.accounting_periods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_lines journal_lines_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: journal_lines journal_lines_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.journal_lines
    ADD CONSTRAINT journal_lines_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.journal_entries(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: melt_lot_items melt_lot_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.melt_lot_items
    ADD CONSTRAINT melt_lot_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: melt_lot_items melt_lot_items_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.melt_lot_items
    ADD CONSTRAINT melt_lot_items_lot_id_fkey FOREIGN KEY (lot_id) REFERENCES public.melt_lots(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: melt_lots melt_lots_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.melt_lots
    ADD CONSTRAINT melt_lots_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pawn_contracts pawn_contracts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_contracts
    ADD CONSTRAINT pawn_contracts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pawn_contracts pawn_contracts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_contracts
    ADD CONSTRAINT pawn_contracts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pawn_contracts pawn_contracts_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_contracts
    ADD CONSTRAINT pawn_contracts_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.storage_locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: pawn_events pawn_events_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_events
    ADD CONSTRAINT pawn_events_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.pawn_contracts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pawn_interest_payments pawn_interest_payments_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.pawn_interest_payments
    ADD CONSTRAINT pawn_interest_payments_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.pawn_contracts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_trade_in_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_trade_in_id_fkey FOREIGN KEY (trade_in_id) REFERENCES public.trade_ins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_labels product_labels_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.product_labels
    ADD CONSTRAINT product_labels_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recovery_codes recovery_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.recovery_codes
    ADD CONSTRAINT recovery_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_order_items sales_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_order_items sales_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sales_order_items sales_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT sales_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sales_orders sales_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales_orders sales_orders_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT sales_orders_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: savings_accounts savings_accounts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.savings_accounts
    ADD CONSTRAINT savings_accounts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: savings_accounts savings_accounts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.savings_accounts
    ADD CONSTRAINT savings_accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: savings_transactions savings_transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.savings_transactions
    ADD CONSTRAINT savings_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.savings_accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shifts shifts_drawer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_drawer_id_fkey FOREIGN KEY (drawer_id) REFERENCES public.cash_drawers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shop_price_announcements shop_price_announcements_based_on_feed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.shop_price_announcements
    ADD CONSTRAINT shop_price_announcements_based_on_feed_id_fkey FOREIGN KEY (based_on_feed_id) REFERENCES public.gold_price_feeds(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_count_items stock_count_items_count_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_count_items
    ADD CONSTRAINT stock_count_items_count_id_fkey FOREIGN KEY (count_id) REFERENCES public.stock_counts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock_count_items stock_count_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_count_items
    ADD CONSTRAINT stock_count_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_counts stock_counts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_counts
    ADD CONSTRAINT stock_counts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: storage_locations storage_locations_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_locations_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tax_invoices tax_invoices_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.tax_invoices
    ADD CONSTRAINT tax_invoices_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: trade_ins trade_ins_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.trade_ins
    ADD CONSTRAINT trade_ins_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: trade_ins trade_ins_sales_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.trade_ins
    ADD CONSTRAINT trade_ins_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES public.sales_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_branch_roles user_branch_roles_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.user_branch_roles
    ADD CONSTRAINT user_branch_roles_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_branch_roles user_branch_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.user_branch_roles
    ADD CONSTRAINT user_branch_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_branch_roles user_branch_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.user_branch_roles
    ADD CONSTRAINT user_branch_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: work_order_events work_order_events_work_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.work_order_events
    ADD CONSTRAINT work_order_events_work_order_id_fkey FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gold
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 0bUQYevuKUjyxPfL7z3XkjLBuBHYPpyDn4gzlmgguvi04dIxh47Amj6rLVgwaAn

