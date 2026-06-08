const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '..', '..', 'prisma', 'dev.db');
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);

const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
