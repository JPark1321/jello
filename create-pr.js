import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';

const {
  BB_ACCESS_TOKEN, // Your Bearer Token
  WORKSPACE, REPO_SLUG,
  BASE_BRANCH = 'main',
  NEW_BRANCH = `auto-change-${Date.now()}`,
  FILE_PATH = 'src/auto.txt',
  COMMIT_MESSAGE = 'Automated update',
  PR_TITLE = 'Automated PR',
  PR_DESCRIPTION = 'Created by script'
} = process.env;

// Updated: Check for BB_ACCESS_TOKEN
if (!BB_ACCESS_TOKEN || !WORKSPACE || !REPO_SLUG) {
  console.error('Set BB_ACCESS_TOKEN, WORKSPACE, REPO_SLUG in your .env file');
  process.exit(1);
}

// Updated: Use Bearer Token in the Authorization header
const api = axios.create({
  baseURL: `https://api.bitbucket.org/2.0/repositories/${WORKSPACE}/${REPO_SLUG}`,
  headers: {
    'Authorization': `Bearer ${BB_ACCESS_TOKEN}`,
    'Accept': 'application/json', // Generally good practice for Bitbucket API
  },
});

async function getBranchHash(branch) {
  // Ensure the branch name is URL-safe
  const branchName = encodeURIComponent(branch);
  
  // Use a try-catch for the lookup to provide better context
  try {
    const r = await api.get(`/refs/branches/${branchName}`);
    // Bitbucket returns an object with a 'target' property containing the commit hash
    return r.data.target.hash;
  } catch (e) {
    console.error(`Error fetching hash for branch: ${branchName}`);
    // Re-throw to be caught by the main function's catch block
    throw e;
  }
}

async function createBranch(name, fromHash) {
  try {
    // API endpoint for creating a branch
    await api.post('/refs/branches', { name, target: { hash: fromHash } });
    console.log('✅ Branch created:', name);
  } catch (e) {
    // Log helpful API error data
    console.error('❌ Create branch failed:', e.response?.data?.error?.message || e.message);
    // If the branch already exists, it often returns a 400. We can check for that.
    if (e.response?.status === 400 && (e.response.data?.error?.message || '').includes('already exists')) {
      console.log(`Branch ${name} already exists. Proceeding with commit.`);
      return; // Exit gracefully if branch exists
    }
    throw e; // Throw other errors
  }
}

async function commitFile(branch, path, content, message) {
  const form = new FormData();
  form.append('branch', branch);
  form.append('message', message);
  // Key must be the file path, value is the content, and options ensure the filename is correct
  form.append(path, content, { filename: path }); 
  
  // Need to pass the form headers (Content-Type: multipart/form-data with boundary) to axios
  await api.post('/src', form, { headers: form.getHeaders() });
  console.log('📝 File committed to', branch);
}

async function deleteFile(branch, path, message) {
  const form = new FormData();
  form.append('branch', branch);
  form.append('message', message);
  // Crucial: Use the special key '_file_to_delete' with the path as its value.
  form.append('_file_to_delete', path); 
  
  // Send the POST request to the /src endpoint
  await api.post('/src', form, { headers: form.getHeaders() });
  console.log(`🗑️ File deleted: ${path} from ${branch}`);
}

async function createPR(title, desc, src, dest) {
  const payload = { 
    title, 
    description: desc, 
    source: { branch: { name: src } }, 
    destination: { branch: { name: dest } } 
  };
  
  const r = await api.post('/pullrequests', payload);
  console.log('🚀 Pull Request created:', r.data.links.html.href);
}

(async () => {
  try {
    // 1. Get the hash of the base branch
    const baseHash = await getBranchHash(BASE_BRANCH);
    
    // 2. Create the new branch from the base branch's hash
    await createBranch(NEW_BRANCH, baseHash);
    
    // 3. Commit the file change to the new branch
    const fileContent = `Automated update time: ${new Date().toISOString()}\n`;
    await commitFile(NEW_BRANCH, FILE_PATH, fileContent, COMMIT_MESSAGE);
    
    // 4. Create the Pull Request
    await createPR(PR_TITLE, PR_DESCRIPTION, NEW_BRANCH, BASE_BRANCH);
    
  } catch (err) {
    console.error('\n--- Script Failed ---');
    // Log the full API error response if available
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
})();