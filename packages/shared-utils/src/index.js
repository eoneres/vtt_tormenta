"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.generateTraceId = generateTraceId;
exports.generateRequestId = generateRequestId;
exports.hashIp = hashIp;
exports.hashEmail = hashEmail;
exports.maskEmail = maskEmail;
exports.anonymizeUser = anonymizeUser;
exports.buildPaginatedResult = buildPaginatedResult;
exports.getPaginationOffset = getPaginationOffset;
exports.slugify = slugify;
exports.addDays = addDays;
exports.isExpired = isExpired;
exports.withRetry = withRetry;
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
// ─── ID Generation ────────────────────────────────────────────────────────────
function generateId() {
    return (0, uuid_1.v4)();
}
function generateTraceId() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
function generateRequestId() {
    return `req_${(0, crypto_1.randomBytes)(8).toString('hex')}`;
}
// ─── Hashing ─────────────────────────────────────────────────────────────────
function hashIp(ip) {
    return (0, crypto_1.createHash)('sha256').update(ip + (process.env['IP_HASH_SALT'] ?? '')).digest('hex').slice(0, 16);
}
function hashEmail(email) {
    return (0, crypto_1.createHash)('sha256').update(email.toLowerCase().trim()).digest('hex');
}
// ─── LGPD — PII Anonymization ─────────────────────────────────────────────────
function maskEmail(email) {
    const [local, domain] = email.split('@');
    if (!local || !domain)
        return '***@***.***';
    const masked = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***';
    return `${masked}@${domain}`;
}
function anonymizeUser(userId) {
    return `anon_${(0, crypto_1.createHash)('sha256').update(userId).digest('hex').slice(0, 12)}`;
}
// ─── Pagination ───────────────────────────────────────────────────────────────
function buildPaginatedResult(data, total, query) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
function getPaginationOffset(query) {
    const page = Math.max(query.page ?? 1, 1);
    const take = Math.min(query.pageSize ?? 20, 100);
    return { skip: (page - 1) * take, take };
}
// ─── Slug ─────────────────────────────────────────────────────────────────────
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}
// ─── Date ─────────────────────────────────────────────────────────────────────
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function isExpired(date) {
    return date < new Date();
}
// ─── Retry ───────────────────────────────────────────────────────────────────
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 100) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
            }
        }
    }
    throw lastError;
}
//# sourceMappingURL=index.js.map