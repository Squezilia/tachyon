import { createClient } from '@clickhouse/client';

const clickhouse = createClient({
  url: import.meta.env.CLICKHOUSE_URL,
});

export default clickhouse;
