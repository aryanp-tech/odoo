// test_e2e_roles.cjs
// Automated test script validating live Odoo 14 authentication and role detection across all roles

const http = require('http');

const testAccounts = [
  { label: 'Super Admin (superadmin)', login: 'superadmin@test.com', pass: 'superadmin', expectedRole: 'super_admin' },
  { label: 'Super Admin (aryan)', login: 'aryan.p@latitudetechnolabs.org', pass: 'Aryan@123', expectedRole: 'super_admin' },
  { label: 'Super Admin (admin)', login: 'admin', pass: 'admin', expectedRole: 'super_admin' },
  { label: 'HR Admin (hradmin)', login: 'hr@test.com', pass: 'hradmin', expectedRole: 'hr_admin' },
  { label: 'IT Admin (itadmin)', login: 'it@test.com', pass: 'itadmin', expectedRole: 'it_admin' },
  { label: 'Employee (jaimin)', login: 'jaimin.p@gmail.com', pass: 'jaimin', expectedRole: 'employee' },
];

function rpc(path, body, cookie = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8069,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(cookie ? { Cookie: cookie } : {}),
        },
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          try {
            const setCookie = res.headers['set-cookie'];
            const cookieHeader = setCookie ? setCookie.map((c) => c.split(';')[0]).join('; ') : '';
            resolve({ data: JSON.parse(respData), cookie: cookieHeader });
          } catch (e) {
            resolve({ data: respData, cookie: '' });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testUser(account) {
  console.log(`\n--------------------------------------------------`);
  console.log(`Testing: ${account.label} (${account.login})`);

  // 1. Authenticate
  const authRes = await rpc('/web/session/authenticate', {
    jsonrpc: '2.0',
    params: {
      db: 'aryanodoo',
      login: account.login,
      password: account.pass,
    },
  });

  if (!authRes.data.result || !authRes.data.result.uid) {
    console.error(`❌ Authentication FAILED:`, authRes.data.error || 'No UID');
    return false;
  }

  const odooUser = authRes.data.result;
  const cookie = authRes.cookie;
  console.log(`✅ Authenticated with Odoo! UID: ${odooUser.uid}, Name: "${odooUser.name}"`);

  // 2. Fetch Groups
  const userRes = await rpc(
    '/web/dataset/call_kw',
    {
      jsonrpc: '2.0',
      params: {
        model: 'res.users',
        method: 'read',
        args: [[odooUser.uid], ['groups_id']],
        kwargs: {},
      },
    },
    cookie
  );

  const gids = userRes.data.result?.[0]?.groups_id || [];
  let groupNames = [];
  if (gids.length > 0) {
    const grpRes = await rpc(
      '/web/dataset/call_kw',
      {
        jsonrpc: '2.0',
        params: {
          model: 'res.groups',
          method: 'read',
          args: [gids, ['name']],
          kwargs: {},
        },
      },
      cookie
    );
    groupNames = (grpRes.data.result || []).map((g) => g.name);
  }

  // 3. Fetch linked Employee record
  const empRes = await rpc(
    '/web/dataset/call_kw',
    {
      jsonrpc: '2.0',
      params: {
        model: 'hr.employee',
        method: 'search_read',
        args: [[['user_id', '=', odooUser.uid]]],
        kwargs: {
          fields: ['id', 'name', 'work_email', 'job_title', 'department_id'],
        },
      },
    },
    cookie
  );

  const emp = empRes.data.result?.[0];
  console.log(`👤 Linked Employee: ID ${emp?.id}, Name: "${emp?.name}", Job: "${emp?.job_title}", Dept: "${emp?.department_id?.[1] || 'None'}"`);

  // 4. Role detection logic exactly matching authService.js
  const cleanLower = account.login.toLowerCase();
  const isSuperAdmin =
    Boolean(odooUser.is_system) ||
    groupNames.includes('Super Admin') ||
    cleanLower === 'admin' ||
    cleanLower.includes('superadmin') ||
    cleanLower === 'aryan.p@latitudetechnolabs.org';

  const isHrAdmin =
    !isSuperAdmin && (
      cleanLower.includes('hr') ||
      groupNames.includes('Quarterly Review Super Admin') ||
      groupNames.includes('Employee Voting Admin') ||
      (groupNames.includes('Administrator') && cleanLower.includes('hr'))
    );

  const isItAdmin =
    !isSuperAdmin && (
      cleanLower.includes('it') ||
      groupNames.includes('IT Admin') ||
      groupNames.includes('IT Officer') ||
      groupNames.includes('Server Issue Admin')
    );

  let detectedRole = 'employee';
  if (isSuperAdmin) detectedRole = 'super_admin';
  else if (isHrAdmin) detectedRole = 'hr_admin';
  else if (isItAdmin) detectedRole = 'it_admin';

  console.log(`🎯 Detected Role: ${detectedRole.toUpperCase()} (Expected: ${account.expectedRole.toUpperCase()})`);

  if (detectedRole === account.expectedRole) {
    console.log(`🎉 TEST PASSED!`);
    return true;
  } else {
    console.error(`❌ ROLE MISMATCH!`);
    return false;
  }
}

async function runAll() {
  console.log(`====================================================`);
  console.log(`RUNNING FULL END-TO-END ROLE AUTHENTICATION SUITE`);
  console.log(`====================================================`);

  let allPassed = true;
  for (const acc of testAccounts) {
    const passed = await testUser(acc);
    if (!passed) allPassed = false;
  }

  console.log(`\n====================================================`);
  if (allPassed) {
    console.log(`✨ ALL 6 ROLE-BASED LOGIN TESTS PASSED SUCCESSFULLY!`);
  } else {
    console.log(`⚠️ SOME TESTS FAILED`);
  }
  console.log(`====================================================\n`);
}

runAll();
