import Link from 'next/link'
import { FaWhatsapp, FaGithub, FaReact, FaNodeJs, FaDatabase } from 'react-icons/fa'
import { SiVercel, SiOpenai } from 'react-icons/si'
import { BsCpu, BsGrid1X2, BsPeople, BsChatText, BsCloudUpload, BsGear, BsMoon, BsBell, BsPlayCircle, BsMic, BsShieldCheck, BsFolder2Open } from 'react-icons/bs'
import { TbCodeCircle, TbActivity, TbMessageCircle2, TbBolt, TbBox, TbWorldWww } from 'react-icons/tb'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="cinematic-dashboard">
      {/* Animated Grid & Cyber Lines */}
      <div className="cyber-grid-bg"></div>
      
      {/* Glowing Particles */}
      <div className="particles-layer">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>

      {/* Header */}
      <header className="cinematic-header">
        <div className="header-left">
          <div className="logo-icon">
            <BsCpu />
          </div>
          <span className="logo-text logo">Sandeep Clone</span>
          <span className="badge-aios">AI OS</span>
        </div>

        <nav className="header-center">
          <Link href="/dashboard" className="nav-pill active">
            <BsGrid1X2 /> Dashboard
          </Link>
          <Link href="/clients" className="nav-pill">
            <BsPeople /> Clients
          </Link>
          <Link href="/chat" className="nav-pill">
            <BsChatText /> AI Chat
          </Link>
          <Link href="/upload" className="nav-pill">
            <BsCloudUpload /> Upload
          </Link>
          <Link href="/settings" className="nav-pill">
            <BsGear /> Settings
          </Link>
        </nav>

        <div className="header-right">
          <button className="icon-btn"><BsMoon /></button>
          <button className="icon-btn relative">
            <BsBell />
            <span className="notification-dot">3</span>
          </button>
          <div className="user-avatar-wrapper">
             {/* Using a placeholder avatar since I don't have the user's image URL locally, or we can use the uploaded one later */}
             <div className="avatar-circle">
               <img src="https://ui-avatars.com/api/?name=Sandeep&background=random&color=fff" alt="User" />
             </div>
             <span className="active-dot"></span>
          </div>
          <Link href="/dashboard" className="btn-gradient-primary">
            Open System &rarr;
          </Link>
        </div>
      </header>

      {/* Main Content Layout: Left (Orbital/Hero) | Right (HUD Panels) */}
      <main className="cinematic-main">
        
        {/* Left Section - Hero & Globe */}
        <div className="hero-section">
           <div className="hero-text-container">
             <div className="hero-kicker">AI POWERED. AUTOMATION DRIVEN. FUTURE READY.</div>
             <h1 className="heading cinematic-heading">
               YOUR PERSONAL<br />
               <span className="text-gradient">AI OPERATING SYSTEM</span>
             </h1>
             <p className="hero-subtitle">
               Control WhatsApp, Clients, AI Agents, Voice Commands<br/>
               and Business Automation from one intelligent dashboard.
             </p>
             <div className="hero-cta-group">
               <button className="btn-launch">
                 Launch AI Clone &rarr;
               </button>
               <button className="btn-demo">
                 <BsPlayCircle /> Watch Demo
               </button>
             </div>
           </div>

           <div className="orbital-network-cinematic">
              <div className="globe-sphere-cinematic"></div>
              
              {/* Orbits */}
              <div className="ring-c ring-c-1"></div>
              <div className="ring-c ring-c-2"></div>
              <div className="ring-c ring-c-3"></div>

              {/* Central AI Node */}
              <div className="center-node-c">
                <div className="center-icon-c">AI</div>
                <div className="glow-pulse-c"></div>
              </div>

              {/* Orbit Nodes */}
              <div className="orbit-node-c pos-whatsapp-c">
                <div className="icon-box-c bg-green-c"><FaWhatsapp /></div>
                <div className="node-info-c">
                  <span className="node-title-c">WhatsApp</span>
                  <span className="node-sub-c text-green-c">Connected</span>
                </div>
              </div>

              <div className="orbit-node-c pos-api-c">
                <div className="icon-box-c bg-orange-c"><TbCodeCircle /></div>
                <div className="node-info-c">
                  <span className="node-title-c">API</span>
                  <span className="node-sub-c">Integrations</span>
                </div>
              </div>

              <div className="orbit-node-c pos-vercel-c">
                <div className="icon-box-c bg-dark-c"><SiVercel /></div>
                <div className="node-info-c">
                  <span className="node-title-c">Vercel</span>
                  <span className="node-sub-c">Deployment</span>
                </div>
              </div>

              <div className="orbit-node-c pos-node-c">
                <div className="icon-box-c bg-green-c"><FaNodeJs /></div>
                <div className="node-info-c">
                  <span className="node-title-c">Node.js</span>
                  <span className="node-sub-c">Backend</span>
                </div>
              </div>
              
              <div className="orbit-node-c pos-database-c">
                <div className="icon-box-c bg-pink-c"><FaDatabase /></div>
                <div className="node-info-c">
                  <span className="node-title-c">Database</span>
                  <span className="node-sub-c">Secure</span>
                </div>
              </div>

              <div className="orbit-node-c pos-voice-c">
                <div className="icon-box-c bg-blue-c"><BsMic /></div>
                <div className="node-info-c">
                  <span className="node-title-c">Voice AI</span>
                  <span className="node-sub-c">Commands</span>
                </div>
              </div>

              <div className="orbit-node-c pos-aimodels-c">
                <div className="icon-box-c bg-purple-c"><SiOpenai /></div>
                <div className="node-info-c">
                  <span className="node-title-c">AI Models</span>
                  <span className="node-sub-c">OpenAI</span>
                </div>
              </div>

              <div className="orbit-node-c pos-react-c">
                <div className="icon-box-c bg-blue-c"><FaReact /></div>
                <div className="node-info-c">
                  <span className="node-title-c">React</span>
                  <span className="node-sub-c">Frontend</span>
                </div>
              </div>

              <div className="orbit-node-c pos-github-c">
                <div className="icon-box-c bg-dark-c"><FaGithub /></div>
                <div className="node-info-c">
                  <span className="node-title-c">GitHub</span>
                  <span className="node-sub-c">Repository</span>
                </div>
              </div>
           </div>
        </div>

        {/* Right Section - HUD Panels */}
        <div className="hud-panel-section">
          
          {/* System Status HUD */}
          <div className="hud-card system-status">
            <div className="hud-header">
              <TbActivity className="hud-icon text-blue-c" />
              <span>SYSTEM STATUS</span>
            </div>
            <div className="hud-overall-status">
              <div className="status-indicator">
                <span className="dot-green"></span>
              </div>
              <div className="status-text">
                <div className="status-main">All Systems Operational</div>
                <div className="status-sub">99.9% Uptime</div>
              </div>
            </div>

            <div className="hud-progress-group">
              <div className="progress-item">
                <div className="progress-labels"><span>AI Engine</span><span>100%</span></div>
                <div className="progress-bar-bg"><div className="progress-fill fill-green"></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>WhatsApp Sync</span><span>100%</span></div>
                <div className="progress-bar-bg"><div className="progress-fill fill-blue"></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>Database</span><span>98%</span></div>
                <div className="progress-bar-bg"><div className="progress-fill fill-purple"></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>API Services</span><span>100%</span></div>
                <div className="progress-bar-bg"><div className="progress-fill fill-orange"></div></div>
              </div>
              <div className="progress-item">
                <div className="progress-labels"><span>Voice System</span><span>100%</span></div>
                <div className="progress-bar-bg"><div className="progress-fill fill-cyan"></div></div>
              </div>
            </div>
          </div>

          {/* AI Assistant HUD */}
          <div className="hud-card ai-assistant">
             <div className="hud-header">
               <TbActivity className="hud-icon text-blue-c" />
               <span>AI ASSISTANT</span>
             </div>
             
             <div className="waveform-container">
               {/* Animated bars */}
               <div className="bar b1"></div><div className="bar b2"></div><div className="bar b3"></div>
               <div className="bar b4"></div><div className="bar b5"></div><div className="bar b4"></div>
               <div className="bar b3"></div><div className="bar b2"></div><div className="bar b1"></div>
             </div>
             
             <div className="ai-status-text">
               <div className="listen-text text-gradient">Listening...</div>
               <div className="prompt-text">How can I assist you today?</div>
             </div>

             <button className="btn-speak-now">
                <BsMic className="text-purple-c" /> Speak Now
             </button>
          </div>

        </div>
      </main>

      {/* Bottom Data Cards (5 large ones with sparklines) */}
      <section className="data-cards-section">
         <div className="data-card">
           <div className="data-card-top">
             <div className="data-card-icon circle-blue-c"><BsPeople /></div>
             <div className="data-card-stats">
               <div className="d-val">1,248</div>
               <div className="d-label">Active Clients</div>
             </div>
             <div className="d-badge up">&uarr; 12.5%</div>
           </div>
           <svg className="sparkline spark-blue" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,20 L10,15 L20,18 L30,5 L40,10 L50,2 L60,8 L70,4 L80,12 L90,2 L100,20" fill="none" strokeWidth="2" />
           </svg>
         </div>

         <div className="data-card">
           <div className="data-card-top">
             <div className="data-card-icon circle-purple-c"><TbMessageCircle2 /></div>
             <div className="data-card-stats">
               <div className="d-val">3,562</div>
               <div className="d-label">AI Conversations</div>
             </div>
             <div className="d-badge up">&uarr; 18.6%</div>
           </div>
           <svg className="sparkline spark-purple" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,20 L10,10 L20,15 L30,8 L40,12 L50,4 L60,6 L70,2 L80,8 L90,1 L100,20" fill="none" strokeWidth="2" />
           </svg>
         </div>

         <div className="data-card">
           <div className="data-card-top">
             <div className="data-card-icon circle-green-c"><TbBox /></div>
             <div className="data-card-stats">
               <div className="d-val">28</div>
               <div className="d-label">Connected Platforms</div>
             </div>
             <div className="d-badge up">&uarr; 8.3%</div>
           </div>
           <svg className="sparkline spark-green" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,20 L10,18 L20,14 L30,16 L40,8 L50,12 L60,4 L70,5 L80,2 L90,1 L100,20" fill="none" strokeWidth="2" />
           </svg>
         </div>

         <div className="data-card">
           <div className="data-card-top">
             <div className="data-card-icon circle-orange-c"><TbBolt /></div>
             <div className="data-card-stats">
               <div className="d-val">12,458</div>
               <div className="d-label">AI Requests Today</div>
             </div>
             <div className="d-badge up">&uarr; 23.1%</div>
           </div>
           <svg className="sparkline spark-orange" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,20 L10,12 L20,5 L30,10 L40,2 L50,8 L60,1 L70,5 L80,4 L90,2 L100,20" fill="none" strokeWidth="2" />
           </svg>
         </div>

         <div className="data-card">
           <div className="data-card-top">
             <div className="data-card-icon circle-cyan-c"><TbActivity /></div>
             <div className="data-card-stats">
               <div className="d-val">486</div>
               <div className="d-label">Voice Commands</div>
             </div>
             <div className="d-badge up">&uarr; 15.2%</div>
           </div>
           <svg className="sparkline spark-cyan" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,20 L10,15 L20,12 L30,18 L40,10 L50,4 L60,6 L70,2 L80,8 L90,3 L100,20" fill="none" strokeWidth="2" />
           </svg>
         </div>
      </section>

      {/* Feature Cards Grid (Bottom row) */}
      <section className="feature-cards-grid">
         <div className="feat-card">
            <div className="feat-icon circle-green-c"><FaWhatsapp /></div>
            <div className="feat-info">
              <div className="feat-title">WhatsApp Automation</div>
              <div className="feat-sub">Sync chats, contacts & groups in real-time</div>
            </div>
         </div>
         <div className="feat-card">
            <div className="feat-icon circle-purple-c"><BsCpu /></div>
            <div className="feat-info">
              <div className="feat-title">AI Chat & Agents</div>
              <div className="feat-sub">Smart AI agents for support, sales and automation</div>
            </div>
         </div>
         <div className="feat-card">
            <div className="feat-icon circle-cyan-c"><BsMic /></div>
            <div className="feat-info">
              <div className="feat-title">Voice Assistant</div>
              <div className="feat-sub">Control your system with voice commands</div>
            </div>
         </div>
         <div className="feat-card">
            <div className="feat-icon circle-pink-c"><TbWorldWww /></div>
            <div className="feat-info">
              <div className="feat-title">Website Builder</div>
              <div className="feat-sub">Build and deploy websites instantly with AI</div>
            </div>
         </div>
         <div className="feat-card">
            <div className="feat-icon circle-orange-c"><BsFolder2Open /></div>
            <div className="feat-info">
              <div className="feat-title">File & Data Manager</div>
              <div className="feat-sub">Manage files, documents and data securely</div>
            </div>
         </div>
         <div className="feat-card">
            <div className="feat-icon circle-green-c"><BsShieldCheck /></div>
            <div className="feat-info">
              <div className="feat-title">Approval System</div>
              <div className="feat-sub">Smart approval workflow and notifications</div>
            </div>
         </div>
      </section>

    </div>
  )
}
