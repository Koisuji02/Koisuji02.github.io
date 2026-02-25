import '../styles/home.css';
import { Link } from 'react-router-dom';
import SkillsGrid from '../components/SkillsGrid';
import RepoViewer from '../components/RepoViewer';
import { about } from '../data/siteData';
import TypewriterTitle from '../components/TypewriterTitle';
import cvPdf from '../assets/pdf/cv.pdf';

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

const notes = Object.entries(noteFiles)
  .map(([path, url]) => {
    const filename = path.split('/').pop().replace(/\.pdf$/i, '');
    return {
      title: formatNoteTitle(filename),
      url
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

const Home = () => {
  return (
    <div className="home">
      <header className="nav">
        <div className="nav__brand">koisuji.dev</div>
        <nav className="nav__links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#notes">Notes</a>
          <Link className="nav__terminal" to="/terminal">
            Terminal
          </Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__content">
          <p className="hero__eyebrow">Fullstack + DevOps + Data + Game Dev </p>
             <TypewriterTitle
               texts={[
                 'Hello World!',
                 'Hola Mundo!',
                 'Bonjour Monde!',
                 'Ciao Mondo!',
                 'Hallo Welt!',
                 'Witaj Swiecie!',
                 'Ola Mundo!'
               ]}
               speed={95}
               deleteSpeed={50}
               pause={1400}
             />
          <p className="hero__subtitle">
            I'm Mattia Domizio, a curious developer who enjoys building and learning new things. You can find here some information about me and some of my projects. Feel free to contact me if you want to collaborate or just say hi!
            <span className="hero__ps">
              <br />
              <em>
                P.S. If you're courageous enough, try the{' '}
                <Link className="hero__ps-link" to="/terminal">terminal mode</Link>
                {' '}for a more... immersive experience.
              </em>
            </span>
          </p>
          <div className="hero__cta">
            <a className="btn btn--bubble" href="#projects">See Projects</a>
            <a className="btn btn--ghost" href={cvPdf} target="_blank" rel="noreferrer">
              Open CV
            </a>
          </div>
        </div>

        <div className="hero__card">
          <div className="hero__card-top">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
            <span className="hero__card-title">/terminal</span>
          </div>
          <div className="hero__terminal">
            <pre className="hero__terminal-art">
{`██╗  ██╗ ██████╗ ██╗███████╗██╗   ██╗     ██╗██╗
██║ ██╔╝██╔═══██╗██║██╔════╝██║   ██║     ██║██║
█████╔╝ ██║   ██║██║███████╗██║   ██║     ██║██║
██╔═██╗ ██║   ██║██║╚════██║██║   ██║██   ██║██║
██║  ██╗╚██████╔╝██║███████║╚██████╔╝╚█████╔╝██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝╚══════╝ ╚═════╝  ╚════╝ ╚═╝`}
            </pre>
            <div className="hero__terminal-line">
              <span>Welcome. Type </span>
              <span className="terminal-accent">help</span>
              <span> to start or </span>
              <span className="terminal-accent">quit</span>
              <span> to exit.</span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="section about">
        <div className="section__title">
          <h2>About</h2>
        </div>
        <p>{about.bio}</p>
      </section>
      <section id="skills" className="section skills">
        <div className="section__title">
          <h2>Skills</h2>
        </div>
        <SkillsGrid />
      </section>

      <section id="projects" className="section projects">
        <div className="section__title">
          <h2>Projects</h2>
        </div>
        <RepoViewer username="Koisuji02" />
      </section>

      <section id="notes" className="section notes">
        <div className="section__title">
          <h2>Notes</h2>
          <p>Click a note to open it!</p>
        </div>
        <div className="notes__bubble-wrap">
          {notes.map((note) => (
            <a
              className="note-bubble"
              key={note.title}
              href={note.url}
              target="_blank"
              rel="noreferrer"
            >
              {note.title}
            </a>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>TODO: insert white social icons at center of screen with glowing on hovering</p>
      </footer>
    </div>
  );
};

export default Home;