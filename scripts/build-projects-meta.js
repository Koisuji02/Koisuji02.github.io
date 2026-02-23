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

const fetchRepoMeta = async (fullName) => {
  try {
    const repo = await fetchJson(`https://api.github.com/repos/${fullName}`);
    const languages = await fetchJson(`https://api.github.com/repos/${fullName}/languages`).catch(() => ({}));

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
      languages: Object.keys(languages),
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
