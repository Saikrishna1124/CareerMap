require('dotenv').config();
async function test() {
  const adzunaId = process.env.ADZUNA_APP_ID || process.env.ADZUNA_ID;
  const adzunaKey = process.env.ADZUNA_APP_KEY || process.env.ADZUNA_KEY;
  console.log('ID:', adzunaId ? 'Found' : 'Missing', 'KEY:', adzunaKey ? 'Found' : 'Missing');
  if(adzunaId && adzunaKey) {
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${adzunaId}&app_key=${adzunaKey}&results_per_page=1&what=python`);
    console.log(res.status, await res.text());
  } else {
    console.log("No adzuna keys found in process.env");
  }
}
test();
