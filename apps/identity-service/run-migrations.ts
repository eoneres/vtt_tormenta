import { AppDataSource } from './data-source';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations({ transaction: 'all' });

  const tables: Array<{ tablename: string }> = await AppDataSource.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
  );
  console.log('✅ Tables:', tables.map((t) => t.tablename).join(', '));
  await AppDataSource.destroy();
}

main().catch((e: Error) => {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
});
