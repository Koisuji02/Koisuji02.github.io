import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  about,
  notes,
  terminalContacts,
  terminalProjects,
  terminalSkills
} from '../data/siteData';

const prompt = 'koisuji@dev ';
const nameArt = `██╗  ██╗ ██████╗ ██╗███████╗██╗   ██╗     ██╗██╗
██║ ██╔╝██╔═══██╗██║██╔════╝██║   ██║     ██║██║
█████╔╝ ██║   ██║██║███████╗██║   ██║     ██║██║
██╔═██╗ ██║   ██║██║╚════██║██║   ██║██   ██║██║
██║  ██╗╚██████╔╝██║███████║╚██████╔╝╚█████╔╝██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝╚══════╝ ╚═════╝  ╚════╝ ╚═╝`;
const formatList = (items) => items.map((item) => `- ${item}`).join('\n');

const TerminalShell = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const commands = useMemo(
    () => [
      'help',
      'about',
      'whoami',
      'skills',
      'projects',
      'notes',
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

  const runCommand = (raw) => {
    const [cmd, ...args] = raw.trim().split(' ');
    const command = cmd.toLowerCase();
    const argument = args.join(' ').trim();

    if (!command) return;

    switch (command) {
      case 'help':
        pushOutput(
          `Available commands:\n${formatList(commands)}`
        );
        break;
      case 'about':
      case 'whoami':
        pushOutput(`${about.title}\n${about.bio}`);
        pushOutput(`Focus:\n${formatList(about.focus)}`);
        break;
      case 'skills':
        pushOutput(`Skills:\n${formatList(terminalSkills)}`);
        break;
      case 'projects':
        pushOutput(
          terminalProjects
            .map((project) => `${project.name}\n  ${project.desc}\n  ${project.link}`)
            .join('\n\n')
        );
        break;
      case 'notes':
        pushOutput(
          notes.map((note) => `${note.label}\n  ${note.href}`).join('\n\n')
        );
        break;
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
    const value = input.trim();
    if (!value) return;

    pushOutput(`${prompt}$ ${value}`, 'command');
    runCommand(value);
    setCommandHistory((prev) => [...prev, value]);
    setInput('');
    setHistoryIndex(-1);
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
          spellCheck="false"
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default TerminalShell;
