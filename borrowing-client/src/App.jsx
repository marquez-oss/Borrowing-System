import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8000";

const getXsrfToken = async () => {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));

  return match ? decodeURIComponent(match.split("=")[1]) : "";
};

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // I-check kung may active session pa kapag nag-refresh
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch {
        // Walang active session o hindi pa naka-start ang API
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Pakilagay ang email at password.");
      return;
    }

    setLoading(true);
    try {
      const xsrfToken = await getXsrfToken();
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.user?.role !== "super admin") {
        setError("Ang account na ito ay hindi super admin.");
        setLoading(false);
        return;
      }

      setUser(data.user);
      setPassword("");
    } catch {
      setError("Hindi ma-reach ang Laravel server (127.0.0.1:8000).");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const xsrfToken = await getXsrfToken();
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
      });
    } catch {
      // Kahit mag-error sa network, i-clear pa rin ang frontend state
    } finally {
      setUser(null);
      setEmail("");
      setPassword("");
      setError("");
    }
  };

  if (user && user.role === "super admin") {
    return (
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-top">
            <h2 className="brand">Borrowing System</h2>
            <p className="role-badge">Super Admin</p>

            <nav className="nav-menu">
              <button type="button" className="nav-item active">
                Dashboard
              </button>
            </nav>
          </div>

          <div className="sidebar-bottom">
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <h1>Dashboard</h1>
          <p>
            Welcome,{" "}
            <strong>
              {user.first_name} {user.last_name}
            </strong>{" "}
            ({user.email})
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Login</h1>
        <p className="subtitle">Super Admin Access</p>

        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="superadmin@test.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default App;

/*import axios from 'axios'
import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  //Gemini code from line 10 to 24
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loginMessage, setLoginMessage] = useState('')

const handleLogin = async (e) => {
  e.preventDefault()
  try {
    // Dito natin kokonektahin sa Laravel API mamaya
    setLoginMessage("Sinusubukang mag-login...")
    console.log("Login data:", { email, password })
  } catch (error) {
    setLoginMessage("May error sa pag-login.")
  }
}

//Gemini code from line 29 to 58
  return (
    <>
    <div style={{ marginTop: '30px', padding: '20px', background: '#fff', borderRadius: '8px', color: '#000', maxWidth: '400px', margin: '0 auto' }}>
  <h3>Borrowing System Login</h3>
  {loginMessage && <p style={{ color: 'blue' }}>{loginMessage}</p>}
  <form onSubmit={handleLogin}>
    <div style={{ marginBottom: '10px', textAlign: 'left' }}>
      <label>Email:</label>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
        style={{ width: '100%', padding: '5px' }}
      />
    </div>
    <div style={{ marginBottom: '10px', textAlign: 'left' }}>
      <label>Password:</label>
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
        style={{ width: '100%', padding: '5px' }}
      />
    </div>
    <button type="submit" style={{ padding: '8px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
      Login
    </button>
  </form>
</div>

      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App*/
