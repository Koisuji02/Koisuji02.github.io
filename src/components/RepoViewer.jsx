import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import projectLists from '../data/projectLists.json';
import projectsMeta from '../data/projectsMeta.json';

const languageIconMap = {
  JavaScript: { icon: 'devicon:javascript', color: '#f7df1e' },
  TypeScript: { icon: 'devicon:typescript', color: '#3178c6' },
  HTML: { icon: 'devicon:html5', color: '#e34f26' },
  CSS: { icon: 'devicon:css3', color: '#1572b6' },
  SCSS: { icon: 'devicon:sass', color: '#cc6699' },
  Sass: { icon: 'devicon:sass', color: '#cc6699' },
  Python: { icon: 'devicon:python', color: '#3776ab' },
  Java: { icon: 'devicon:java', color: '#ed8b00' },
  'C#': { icon: 'devicon:csharp', color: '#239120' },
  C: { icon: 'devicon:c', color: '#a8b9cc' },
  'C++': { icon: 'devicon:cplusplus', color: '#00599c' },
  Go: { icon: 'devicon:go', color: '#00add8' },
  Rust: { icon: 'devicon:rust', color: '#000000' },
  PHP: { icon: 'devicon:php', color: '#777bb4' },
  Ruby: { icon: 'devicon:ruby', color: '#cc342d' },
  Swift: { icon: 'devicon:swift', color: '#fa7343' },
  Kotlin: { icon: 'devicon:kotlin', color: '#7f52ff' },
  Scala: { icon: 'devicon:scala', color: '#dc322f' },
  Dart: { icon: 'devicon:dart', color: '#0175c2' },
  Lua: { icon: 'devicon:lua', color: '#2c2d72' },
  Shell: { icon: 'devicon:bash', color: '#4eaa25' },
  PowerShell: { icon: 'devicon:powershell', color: '#5391fe' },
  Dockerfile: { icon: 'devicon:docker', color: '#2496ed' },
  Jupyter: { icon: 'simple-icons:jupyter', color: '#f37626' },
  'Jupyter Notebook': { icon: 'simple-icons:jupyter', color: '#f37626' },
  TeX: { icon: 'simple-icons:latex', color: '#008080' },
  Makefile: { icon: 'simple-icons:gnu', color: '#a42e2b' }
};

const getLanguageIcon = (language) =>
  languageIconMap[language] || { icon: 'mdi:code-tags', color: '#8ee0ff' };

const normalizeName = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '');


const filterByList = (repos, repoNames) => {
  if (!repoNames?.length) return [];
  const order = new Map(repoNames.map((name, index) => [name.toLowerCase(), index]));
  return repos
    .filter((repo) => order.has((repo.full_name || '').toLowerCase()))
    .sort((a, b) => order.get(a.full_name.toLowerCase()) - order.get(b.full_name.toLowerCase()));
};

const RepoViewer = ({ username }) => {
  const [repos, setRepos] = useState([]);
  const [status, setStatus] = useState('loading');
  const previews = useMemo(
    () =>
      import.meta.glob('../assets/projects/*.{png,jpg,jpeg,webp,avif}', {
        eager: true,
        import: 'default'
      }),
    []
  );

  const previewMap = useMemo(() => {
    return Object.entries(previews).reduce((acc, [path, src]) => {
      const filename = path.split('/').pop().split('.').slice(0, -1).join('.');
      acc[normalizeName(filename)] = src;
      return acc;
    }, {});
  }, [previews]);

  useEffect(() => {
    const staticRepos = [...(projectsMeta.didactic || []), ...(projectsMeta.personal || [])];
    setRepos(staticRepos);
    setStatus('ready');
  }, [username]);

  if (status === 'loading') {
    return <p className="projects__status">Loading repositories...</p>;
  }

  const didactic = filterByList(repos, projectLists.didactic);
  const personal = filterByList(repos, projectLists.personal);

  const resolveCover = (repo) => {
    if (repo.readmeCover) {
      const cleaned = repo.readmeCover.replace(/^\.\//, '').trim();
      if (cleaned.startsWith('http')) return cleaned;
      return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${cleaned}`;
    }

    if (repo.coverUrl) {
      return repo.coverUrl;
    }

    const normalized = normalizeName(repo.name);
    return previewMap[normalized] || '';
  };

  const renderSection = (title, items) => (
    <div className="projects-section">
      <h3 className="projects-section__title">{title}</h3>
      {items.length === 0 ? (
        <p className="projects__status">No repositories found in this list.</p>
      ) : (
        <div className="projects__grid">
          {items.map((repo) => (
            <article className="project-card" key={repo.id}>
              <div className="project-card__media">
                {resolveCover(repo) ? (
                  <img
                    src={resolveCover(repo)}
                    alt={`${repo.readmeTitle || repo.name} preview`}
                    loading="lazy"
                  />
                ) : (
                  <div className="project-card__media-fallback">
                    {repo.readmeTitle || repo.name}
                  </div>
                )}
              </div>
              <div className="project-card__top">
                <h3>{repo.readmeTitle || repo.name}</h3>
              </div>
              <div className="project-card__languages">
                {(repo.languages || []).map((language) => {
                  const { icon, color } = getLanguageIcon(language);
                  return (
                    <span className="project-card__lang" key={`${repo.name}-${language}`}>
                      <Icon icon={icon} color={color} width={18} height={18} />
                    </span>
                  );
                })}
              </div>
              <p className="project-card__desc">
                {repo.readmeDescription || repo.description || 'No description yet.'}
              </p>
              <div className="project-card__meta">
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  View
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="projects-wrapper">
      {renderSection('Personal Projects', personal)}
      {renderSection('Didactic Projects', didactic)}
    </div>
  );
};

export default RepoViewer;