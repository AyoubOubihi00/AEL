import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

type User = {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
};

type ConsumptionEntry = {
  month: string;
  value: number;
};

type Invoice = {
  reference: string;
  amount: number;
  date: string;
};

type Contract = {
  id: string;
  userId: string;
  reference: string;
  name: string;
  activity: string;
  subscriptionDate: string;
  address: string;
  consumptions: ConsumptionEntry[];
  invoices: Invoice[];
  nextInvoiceEstimate: number;
};

type DbData = {
  users: User[];
  contracts: Contract[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');
const dbFile = join(dataDir, 'db.json');
const adapter = new JSONFile<DbData>(dbFile);
const db = new Low<DbData>(adapter, { users: [], contracts: [] });

const app = express();
app.use(cors());
app.use(express.json());

const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];

const publicUser = (user: User) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

const nextId = (items: { id: string }[], prefix: string) => {
  const max = items.reduce((acc, item) => {
    const numeric = Number(item.id.replace(prefix, ''));
    return Number.isNaN(numeric) ? acc : Math.max(acc, numeric);
  }, 0);
  return `${prefix}${max + 1}`;
};

const buildContractsForUser = (userId: string, startRef: number, city: string) => {
  const contracts: Contract[] = [];
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const userOffset = (seed % 15) * 5;
  for (let index = 0; index < 3; index += 1) {
    const ref = startRef + index;
    const variation = (seed + ref + index * 17) % 25;
    contracts.push({
      id: `c${startRef + index}`,
      userId,
      reference: `${ref}`,
      name: `Contrat ${index + 1}`,
      activity: index % 2 === 0 ? 'Elec' : 'Gaz',
      subscriptionDate: '2029-01-26',
      address: `3 chemin du moulin, ${city} ${57000 + index}`,
      consumptions: months.slice(0, 7).map((month, offset) => ({
        month,
        value: Math.round((Math.sin(offset + index) * 80 + 120) * (index + 1) * 0.4),
      })),
      invoices: [
        { reference: `${ref}-A`, amount: 45 + userOffset + variation * 2 + index * 7, date: '2025-11-12' },
        { reference: `${ref}-B`, amount: 55 + userOffset + variation * 3 + index * 5, date: '2025-12-12' },
      ],
      nextInvoiceEstimate: 50 + userOffset + variation * 2 + index * 6,
    });
  }
  return contracts;
};

const contratsPourUtilisateur = (userId: string) => {
  const filtered = db.data.contracts.filter((contract) => contract.userId === userId);
  const uniques = new Map<string, Contract>();
  filtered.forEach((contract) => {
    if (!uniques.has(contract.id)) {
      uniques.set(contract.id, contract);
    }
  });
  return Array.from(uniques.values())
    .sort((a, b) => Number(a.id.replace('c', '')) - Number(b.id.replace('c', '')))
    .slice(0, 3);
};
const normaliserContrats = () => {
  const parUtilisateur = new Map<string, Contract[]>();
  db.data.contracts.forEach((contract) => {
    const liste = parUtilisateur.get(contract.userId) ?? [];
    liste.push(contract);
    parUtilisateur.set(contract.userId, liste);
  });

  const normalises: Contract[] = [];
  let modifie = false;

  for (const [, contrats] of parUtilisateur) {
    const tries = [...contrats].sort((a, b) => {
      const idA = Number(a.id.replace('c', ''));
      const idB = Number(b.id.replace('c', ''));
      return idA - idB;
    });
    const uniques: Contract[] = [];
    const seen = new Set<string>();
    tries.forEach((contract) => {
      if (!seen.has(contract.id)) {
        seen.add(contract.id);
        uniques.push(contract);
      }
    });
    if (uniques.length !== contrats.length || uniques.length > 3) {
      modifie = true;
    }
    normalises.push(...uniques.slice(0, 3));
  }

  if (modifie) {
    db.data.contracts = normalises;
  }
  return modifie;
};

const hashString = (value: string) => {
  return value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const buildChartData = (seed: number) => {
  const labels = months.slice(0, 7);
  let state = seed || 12345;
  const random = () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  const serie = (label: string, base: number) => ({
    label,
    data: labels.map(() => Math.round(base + random() * 90)),
  });

  return {
    labels,
    series: [
      serie('Heures pleines', 60),
      serie('Heures creuses', 40),
      serie('Week-end', 30),
    ],
  };
};

const factureRecente = (contracts: Contract[]) => {
  const factures = contracts.flatMap((contract) => contract.invoices);
  if (!factures.length) {
    return null;
  }
  return factures.reduce((latest, current) => (current.date > latest.date ? current : latest), factures[0]);
};

const estimationMoyenne = (contracts: Contract[]) => {
  if (!contracts.length) {
    return 0;
  }
  const total = contracts.reduce((acc, contract) => acc + contract.nextInvoiceEstimate, 0);
  return Math.round(total / contracts.length);
};
const historiqueFactures = (contracts: Contract[]) => {
  return contracts
    .flatMap((contract) =>
      contract.invoices.map((invoice) => ({
        ...invoice,
        contractName: contract.name,
        contractReference: contract.reference,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
};

const seedDatabase = (): DbData => {
  const user1: User = {
    id: 'u1',
    email: 'user01@toto.fr',
    password: 'toto-du-57',
    firstName: 'Lewis',
    lastName: 'Hamilton',
    birthDate: '1990-01-26',
  };

  return {
    users: [user1],
    contracts: [
      ...buildContractsForUser(user1.id, 123, 'METZ'),
    ],
  };
};

const initDb = async () => {
  await mkdir(dataDir, { recursive: true });
  await db.read();
  if (!db.data || db.data.users.length === 0) {
    db.data = seedDatabase();
    await db.write();
    return;
  }
  const modifie = normaliserContrats();
  if (modifie) {
    await db.write();
  }
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/auth/login', async (req, res) => {
  await db.read();
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ message: 'Missing credentials' });
    return;
  }
  const user = db.data.users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
  );
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  res.json({ user: publicUser(user) });
});

app.post('/auth/register', async (req, res) => {
  await db.read();
  const { email, password, firstName, lastName, birthDate } = req.body as {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;
  };

  if (!email || !password || !firstName || !lastName || !birthDate) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  const existing = db.data.users.find(
    (entry) => entry.email.toLowerCase() === email.toLowerCase(),
  );

  if (existing) {
    res.status(409).json({ message: 'Email already exists' });
    return;
  }

  const userId = nextId(db.data.users, 'u');
  const newUser: User = {
    id: userId,
    email,
    password,
    firstName,
    lastName,
    birthDate,
  };
  const contractStart = 200 + db.data.contracts.length;
  const contracts = buildContractsForUser(userId, contractStart, 'NANCY');

  db.data.users.push(newUser);
  db.data.contracts.push(...contracts);
  await db.write();

  res.status(201).json({ user: publicUser(newUser) });
});

app.get('/auth/check-email', async (req, res) => {
  await db.read();
  const email = String(req.query.email || '').toLowerCase();
  if (!email) {
    res.status(400).json({ message: 'Missing email' });
    return;
  }
  const exists = db.data.users.some((entry) => entry.email.toLowerCase() === email);
  res.json({ exists });
});

app.get('/users/:userId/contracts', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const contracts = contratsPourUtilisateur(userId);
  res.json({ contracts });
});

