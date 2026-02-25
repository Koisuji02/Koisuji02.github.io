import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { about, terminalContacts } from '../data/siteData';
import { skillGroups } from './SkillsGrid';
import SnakeGame from './TerminalGames/SnakeGame';
import TetrisGame from './TerminalGames/TetrisGame';
import projectLists from '../data/projectLists.json';
import projectsMeta from '../data/projectsMeta.json';

const prompt = 'koisuji@dev ';
const nameArt = `██╗  ██╗ ██████╗ ██╗███████╗██╗   ██╗     ██╗██╗
██║ ██╔╝██╔═══██╗██║██╔════╝██║   ██║     ██║██║
█████╔╝ ██║   ██║██║███████╗██║   ██║     ██║██║
██╔═██╗ ██║   ██║██║╚════██║██║   ██║██   ██║██║
██║  ██╗╚██████╔╝██║███████║╚██████╔╝╚█████╔╝██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝╚══════╝ ╚═════╝  ╚════╝ ╚═╝`;
const formatList = (items) => items.map((item) => `- ${item}`).join('\n');

const noteFiles = import.meta.glob('../assets/pdf/notes/*.pdf', {
  eager: true,
  import: 'default'
});

const formatNoteTitle = (name) => {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    .replace(/\(/g, ' (')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const notes = Object.keys(noteFiles)
  .map((path) => {
    const filename = path.split('/').pop().replace(/\.pdf$/i, '');
    return formatNoteTitle(filename);
  })
  .sort((a, b) => a.localeCompare(b));

const orderByList = (repos, repoNames) => {
  if (!repoNames?.length) return [];
  const order = new Map(repoNames.map((name, index) => [name.toLowerCase(), index]));
  return repos
    .filter((repo) => order.has((repo.full_name || '').toLowerCase()))
    .sort((a, b) => order.get(a.full_name.toLowerCase()) - order.get(b.full_name.toLowerCase()));
};

const terminalProjects = (() => {
  const all = [...(projectsMeta.personal || []), ...(projectsMeta.didactic || [])];
  if (!all.length) return [];
  return [
    ...orderByList(all, projectLists.personal),
    ...orderByList(all, projectLists.didactic)
  ];
})();

const availableGames = ['snake', 'tetris'];
const gameLabels = {
  snake: 'Snake',
  tetris: 'Tetris'
};

const TerminalShell = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeGame, setActiveGame] = useState(null);

  const commands = useMemo(
    () => [
      'help',
      'about',
      'skills',
      'projects',
      'notes',
      'game',
      'ls',
      'clear',
      'quit',
      'github',
      'linkedin',
      'email'
    ],
    []
  );

  const output = useMemo(() => {
    return history.map((entry, index) => (
      <div className={`terminal-line ${entry.type}`} key={`${entry.type}-${index}`}>
        {entry.content}
      </div>
    ));
  }, [history]);

  const pushOutput = (content, type = 'output') => {
    setHistory((prev) => [...prev, { content, type }]);
  };

  const renderSkillLine = (items) => {
    if (!items?.length) return 'No skills available.';

    return (
      <span>
        {items.map((skill, skillIndex) => (
          <span key={`${skill.name}-${skillIndex}`}>
            <span className="terminal-accent">{skill.name}</span>: {skill.level ?? 0}
            {skillIndex < items.length - 1 ? ' | ' : ''}
          </span>
        ))}
      </span>
    );
  };

  const launchGame = (name) => {
    setActiveGame(name);
    pushOutput(`Launching ${gameLabels[name]}... Press Esc to exit.`);
  };

  const runCommand = (raw) => {
    const [cmd, ...args] = raw.trim().split(' ');
    const command = cmd.toLowerCase();
    const argument = args.join(' ').trim();

    if (!command) return;

    switch (command) {
      case 'help':
        pushOutput(`Available commands:\n${formatList(commands)}`);
        pushOutput('Game usage: game | game snake | game tetris');
        break;
      case 'about':
        pushOutput(`${about.bio}`);
        pushOutput(`Focus:\n${formatList(about.focus)}`);
        break;
      case 'skills':
        skillGroups.forEach((group, index) => {
          pushOutput(
            <span className="terminal-accent terminal-accent--bold terminal-accent--title">
              {group.title}
            </span>
          );
          pushOutput(renderSkillLine(group.items));
          if (index < skillGroups.length - 1) {
            pushOutput('');
          }
        });
        break;
      case 'projects':
        if (!terminalProjects.length) {
          pushOutput('No projects available.');
          break;
        }

        terminalProjects.forEach((project, index) => {
          const title = project.readmeTitle || project.name || 'Untitled';
          const description =
            project.readmeDescription || project.description || 'No description yet.';
          const technologies = (project.languages || []).length
            ? project.languages.join(' | ')
            : 'n/a';

          pushOutput(
            <span className="terminal-accent terminal-accent--bold terminal-accent--title">
              {title}
            </span>
          );
          pushOutput(`  ${description}`);
          pushOutput(
            <span>
              <span className="terminal-accent">  technologies:</span> {technologies}
            </span>
          );

          if (index < terminalProjects.length - 1) {
            pushOutput('');
          }
        });
        break;
      case 'notes':
        pushOutput(notes.length ? notes.join('\n') : 'No notes available.');
        break;
      case 'game': {
        const selected = argument.toLowerCase();
        if (!selected) {
          const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
          launchGame(randomGame);
          break;
        }

        if (!availableGames.includes(selected)) {
          pushOutput(`Unknown game: ${selected}`);
          pushOutput(`Available games: ${availableGames.join(', ')}`);
          break;
        }

        launchGame(selected);
        break;
      }
      case 'github':
        window.open(terminalContacts.github, '_blank', 'noreferrer');
        pushOutput('Opening GitHub profile...');
        break;
      case 'linkedin':
        window.open(terminalContacts.linkedin, '_blank', 'noreferrer');
        pushOutput('Opening LinkedIn profile...');
        break;
      case 'email':
        window.open(terminalContacts.email, '_blank', 'noreferrer');
        pushOutput('Opening email client...');
        break;
      case 'ls':
        pushOutput('about  skills  projects  notes  contacts');
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'quit':
        pushOutput('Exiting terminal...');
        setTimeout(() => navigate('/'), 150);
        break;
      default:
        if (argument && command === 'open') {
          pushOutput(`Unknown target: ${argument}`);
        } else {
          pushOutput(`Command not found: ${command}`);
        }
        break;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (activeGame) return;
    const value = input.trim();
    if (!value) return;

    setInput('');
    setHistoryIndex(-1);
    pushOutput(`${prompt}$ ${value}`, 'command');
    runCommand(value);
    setCommandHistory((prev) => [...prev, value]);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = historyIndex < 0 ? commandHistory.length - 1 : historyIndex - 1;
      if (nextIndex >= 0) {
        setInput(commandHistory[nextIndex] || '');
        setHistoryIndex(nextIndex);
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setInput('');
        setHistoryIndex(-1);
      } else {
        setInput(commandHistory[nextIndex] || '');
        setHistoryIndex(nextIndex);
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!activeGame) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveGame(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame]);

  useEffect(() => {
    if (!activeGame) {
      inputRef.current?.focus();
    }
  }, [activeGame]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="terminal-shell" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-shell__bar">
        <span className="terminal-shell__dot terminal-shell__dot--red" />
        <span className="terminal-shell__dot terminal-shell__dot--yellow" />
        <span className="terminal-shell__dot terminal-shell__dot--green" />
        <span className="terminal-shell__title">/terminal</span>
      </div>
      <div className="terminal-shell__body" ref={scrollRef}>
        <pre className="terminal-line output">{nameArt}</pre>
        <div className="terminal-line output">
          Welcome. Type <span className="terminal-accent">help</span> to start or <span className="terminal-accent">quit</span> to exit.
        </div>
        {output}
      </div>
      <form className="terminal-shell__input" onSubmit={handleSubmit}>
        <span className="terminal-prompt">{prompt}$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={Boolean(activeGame)}
          spellCheck="false"
          autoComplete="off"
        />
      </form>
      {activeGame && (
        <div className="terminal-game-overlay" role="dialog" aria-live="polite">
          <div className="terminal-game-card">
            <div className="terminal-game-card__title">
              {gameLabels[activeGame]}
              <span className="terminal-game-card__hint">Press Esc to exit</span>
            </div>
            {activeGame === 'snake' && <SnakeGame />}
            {activeGame === 'tetris' && <TetrisGame />}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalShell;
