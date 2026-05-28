const API_BASE = 'http://localhost:5000';

async function login() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fundo.com', password: 'P@ssw0rd!' })
  });
  const data = await res.json();
  return data.token;
}

async function createLoan(token, amount, name) {
  const res = await fetch(`${API_BASE}/api/loans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount, applicantName: name })
  });
  return res.json();
}

async function makePayment(token, loanId, amount, key) {
  const res = await fetch(`${API_BASE}/api/loans/${loanId}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount, idempotencyKey: key })
  });
  return res.json();
}

async function listLoans(token, page, size) {
  const res = await fetch(`${API_BASE}/api/loans?pageNumber=${page}&pageSize=${size}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

const firstNames = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda',
  'David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica',
  'Thomas','Sarah','Charles','Karen','Christopher','Nancy','Daniel','Lisa',
  'Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley',
  'Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle',
  'Kenneth','Dorothy','Kevin','Carol','Brian','Amanda','George','Melissa',
  'Edward','Deborah','Ronald','Stephanie','Timothy','Rebecca','Jason','Sharon',
  'Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy',
  'Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda',
  'Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen',
  'Benjamin','Samantha','Samuel','Katherine','Gregory','Christine','Frank','Debra',
  'Alexander','Rachel','Raymond','Catherine','Patrick','Carolyn','Jack','Janet',
  'Dennis','Ruth','Jerry','Maria','Tyler','Heather','Aaron','Diane',
  'Jose','Virginia','Adam','Julie','Nathan','Joyce','Henry','Victoria',
  'Douglas','Olivia','Zachary','Kelly','Peter','Christina','Kyle','Lauren',
  'Ethan','Joan','Walter','Evelyn','Noah','Judith','Jeremy','Megan',
  'Christian','Cheryl','Keith','Andrea','Roger','Hannah','Terry','Martha',
  'Gerald','Jacqueline','Harold','Frances','Sean','Gloria','Austin','Ann',
  'Carl','Teresa','Arthur','Kathryn','Lawrence','Sara','Dylan','Janice',
  'Jesse','Jean','Jordan','Alice','Bryan','Madison','Billy','Doris',
  'Joe','Abigail','Bruce','Julia','Gabriel','Judy','Logan','Grace',
  'Albert','Denise','Willie','Amber','Alan','Marilyn','Juan','Beverly',
  'Wayne','Danielle','Elijah','Theresa','Randy','Sophia','Roy','Marie',
  'Vincent','Diana','Ralph','Brittany','Eugene','Natalie','Russell','Isabella',
  'Bobby','Charlotte','Mason','Rose','Philip','Alexis','Louis','Kayla'
];

const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas',
  'Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White',
  'Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young',
  'Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell',
  'Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker',
  'Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy',
  'Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey',
  'Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson',
  'Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza',
  'Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers',
  'Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell'
];

async function main() {
  console.log('→ Logging in...');
  const token = await login();
  console.log('→ Got token');

  // 1. Create 200 loans
  console.log('→ Creating 200 loans...');
  const loanIds = [];
  for (let i = 1; i <= 200; i++) {
    const first = firstNames[(i - 1) % firstNames.length];
    const last = lastNames[(i - 1) % lastNames.length];
    const name = `${first} ${last}`;
    const amount = parseFloat((5000 + ((i * 473) % 95001)).toFixed(2));

    const loan = await createLoan(token, amount, name);
    loanIds.push(loan.id);

    if (i % 20 === 0) {
      console.log(`  Created ${i} loans...`);
    }
  }

  // 2. Fetch current balances for all loans
  console.log('→ Fetching loan balances...');
  const allLoans = await listLoans(token, 1, 200);
  const activeLoans = allLoans.items
    .filter(l => l.currentBalance > 0)
    .map(l => ({ id: l.id, balance: l.currentBalance }));

  // 3. Apply partial payments to ~120 loans
  console.log('→ Applying partial payments...');
  const paymentCount = Math.min(120, activeLoans.length);
  for (let i = 0; i < paymentCount; i++) {
    const loan = activeLoans[(i * 7 + 13) % activeLoans.length];
    if (!loan || loan.balance <= 0) continue;

    const pct = 0.1 + ((i % 8) * 0.1);
    const payment = parseFloat(Math.min(loan.balance * pct, loan.balance).toFixed(2));

    try {
      await makePayment(token, loan.id, payment, `seed-${loan.id}-${i}`);
    } catch {
      // skip on error
    }

    if ((i + 1) % 20 === 0) {
      console.log(`  Applied ${i + 1} payments...`);
    }
  }

  // 4. Re-fetch and pay off ~30 loans fully
  console.log('→ Paying off ~30 loans fully...');
  const refreshed = await listLoans(token, 1, 200);
  const stillActive = refreshed.items
    .filter(l => l.currentBalance > 0)
    .slice(0, 30);

  for (let i = 0; i < stillActive.length; i++) {
    const loan = stillActive[i];
    try {
      await makePayment(token, loan.id, loan.currentBalance, `payoff-${loan.id}-${i}`);
    } catch {
      // skip on error
    }
  }

  console.log('');
  console.log('✅ Done! Seeded 200+ loans with varied payments.');
  console.log('→ Open http://localhost:4200 and log in to test pagination.');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