app.get('/contracts/:contractId', async (req, res) => {
  await db.read();
  const { contractId } = req.params;
  const contract = db.data.contracts.find((entry) => entry.id === contractId);
  if (!contract) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  res.json({ contract });
});

app.get('/contracts/:contractId/consommations', async (req, res) => {
  await db.read();
  const { contractId } = req.params;
  const contract = db.data.contracts.find((entry) => entry.id === contractId);
  if (!contract) {
    res.status(404).json({ message: 'Not found' });
    return;
  }
  const data = buildChartData(hashString(contractId));
  res.json({ data });
});

app.get('/dashboard/:userId/consommations', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const data = buildChartData(hashString(userId));
  res.json({ data });
});

app.get('/dashboard/:userId/factures', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const contracts = contratsPourUtilisateur(userId);
  const facture = factureRecente(contracts);
  res.json({ data: facture });
});
app.get('/dashboard/:userId/factures/historique', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const contracts = contratsPourUtilisateur(userId);
  const data = historiqueFactures(contracts);
  res.json({ data });
});

app.get('/dashboard/:userId/estimation', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const contracts = contratsPourUtilisateur(userId);
  res.json({ data: estimationMoyenne(contracts) });
});

app.get('/dashboard/:userId/justificatif', async (req, res) => {
  await db.read();
  const { userId } = req.params;
  const contracts = contratsPourUtilisateur(userId);
  res.json({ data: contracts.length > 0 });
});

const start = async () => {
  await initDb();
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`AEL backend listening on http://localhost:${port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});



