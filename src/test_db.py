import psycopg2
conn = psycopg2.connect('postgresql://mockmate_db_mdz5_user:91gng5jDSolqvtWam48bG2t1gLgT8Loz@dpg-d84uisjtqb8s73edtdc0-a.singapore-postgres.render.com/mockmate_db_mdz5_iks9')
cur = conn.cursor()
cur.execute('SELECT * FROM "PaymentTransactions" ORDER BY "Id" DESC LIMIT 5;')
print(cur.fetchall())
