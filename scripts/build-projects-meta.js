import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const listsPath = path.join(root, 'src', 'data', 'projectLists.json');
const outputPath = path.join(root, 'src', 'data', 'projectsMeta.json');

const token = process.env.GITHUB_TOKEN || process.env.GH_PAT || '';

const headers = {
  'User-Agent': 'webportfolio-build-script',
  Accept: 'application/vnd.github+json'
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

const readJson = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
};

const fetchJson = async (url, extraHeaders = {}) => {
  const res = await fetch(url, {
    headers: {
      ...headers,
      ...extraHeaders
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.json();
};

const fetchText = async (url, extraHeaders = {}) => {
  const res = await fetch(url, {
    headers: {
      ...headers,
      ...extraHeaders
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  return res.text();
};

const stripMarkdown = (text) =>
  text
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/[*_~#>]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const parseReadme = (readme) => {
  if (!readme) return { title: '', description: '', coverPath: '' };

  const lines = readme.split('\n');
  const titleLine = lines.find((line) => /^#{1,2}\s+/.test(line.trim())) || '';
  const title = titleLine.replace(/^#{1,2}\s+/, '').trim();

  let description = '';
  const descIndex = lines.findIndex((line) => /^#{1,2}\s*Description\b/i.test(line.trim()));
  if (descIndex >= 0) {
    const descLines = [];
    for (let index = descIndex + 1; index < lines.length; index += 1) {
      if (/^#{1,6}\s+/.test(lines[index].trim())) break;
      descLines.push(lines[index]);
    }
    description = stripMarkdown(descLines.join(' ').trim());
  }

  const coverMatch = readme.match(/!\[[^\]]*cover[^\]]*\]\(([^\)]+)\)/i);
  const coverPath = coverMatch ? coverMatch[1].trim() : '';

  return { title, description, coverPath };
};

const resolveCover = (fullName, branch, readmeCover) => {
  if (!readmeCover) return '';
  const cleaned = readmeCover.replace(/^\.\//, '').trim();
  if (cleaned.startsWith('http')) return cleaned;
  return `https://raw.githubusercontent.com/${fullName}/${branch}/${cleaned}`;
};

// An umbrella repo (only git submodules + docs) reports no languages of its own.
// Parse its `.gitmodules` and return the GitHub `owner/repo` of each submodule so we
// can aggregate their languages onto the umbrella card.
const parseSubmoduleRepos = (gitmodules) => {
  const repos = [];
  const urlRegex = /url\s*=\s*(\S+)/g;
  let match;
  while ((match = urlRegex.exec(gitmodules)) !== null) {
    const cleaned = match[1].trim().replace(/\.git$/, '');
    const ownerRepo = cleaned.match(/github\.com[/:]([^/\s]+\/[^/\s]+)/i);
    if (ownerRepo) repos.push(ownerRepo[1]);
  }
  return repos;
};

const fetchLanguageBytes = async (fullName) =>
  fetchJson(`https://api.github.com/repos/${fullName}/languages`).catch(() => ({}));

// Merge language byte-counts from the repo itself plus any submodules, then order by
// total bytes descending (matching how GitHub ranks languages).
const collectLanguages = async (fullName, branch, ownLanguages) => {
  const totals = { ...ownLanguages };
  let gitmodules = '';
  try {
    gitmodules = await fetchText(
      `https://raw.githubusercontent.com/${fullName}/${branch}/.gitmodules`,
      { Accept: '*/*' }
    );
  } catch {
    // no submodules — fall back to the repo's own languages
  }
  if (gitmodules) {
    for (const subRepo of parseSubmoduleRepos(gitmodules)) {
      const subLanguages = await fetchLanguageBytes(subRepo);
      for (const [language, bytes] of Object.entries(subLanguages)) {
        totals[language] = (totals[language] || 0) + bytes;
      }
    }
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([language]) => language);
};

const fetchRepoMeta = async (fullName) => {
  try {
    const repo = await fetchJson(`https://api.github.com/repos/${fullName}`);
    const ownLanguages = await fetchLanguageBytes(fullName);
    const languages = await collectLanguages(repo.full_name, repo.default_branch || 'main', ownLanguages);

    let readme = '';
    try {
      readme = await fetchText(`https://api.github.com/repos/${fullName}/readme`, {
        Accept: 'application/vnd.github.raw'
      });
    } catch {
      const branch = repo.default_branch || 'main';
      const rawCandidates = [
        `https://raw.githubusercontent.com/${fullName}/${branch}/README.md`,
        `https://raw.githubusercontent.com/${fullName}/${branch}/readme.md`,
        `https://raw.githubusercontent.com/${fullName}/${branch}/README.MD`
      ];

      for (const candidate of rawCandidates) {
        try {
          readme = await fetchText(candidate, { Accept: '*/*' });
          break;
        } catch {
          // ignore candidate and continue
        }
      }
    }

    const parsed = parseReadme(readme);

    return {
      full_name: repo.full_name,
      name: repo.name,
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      languages,
      readmeTitle: parsed.title,
      readmeDescription: parsed.description,
      readmeCover: parsed.coverPath,
      coverUrl: resolveCover(repo.full_name, repo.default_branch || 'main', parsed.coverPath)
    };
  } catch {
    return {
      full_name: fullName,
      name: fullName.split('/')[1] || fullName,
      html_url: `https://github.com/${fullName}`,
      default_branch: 'main',
      languages: [],
      readmeTitle: '',
      readmeDescription: '',
      readmeCover: '',
      coverUrl: ''
    };
  }
};

const build = async () => {
  const lists = await readJson(listsPath);
  const didacticNames = lists.didactic || [];
  const personalNames = lists.personal || [];
  const allNames = [...didacticNames, ...personalNames];

  const metas = [];
  for (const fullName of allNames) {
    const meta = await fetchRepoMeta(fullName);
    metas.push(meta);
  }

  const byName = new Map(metas.map((meta) => [meta.full_name.toLowerCase(), meta]));
  const payload = {
    generatedAt: new Date().toISOString(),
    didactic: didacticNames.map((name) => byName.get(name.toLowerCase())).filter(Boolean),
    personal: personalNames.map((name) => byName.get(name.toLowerCase())).filter(Boolean)
  };

  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2));
  console.log(`Generated projects metadata: ${outputPath}`);
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
